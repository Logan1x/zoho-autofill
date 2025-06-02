document.addEventListener("DOMContentLoaded", function () {
	const fillBtn = document.getElementById("fillBtn");
	const status = document.getElementById("status");

	function showStatus(message, type = "info") {
		status.textContent = message;
		status.className = `status ${type}`;
		status.style.display = "block";

		// Hide status after 5 seconds
		setTimeout(() => {
			status.style.display = "none";
		}, 5000);
	}

	fillBtn.addEventListener("click", async function () {
		try {
			fillBtn.disabled = true;
			fillBtn.textContent = "Processing...";
			showStatus("Checking if you're on the correct page...", "info");

			// Get the active tab
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});

			// Check if we're on the right domain
			if (!tab.url.includes("peopleplus.zoho.in")) {
				showStatus(
					"Please navigate to your Zoho timesheet page first!",
					"error"
				);
				return;
			}

			// Execute the script
			const results = await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: fillFirstRowOnly,
			});

			if (results && results[0] && results[0].result) {
				const result = results[0].result;
				if (result.success) {
					showStatus(
						`Success! Filled ${result.filledCount} entries, skipped ${result.skippedCount}`,
						"success"
					);
				} else {
					showStatus(result.message || "Failed to fill timesheet", "error");
				}
			} else {
				showStatus("Script executed - check the console for details", "info");
			}
		} catch (error) {
			console.error("Error:", error);
			showStatus("Error: " + error.message, "error");
		} finally {
			fillBtn.disabled = false;
			fillBtn.textContent = "Fill First Row Timesheet";
		}
	});

	// The main function from your script, modified to return results
	function fillFirstRowOnly() {
		try {
			// Prompt user for month input (1-12)
			let monthInput;
			do {
				monthInput = prompt(
					"Enter month number (1-12):",
					new Date().getMonth() + 1 // Default to current month
				);
				// Handle potential cancel/null input
				if (monthInput === null) {
					console.log("Operation cancelled by user.");
					return { success: false, message: "Operation cancelled by user" };
				}
				monthInput = parseInt(monthInput);
			} while (isNaN(monthInput) || monthInput < 1 || monthInput > 12);

			// Adjust month to 0-based index
			const targetMonth = monthInput - 1;
			const targetYear = new Date().getFullYear();

			console.log(
				`Processing for month: ${monthInput} (${new Date(
					targetYear,
					targetMonth,
					1
				).toLocaleString("default", {
					month: "long",
				})}) ${targetYear} - Target: First Row Only`
			);

			// Select only the input elements within the first row
			const inputElements = document.querySelectorAll(
				'tr#monthrow1 input[type="text"][textinput="monthlyLog"][actualdate][date]'
			);

			if (inputElements.length === 0) {
				const message =
					"Could not find any matching input elements in the first row (tr#monthrow1). Check the selector and row ID.";
				console.warn(message);
				return { success: false, message };
			}

			let filledCount = 0;
			let processedCount = 0;
			let skippedCount = 0;

			for (let inputElement of inputElements) {
				const actualDateAttr = inputElement.getAttribute("actualdate");
				if (!actualDateAttr) continue;

				const date = new Date(actualDateAttr);
				if (isNaN(date.getTime())) {
					console.warn(
						`Skipping input with invalid date in first row: ${actualDateAttr}`
					);
					continue;
				}

				if (
					date.getMonth() !== targetMonth ||
					date.getFullYear() !== targetYear
				) {
					continue;
				}

				processedCount++;
				const td = inputElement.closest("td");

				if (!td) {
					console.warn(
						`Could not find parent TD for input in first row with date: ${actualDateAttr}`
					);
					continue;
				}

				const isNonWorkingDay = Array.from(td.classList).some((cls) =>
					cls.startsWith("lv_litbg")
				);

				if (!isNonWorkingDay) {
					if (
						inputElement.value === "" ||
						inputElement.value === "00:00" ||
						inputElement.placeholder === "00:00"
					) {
						inputElement.value = "09:00";
						filledCount++;

						const event = new Event("change", { bubbles: true });
						inputElement.dispatchEvent(event);

						console.log(
							`Filled input in first row for date: ${date.toLocaleDateString()}`
						);
					} else {
						console.log(
							`Skipped ${date.toLocaleDateString()} in first row (Already has value: ${
								inputElement.value
							})`
						);
						skippedCount++;
					}
				} else {
					const skipClasses = Array.from(td.classList)
						.filter((cls) => cls.startsWith("lv_litbg"))
						.join(", ");
					let reason = "Non-Working Day";
					if (td.classList.contains("lv_litbg1")) reason = "Holiday";
					else if (td.classList.contains("lv_litbg9")) reason = "Weekend";
					else if (td.classList.contains("lv_litbg7")) reason = "Leave";

					console.log(
						`Skipped ${date.toLocaleDateString()} in first row (${reason} - classes: ${skipClasses})`
					);
					skippedCount++;
				}
			}

			console.log("--- Processing Summary (First Row Only) ---");
			if (processedCount === 0) {
				const message = `No entries found for ${new Date(
					targetYear,
					targetMonth,
					1
				).toLocaleString("default", {
					month: "long",
				})} ${targetYear} in the first row.`;
				console.log(message);
				return { success: false, message };
			} else {
				console.log(
					`Total days processed in target month (first row): ${processedCount}`
				);
				console.log(`Working days filled/updated (first row): ${filledCount}`);
				console.log(
					`Days skipped (non-working or already filled) (first row): ${skippedCount}`
				);

				const monthName = new Date(targetYear, targetMonth, 1).toLocaleString(
					"default",
					{ month: "long" }
				);
				console.log(
					`Processing complete for ${monthName} ${targetYear} (first row)`
				);

				return {
					success: true,
					filledCount,
					skippedCount,
					processedCount,
					month: monthName,
					year: targetYear,
				};
			}
		} catch (error) {
			console.error("An error occurred during script execution:", error);
			return { success: false, message: "An error occurred: " + error.message };
		}
	}
});
