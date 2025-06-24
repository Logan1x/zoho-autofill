# Zoho Time-sheet Autofill Extension

A Chrome extension that helps automate the process of filling Zoho timesheets. The extension automatically fills "09:00" for working days in the first row of your timesheet while intelligently skipping weekends, holidays, and leaves.

## Features

- Automatically fills "09:00" for working days in the first row
- Intelligently skips:
  - Weekends
  - Holidays
  - Leave days
- Preserves existing entries (won't overwrite already filled times)
- User-friendly popup interface
- Month selection support
- Visual status updates

## Watch Demo video
[![Watch the video](https://cdn.loom.com/sessions/thumbnails/f7999761fa59403a8f78d12720b943b6-b73bcdec73ecfa5c-full-play.gif)](https://www.loom.com/share/f7999761fa59403a8f78d12720b943b6?sid=2ab36575-7adc-48e9-8aee-9fde95195e39)

## Installation

Since this extension is not available on the Chrome Web Store, you'll need to install it manually:

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the directory containing the extension files

## Usage

1. Navigate to your Zoho timesheet page (https://peopleplus.zoho.in)
2. Click the extension icon in your Chrome toolbar
3. Click "Fill First Row Timesheet"
4. Enter the month number (1-12) when prompted
5. The extension will automatically:
   - Fill "09:00" for working days
   - Skip weekends, holidays, and leave days
   - Preserve any existing entries
   - Show a summary of filled and skipped entries

## Permissions

The extension requires the following permissions:

- `activeTab`: To interact with the timesheet page
- `scripting`: To execute the filling script
- Access to `https://peopleplus.zoho.in/*`: To work with Zoho's timesheet system

## 📄 License

This project is licensed under the [MIT License](LICENSE).
