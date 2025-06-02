// Content script for Zoho Timesheet Extension
// This script runs on Zoho pages and can be used for additional functionality

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "checkPage") {
		// Check if we're on the correct page
		const isTimesheetPage =
			window.location.href.includes("timetracker") &&
			document.querySelector("tr#monthrow1") !== null;

		sendResponse({ isTimesheetPage });
	}
});

// Optional: Add visual indicators or shortcuts
// You can extend this to add keyboard shortcuts or visual enhancements
console.log("Zoho Timesheet Extension loaded");
