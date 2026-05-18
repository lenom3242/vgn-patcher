# VGN VHUB Keyboard Auto-Patcher

A utility designed to patch the [VGN VHUB](https://vgnlab.com/pages/vgn-hub) application to support the **ATK N75 PRO** keyboard natively (both wired and 2.4G wireless modes).

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

---

# Русский перевод

# Автопатчер клавиатуры для VGN VHUB

Утилита, разработанная для патчинга приложения [VGN VHUB](https://vgnlab.com/pages/vgn-hub) с целью нативной поддержки клавиатуры **ATK N75 PRO** (как в проводном режиме, так и в беспроводном режиме 2.4ГГц).

## 🔍 Как это работает

Приложение VGN VHUB имеет внутреннее ограничение на распознавание клавиатур по жестко заданным идентификаторам производителя (vendor ID) и продукта (product ID). Поскольку ATK N75 PRO фундаментально совместима с раскладкой N75 PRO, данная утилита:
1. Находит и создает резервную копию файла `app.asar` в папке `C:\Program Files\VGN VHUB\resources\`.
2. Распаковывает архив ASAR во временную директорию.
3. Добавляет дескрипторы сканирования для USB ID клавиатуры ATK N75 PRO (`VID: 14139`, `PID: 4510` и `4509`).
4. Обновляет логику распознавания и сопоставляет профили раскладки устройства с существующими ресурсами раскладки «VGN N75 PRO».
5. Упаковывает архив ASAR обратно и перезапускает VGN VHUB.

---

## 🚀 Использование

### Требования
- Установленный **Node.js** (необходим для работы движка патчера, а также для распаковки и упаковки Electron-файла ASAR).
- **Windows PowerShell** с правами администратора (необходим для остановки/запуска службы VGN VHUB и изменения файлов в директории `C:\Program Files`).

### Запуск патчера

1. Склонируйте или скачайте этот репозиторий на свой компьютер.
2. Нажмите правой кнопкой мыши по файлу `patch.ps1` и выберите **Выполнить с помощью PowerShell** (Run with PowerShell) или откройте консоль PowerShell от имени администратора в этой папке и выполните:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\patch.ps1
   ```
3. Скрипт автоматически запросит права администратора, остановит VGN VHUB, если приложение запущено, пропатчит файлы и запустит его снова!

---

## 🛠️ Откат / Восстановление

Если вам когда-либо понадобится вернуть VGN VHUB в исходное состояние:
1. Закройте VGN VHUB.
2. Перейдите в папку `C:\Program Files\VGN VHUB\resources\`.
3. Удалите пропатченный файл `app.asar`.
4. Переименуйте `app.asar.bak` to `app.asar`.
5. Снова запустите VGN VHUB.
