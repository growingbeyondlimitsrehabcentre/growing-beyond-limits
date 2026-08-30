/***************************************************************
 * GROWING BEYOND LIMITS
 * WEBSITE ENQUIRY → GOOGLE SHEET BACKEND
 *
 * Paste this code into the SAME Google Apps Script project
 * attached to your Appointment Tracker spreadsheet.
 *
 * Then deploy the project as:
 * Deploy → New deployment → Web app
 * Execute as: Me
 * Who has access: Anyone
 *
 * Copy the Web App URL into index.html:
 * GOOGLE_SCRIPT_URL
 ***************************************************************/

const ENQUIRY_SHEET_NAME = "Enquiries";
const ENQUIRY_ADMIN_EMAIL = "growingbeyondlimits3@gmail.com";
const ENQUIRY_TIME_ZONE = "Asia/Kolkata";

const ENQUIRY_HEADERS = [
  "Enquiry ID",
  "Timestamp",
  "Source",
  "Parent/Guardian",
  "Patient Name",
  "Age",
  "Phone",
  "Therapy",
  "Preferred Date",
  "Preferred Time",
  "Message",
  "Page URL",
  "Status"
];

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      throw new Error("No enquiry data received.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        throw new Error("Spreadsheet not found.");
      }

      const sheet = getOrCreateEnquirySheet_(ss);
      const p = e.parameter;

      const enquiryId = createEnquiryId_();
      const timestamp = new Date();

      const row = [
        enquiryId,
        timestamp,
        cleanCell_(p.source || "Website"),
        cleanCell_(p.parentName),
        cleanCell_(p.patientName),
        cleanCell_(p.age),
        cleanCell_(p.phone),
        cleanCell_(p.therapy),
        cleanCell_(p.preferredDate),
        cleanCell_(p.preferredTime),
        cleanCell_(p.message),
        cleanCell_(p.pageUrl),
        "New"
      ];

      sheet.appendRow(row);

      sendNewEnquiryEmail_(row);

      return jsonResponse_({
        success: true,
        enquiryId: enquiryId
      });
    } finally {
      lock.releaseLock();
    }

  } catch (error) {
    console.error(error);
    return jsonResponse_({
      success: false,
      error: error.message
    });
  }
}

function getOrCreateEnquirySheet_(ss) {
  let sheet = ss.getSheetByName(ENQUIRY_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(ENQUIRY_SHEET_NAME);
  }

  const headerRange = sheet.getRange(
    1,
    1,
    1,
    ENQUIRY_HEADERS.length
  );

  const existingHeaders = headerRange.getValues()[0];

  if (existingHeaders.join("|") !== ENQUIRY_HEADERS.join("|")) {
    headerRange.setValues([ENQUIRY_HEADERS]);
  }

  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange("B:B").setNumberFormat("dd/MM/yyyy hh:mm AM/PM");
  sheet.autoResizeColumns(1, ENQUIRY_HEADERS.length);

  return sheet;
}

function createEnquiryId_() {
  const stamp = Utilities.formatDate(
    new Date(),
    ENQUIRY_TIME_ZONE,
    "yyyyMMdd-HHmmss"
  );

  const random = Math.floor(100 + Math.random() * 900);
  return "ENQ-" + stamp + "-" + random;
}

function cleanCell_(value) {
  const text = String(value || "").trim();

  // Prevent form submissions from being interpreted as spreadsheet formulas.
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
}

function sendNewEnquiryEmail_(row) {
  const subject =
    "New Website Enquiry - " + row[4];

  const body =
    "GROWING BEYOND LIMITS\n" +
    "New Website Enquiry\n\n" +
    "----------------------------------------\n" +
    "Enquiry ID: " + row[0] + "\n" +
    "Received: " + Utilities.formatDate(row[1], ENQUIRY_TIME_ZONE, "dd MMM yyyy hh:mm a") + "\n" +
    "Source: " + row[2] + "\n" +
    "Parent/Guardian: " + row[3] + "\n" +
    "Patient: " + row[4] + "\n" +
    "Age: " + row[5] + "\n" +
    "Phone: " + row[6] + "\n" +
    "Therapy: " + row[7] + "\n" +
    "Preferred Date: " + row[8] + "\n" +
    "Preferred Time: " + row[9] + "\n\n" +
    "Message:\n" + row[10] + "\n\n" +
    "Page: " + row[11] + "\n" +
    "Status: New\n\n" +
    "Growing Beyond Limits Rehab Center";

  MailApp.sendEmail({
    to: ENQUIRY_ADMIN_EMAIL,
    subject: subject,
    body: body
  });
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional manual test from Apps Script.
 * This writes one sample enquiry into the Enquiries tab and sends
 * the same admin email used by real website submissions.
 */
function testWebsiteEnquiryBackend() {
  const sample = {
    parameter: {
      source: "Website Test",
      parentName: "Test Parent",
      patientName: "Test Patient",
      age: "5",
      phone: "9999999999",
      therapy: "Occupational Therapy",
      preferredDate: "2026-08-29",
      preferredTime: "03:00 PM",
      message: "Test website enquiry.",
      pageUrl: "https://growingbeyondlimitsrehabcentre.github.io/growing-beyond-limits/"
    }
  };

  doPost(sample);
}
