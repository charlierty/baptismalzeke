/**
 * RSVP backend for Zeke's Christening & First Birthday invitation.
 *
 * SETUP:
 * 1. Create a new Google Sheet (or open an existing one).
 * 2. Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click "Deploy" > "New deployment".
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Copy the Web app URL it gives you.
 * 6. Paste that URL into GOOGLE_SCRIPT_URL at the top of app.js
 *    in your GitHub Pages project, then commit/push.
 *
 * Every RSVP (attending or not) is appended as a new row to a sheet
 * named "RSVP" (it's created automatically the first time someone submits).
 */

const SHEET_NAME = "RSVP";

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const p = e.parameter;

  sheet.appendRow([
    new Date(),                 // Timestamp
    p.name || "",               // Guest name
    p.attending || "",          // "Yes" or "No"
    p.companions || "0",        // number of additional guests (0-2)
    p.companionNames || "",     // comma-separated companion names
    p.message || "",            // message left for the baby (decline flow)
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Attending",
      "Additional Guests",
      "Companion Names",
      "Message",
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Optional: lets you sanity-check the deployment by visiting the
 * Web app URL directly in a browser (a GET request).
 */
function doGet() {
  return ContentService
    .createTextOutput("Zeke's RSVP endpoint is live. POST requests only.")
    .setMimeType(ContentService.MimeType.TEXT);
}
