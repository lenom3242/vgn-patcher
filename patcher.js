const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Default target folder, can be customized via command-line arguments
const targetDir = process.argv[2] || 'C:\\Program Files\\VGN VHUB';
const resourcesDir = path.join(targetDir, 'resources');
const asarPath = path.join(resourcesDir, 'app.asar');
const backupPath = path.join(resourcesDir, 'app.asar.bak');

// Temporary folder in AppData for extraction
const tempExtractDir = path.join(process.env.TEMP || process.env.TMP || 'C:\\Windows\\Temp', 'vgn-patcher-temp-' + Date.now());

console.log('=== VGN VHUB Keyboard Auto-Patcher ===');
console.log(`Target directory: ${targetDir}`);
console.log(`ASAR Archive:     ${asarPath}`);

// 1. Verify ASAR exists
if (!fs.existsSync(asarPath)) {
  console.error(`[ERROR] VGN VHUB app.asar not found at ${asarPath}. Please verify installation path.`);
  process.exit(1);
}

// 2. Create Backup
if (!fs.existsSync(backupPath)) {
  console.log(`Creating safety backup: ${backupPath}...`);
  fs.copyFileSync(asarPath, backupPath);
  console.log('Backup created successfully.');
} else {
  console.log('Safety backup already exists, skipping backup creation.');
}

// 3. Extract ASAR
console.log(`Creating temporary extraction directory at: ${tempExtractDir}`);
fs.mkdirSync(tempExtractDir, { recursive: true });

console.log('Extracting app.asar... (This may take a moment)');
try {
  execSync(`npx -y @electron/asar extract "${asarPath}" "${tempExtractDir}"`, { stdio: 'inherit' });
} catch (err) {
  console.log('Failed extracting using @electron/asar, trying standard asar...');
  try {
    execSync(`npx -y asar extract "${asarPath}" "${tempExtractDir}"`, { stdio: 'inherit' });
  } catch (err2) {
    console.error('[ERROR] Failed to extract app.asar. Please ensure Node.js is installed and you have internet access for npx.');
    console.error(err2);
    process.exit(1);
  }
}

// 4. Find assets in dist/renderer/assets/
const assetsDir = path.join(tempExtractDir, 'dist', 'renderer', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error(`[ERROR] Assets directory not found in extracted app: ${assetsDir}`);
  cleanup();
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const homeFile = files.find(f => f.startsWith('home-') && f.endsWith('.js'));
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!homeFile || !indexFile) {
  console.error('[ERROR] Could not find the target asset files in dist/renderer/assets/');
  console.error(`Found files: ${files.slice(0, 10).join(', ')}...`);
  cleanup();
  process.exit(1);
}

const homeFilePath = path.join(assetsDir, homeFile);
const indexFilePath = path.join(assetsDir, indexFile);

console.log(`\nFound target asset files:`);
console.log(`- Home Asset:  ${homeFile}`);
console.log(`- Index Asset: ${indexFile}`);

// 5. Apply Patches
let patchedHome = false;
let patchedIndexCount = 0;

// --- PATCH HOME-*.JS ---
console.log(`\nPatching ${homeFile}...`);
let homeContent = fs.readFileSync(homeFilePath, 'utf8');

const homeRegex = /productName\s*===\s*(["'])VGN N75 PRO\1\s*\|\|\s*productName\s*===\s*(["'])VGN N75 PRO 2\.4G\2/;
if (homeRegex.test(homeContent)) {
  homeContent = homeContent.replace(homeRegex, 'productName === "VGN N75 PRO" || productName === "VGN N75 PRO 2.4G" || productName === "ATK N75 PRO" || productName === "ATK N75 PRO 2.4G"');
  fs.writeFileSync(homeFilePath, homeContent, 'utf8');
  console.log('-> Support for ATK N75 PRO name checks injected successfully.');
  patchedHome = true;
} else if (homeContent.includes('ATK N75 PRO')) {
  console.log('-> Already patched, skipping home asset.');
  patchedHome = true;
} else {
  console.error('[WARNING] Could not locate name check target in home asset. Already patched or structure changed.');
}

// --- PATCH INDEX-*.JS ---
console.log(`Patching ${indexFile}...`);
let indexContent = fs.readFileSync(indexFilePath, 'utf8');

// Target 1: Insert device scanner items (PIDs 4510 and 4509)
const scanListRegex = /productName\s*:\s*(["'])VGN N75 PRO 2\.4G Dongle\1\s*,\s*customDeviceController\s*:\s*(["'])deviceKeyboard\2\s*,\s*reportId\s*:\s*4\s*\}\s*,\s*\{\s*vendorId\s*:\s*12815\s*,/;
if (scanListRegex.test(indexContent)) {
  const newScanList = `productName: "VGN N75 PRO 2.4G Dongle",
        customDeviceController: "deviceKeyboard",
        reportId: 4
      },
      {
        vendorId: 14139,
        productId: 4510,
        path: "mi_01&col01",
        receiver: false,
        customDeviceType: "weisheng",
        productName: "VGN N75 PRO",
        customDeviceController: "deviceKeyboard",
        reportId: 4
      },
      {
        vendorId: 14139,
        productId: 4509,
        path: "mi_01&col01",
        receiver: true,
        customDeviceType: "weisheng",
        productName: "VGN N75 PRO 2.4G Dongle",
        customDeviceController: "deviceKeyboard",
        reportId: 4
      },
      {
        vendorId: 12815,`;
  indexContent = indexContent.replace(scanListRegex, newScanList);
  console.log('-> Support for ATK N75 PRO USB VID/PID scanner descriptors injected successfully.');
  patchedIndexCount++;
} else if (indexContent.includes('vendorId: 14139') && indexContent.includes('productId: 4510')) {
  console.log('-> Scanner descriptors already present, skipping.');
  patchedIndexCount++;
} else {
  console.error('[WARNING] Could not locate USB scanner target list in index asset.');
}

// Target 2: Insert keyboard recognition checks
const checkRegex = /VID\s*===\s*12815\s*&&\s*PID\s*===\s*20565\s*\|\|\s*VID\s*===\s*12815\s*&&\s*PID\s*===\s*20616\s*\|\|\s*VID\s*===\s*14139\s*&&\s*PID\s*===\s*4136\s*\|\|\s*VID\s*===\s*14139\s*&&\s*PID\s*===\s*4137/;
if (checkRegex.test(indexContent)) {
  indexContent = indexContent.replace(checkRegex, 'VID === 12815 && PID === 20565 || VID === 12815 && PID === 20616 || VID === 14139 && PID === 4136 || VID === 14139 && PID === 4137 || VID === 14139 && PID === 4510 || VID === 14139 && PID === 4509');
  console.log('-> Support for keyboard recognition checks injected successfully.');
  patchedIndexCount++;
} else if (indexContent.includes('PID === 4510') && indexContent.includes('PID === 4509')) {
  console.log('-> Keyboard checks already present, skipping.');
  patchedIndexCount++;
} else {
  console.error('[WARNING] Could not locate keyboard recognition check target in index asset.');
}

// Target 3: Append ATK N75 PRO metadata to wsDevices
const metadataRegex = /keyword\s*:\s*(["'])VGN N75 PRO\1\s*,\s*dongleName\s*:\s*(["'])VGN N75 PRO 2\.4G Dongle\2\s*,\s*title\s*:\s*(["'])vgn-N75Pro\3\s*,\s*cover\s*:\s*(["'])keyboard-n75ProJLBH\4\s*,\s*main\s*:\s*(["'])keyboard-n75ProJLBH-main\5\s*,\s*thumb\s*:\s*(["'])keyboard-n75ProJLBH-thumb\6\s*,\s*bg\s*:\s*(["'])keyboard-n75Pro-bg\7\s*\}\s*\]\s*;/;
if (metadataRegex.test(indexContent)) {
  const newMetadata = `keyword: "VGN N75 PRO",
        dongleName: "VGN N75 PRO 2.4G Dongle",
        title: "vgn-N75Pro",
        cover: "keyboard-n75ProJLBH",
        main: "keyboard-n75ProJLBH-main",
        thumb: "keyboard-n75ProJLBH-thumb",
        bg: "keyboard-n75Pro-bg"
      },
      {
        keyword: "ATK N75 PRO",
        dongleName: "ATK N75 PRO 2.4G Dongle",
        title: "vgn-N75Pro",
        cover: "keyboard-n75ProJLBH",
        main: "keyboard-n75ProJLBH-main",
        thumb: "keyboard-n75ProJLBH-thumb",
        bg: "keyboard-n75Pro-bg"
      }
    ];`;
  indexContent = indexContent.replace(metadataRegex, newMetadata);
  console.log('-> Support for ATK N75 PRO layout and device metadata injected successfully.');
  patchedIndexCount++;
} else if (indexContent.includes('keyword: "ATK N75 PRO"')) {
  console.log('-> Device layout metadata already present, skipping.');
  patchedIndexCount++;
} else {
  console.error('[WARNING] Could not locate device metadata array target in index asset.');
}

if (patchedHome && patchedIndexCount === 3) {
  fs.writeFileSync(indexFilePath, indexContent, 'utf8');
  console.log('\nAll patches successfully prepared!');
} else {
  console.error('\n[ERROR] One or more patches could not be applied. Check for version incompatibility.');
  cleanup();
  process.exit(1);
}

// 6. Repack ASAR
console.log('\nRepacking app.asar... (This may take a moment)');
try {
  execSync(`npx -y @electron/asar pack "${tempExtractDir}" "${asarPath}"`, { stdio: 'inherit' });
  console.log('[SUCCESS] app.asar repacked and written back successfully!');
} catch (err) {
  console.log('Failed repacking using @electron/asar, trying standard asar...');
  try {
    execSync(`npx -y asar pack "${tempExtractDir}" "${asarPath}"`, { stdio: 'inherit' });
    console.log('[SUCCESS] app.asar repacked and written back successfully!');
  } catch (err2) {
    console.error('[ERROR] Failed to repack app.asar.');
    console.error(err2);
    cleanup();
    process.exit(1);
  }
}

// 7. Cleanup
cleanup();
console.log('\n=== PATCHING PROCESS COMPLETE! ===\n');

function cleanup() {
  console.log(`Cleaning up temporary extraction folder: ${tempExtractDir}...`);
  try {
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
    console.log('Cleanup finished.');
  } catch (err) {
    console.warn(`[WARNING] Failed to completely delete temp directory ${tempExtractDir}:`, err.message);
  }
}
