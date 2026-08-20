# Zeke's Christening & First Birthday — Invitation Web App

A mobile-first, single-page invitation site: **Invitation → Details of Reception → Dress Code → Gift Guide → RSVP**.
Guests who say "sorry, can't attend" are routed to a message screen instead of the 4-step flow.

## Files

```
index.html                     the whole app (all screens live in one page)
styles.css                     carnival/pastel design system
app.js                         screen navigation, RSVP logic, sends data to Google Sheets
images/
  zeke-waving.png               used on the invitation screen
  zeke-sitting.png              used on the decline & thank-you screens
google-apps-script/
  Code.gs                       paste into Google Apps Script — saves RSVPs to a Sheet
```

## 1. Set up the Google Sheet backend (do this first)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet — name it something like "Zeke RSVPs".
2. In the sheet, click **Extensions > Apps Script**.
3. Delete the placeholder `function myFunction() {...}` and paste in the entire contents of `google-apps-script/Code.gs`.
4. Click **Deploy > New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
6. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**. Google will ask you to authorize the script — approve it (it's your own script, just accessing your own sheet).
8. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

A new sheet tab called `RSVP` will be created automatically the first time someone submits the form, with columns: `Timestamp, Name, Attending, Additional Guests, Companion Names, Message`.

## 2. Connect the web app to your Sheet

Open `app.js` and replace the placeholder at the top:

```js
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with the URL you copied in step 1.8. Save the file.

## 3. Publish on GitHub Pages

1. Create a new GitHub repository (public or private, both work with Pages on a paid/edu plan — public is simplest).
2. Upload all the files in this folder (`index.html`, `styles.css`, `app.js`, the `images/` folder) to the repo — keep the same folder structure. You don't need to upload the `google-apps-script/` folder; that one only needs to live inside Apps Script itself.
3. In the repo, go to **Settings > Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. GitHub will give you a URL like `https://yourusername.github.io/your-repo-name/` — that's your live invitation link, ready to share with guests.

## How the RSVP flow works

- **Invitation screen** → "Yes I'll be there" moves the guest through Details → Dress Code → Gift Guide → RSVP, with a progress trail (1–4) at the top they can tap to jump between steps.
- **"Sorry, I won't be able to attend"** skips straight to a message screen where the guest can leave a note for Zeke — no reception details shown.
- **RSVP step**: guest enters their name, then uses the **+ / −** counter (starts at 0, capped at 2) to say how many people they're bringing. Each time they increase the count, a new name field appears for that companion.
- On submit, both flows (attending and declining) send their data to your Google Sheet via the Apps Script URL, using a background `fetch` request — no page reload, no visible redirect.

## Customizing

- **Colors / fonts**: all defined as CSS variables at the top of `styles.css` under `:root`.
- **Event details, gift list, dress code text**: edit directly inside `index.html` — each section is clearly commented (`<!-- SCREEN: ... -->`).
- **Max companions**: change `MAX_COMPANIONS` near the top of the RSVP section in `app.js` (currently `2`).
