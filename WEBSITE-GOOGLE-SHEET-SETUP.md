# Website → Google Sheet setup

## 1. Add the backend to your existing Apps Script

Open the Apps Script project attached to **Growing Beyond Limits – Appointment Tracker** and add the contents of `google-apps-script-enquiry-backend.gs`.

The backend creates an **Enquiries** tab automatically.

## 2. Deploy as a Web App

In Apps Script:

1. **Deploy → New deployment**
2. Select **Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone
5. Authorize the requested permissions.
6. Copy the Web App URL.

## 3. Put the Web App URL into the website

Open `index.html` and find:

`const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRPqWZ_7ZONDEhUsKzHEvwFbvfAGlVZIIA57jCayNgQIXwO8uB8-ZioL8Trt5ijHqp/exec";`

Replace the placeholder with the Web App URL.

## 4. Upload the updated website

Upload the updated `index.html` and `assets` folder to your GitHub Pages repository.

## What happens after setup

When a parent submits the appointment enquiry:

**Website form → Apps Script → Enquiries sheet → email to growingbeyondlimits3@gmail.com**

At the same time, WhatsApp opens with the enquiry details for quick communication.

The existing **Appointments** sheet and 24-hour reminder system are not changed.
