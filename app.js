/* =========================================================
   1. CONFIG — paste your deployed Google Apps Script URL here
   ========================================================= */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzN2_XNDESgoXVQV_DV0Ck6vavuVKDT4zvtVRsGgkQJbJbxIuoO1MwpqY2sLcFqcsP2/exec";

/* =========================================================
   2. BUNTING BANNER (signature element, drawn once)
   ========================================================= */
(function drawBunting(){
  const colors = ["#FFC1D6", "#FFDE84", "#ABE8CA", "#B9DDF3", "#D9C7F0", "#FF8C74"];
  const group = document.getElementById("bunting-flags");
  const flagW = 22, gap = 6, h = 26, y = 4;
  const total = 400;
  const count = Math.floor(total / (flagW + gap));
  const startX = (total - count * (flagW + gap) + gap) / 2;

  let svg = "";
  for (let i = 0; i < count; i++) {
    const x = startX + i * (flagW + gap);
    const c = colors[i % colors.length];
    svg += `<path d="M${x},${y} l${flagW},0 l${-flagW/2},${h} Z" fill="${c}" />`;
    svg += `<circle cx="${x}" cy="${y}" r="1.6" fill="#E8DCC8" />`;
  }
  group.innerHTML = svg;
})();

/* =========================================================
   3. SCREEN NAVIGATION
   ========================================================= */
const stepOrder = ["details", "dresscode", "gifts", "rsvp"];

function goto(name) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add("active");

  const trail = document.getElementById("trail");
  if (stepOrder.includes(name)) {
    trail.hidden = false;
    updateTrail(name);
  } else {
    trail.hidden = true;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTrail(current) {
  const idx = stepOrder.indexOf(current);
  document.querySelectorAll(".trail-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === idx);
    dot.classList.toggle("is-done", i < idx);
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-goto]");
  if (btn) goto(btn.dataset.goto);
});

document.getElementById("btn-yes").addEventListener("click", () => goto("details"));
document.getElementById("btn-no").addEventListener("click", () => goto("decline"));

/* =========================================================
   4. DECLINE / MESSAGE FORM
   ========================================================= */
document.getElementById("form-decline").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("decline-name").value.trim();
  const message = document.getElementById("decline-message").value.trim();

  submitToSheet({
    name,
    attending: "No",
    companions: "0",
    companionNames: "",
    message,
  });

  goto("decline-thanks");
});

/* =========================================================
   5. RSVP — COMPANION COUNTER (0 to 2)
   ========================================================= */
let companionCount = 0;
const MAX_COMPANIONS = 2;

const counterValueEl = document.getElementById("counter-value");
const minusBtn = document.getElementById("counter-minus");
const plusBtn = document.getElementById("counter-plus");
const companionListEl = document.getElementById("companion-list");

function renderCompanionFields() {
  companionListEl.innerHTML = "";
  for (let i = 1; i <= companionCount; i++) {
    const wrap = document.createElement("label");
    wrap.className = "field companion-field";
    wrap.innerHTML = `
      <span class="field-label">Guest ${i} name</span>
      <input type="text" class="companion-input" placeholder="e.g. Maria Dela Cruz" required />
    `;
    companionListEl.appendChild(wrap);
  }
  minusBtn.disabled = companionCount === 0;
  plusBtn.disabled = companionCount === MAX_COMPANIONS;
  counterValueEl.textContent = companionCount;
}

minusBtn.addEventListener("click", () => {
  if (companionCount > 0) {
    companionCount--;
    renderCompanionFields();
  }
});
plusBtn.addEventListener("click", () => {
  if (companionCount < MAX_COMPANIONS) {
    companionCount++;
    renderCompanionFields();
  }
});
renderCompanionFields();

/* =========================================================
   6. RSVP FORM SUBMIT
   ========================================================= */
document.getElementById("form-rsvp").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("rsvp-name").value.trim();
  const companionNames = Array.from(document.querySelectorAll(".companion-input"))
    .map((el) => el.value.trim())
    .filter(Boolean);

  submitToSheet({
    name,
    attending: "Yes",
    companions: String(companionCount),
    companionNames: companionNames.join(", "),
    message: "",
  });

  goto("thanks");
});

/* =========================================================
   7. SEND DATA TO GOOGLE SHEET VIA APPS SCRIPT
   ========================================================= */
function submitToSheet(data) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
    console.warn("Google Apps Script URL not configured yet. RSVP data:", data);
    return;
  }
  const body = new URLSearchParams(data);
  // no-cors: GitHub Pages (static) -> Apps Script doesn't need to read the
  // response, it just needs the row saved, so we fire-and-forget.
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body,
  }).catch((err) => console.error("Could not reach Google Sheet:", err));
}
