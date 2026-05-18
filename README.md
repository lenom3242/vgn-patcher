# VGN VHUB Keyboard Auto-Patcher

A utility designed to patch the [VGN VHUB](https://game.vgn.club/download) application to support the **ATK N75 PRO** keyboard natively (both wired and 2.4G wireless modes).

## 🔍 How it Works

VGN VHUB internally restricts which keyboards are recognized using hardcoded vendor and product IDs. Since the ATK N75 PRO is fundamentally compatible with the N75 PRO layout, this utility:
1. Locates and backs up your `app.asar` file in `C:\Program Files\VGN VHUB\resources\`.
2. Extracts the ASAR archive to a temporary directory.
3. Injects scanner descriptors for ATK N75 PRO's USB IDs (`VID: 14139`, `PID: 4510` and `4509`).
4. Updates recognition logic and maps the device layout profiles to the existing "VGN N75 PRO" layout assets.
5. Repacks the ASAR archive and restarts VGN VHUB.

---

## 🚀 Usage

### Requirements
- **Node.js** installed on your system (needed for running the patching engine and extracting/repacking the electron ASAR file).
- **Windows PowerShell** with administrator privileges (needed to stop/start the VGN VHUB service and edit files in `C:\Program Files`).

### Running the Patcher

1. Clone or download this repository to your local machine.
2. Right-click on `patch.ps1` and choose **Run with PowerShell**, or open an elevated PowerShell prompt in this folder and run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\patch.ps1
   ```
3. The script will automatically request Admin access, stop VGN VHUB if it is running, patch the files, and relaunch it!

---

## 🛠️ Rollback / Restore

If you ever need to restore VGN VHUB to its original state:
1. Close VGN VHUB.
2. Navigate to `C:\Program Files\VGN VHUB\resources\`.
3. Delete the patched `app.asar`.
4. Rename `app.asar.bak` to `app.asar`.
5. Relaunch VGN VHUB.
