// Panelcor form client — replace the three demo handlers in index.html with
// this file loaded as: <script src="forms-client.js"></script>
// API base: same-domain /api (Worker route) or absolute URL to the Worker.
const API_BASE = window.PANELCOR_API_BASE || "/api";

async function submitForm(event, kind) {
  event.preventDefault();
  const form = event.target;
  // Honeypot (add: <input name="website" style="display:none" tabindex="-1" autocomplete="off">)
  if (form.querySelector('input[name="website"]')?.value) {
    return simulateSuccess(event); // silently pretend success for bots
  }
  const data = Object.fromEntries(new FormData(form).entries());
  data.kind = kind;
  const button = form.querySelector('button[type="submit"]');
  const original = button?.textContent;
  if (button) { button.disabled = true; button.textContent = "Sending…"; }
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.ok) {
      showAlert(event, kind === "buyer" ? "buyer-alert" : kind === "builder" ? "mfg-alert" : "contact-alert");
      form.reset();
    } else {
      alert(out.error || "Submission failed — please email operations@Panelcor.com");
    }
  } catch {
    alert("Network error — please try again or email operations@Panelcor.com");
  } finally {
    if (button) { button.disabled = false; if (original) button.textContent = original; }
  }
  return false;
}

function showAlert(event, alertId) {
  const alert = document.getElementById(alertId);
  if (!alert) return;
  alert.style.display = "block";
  setTimeout(() => alert.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
}

// Legacy demo handlers kept as thin wrappers so old markup keeps working:
function handleBuyerSubmit(event)   { return submitForm(event, "buyer"); }
function handleMfgSubmit(event)     { return submitForm(event, "builder"); }
function handleContactSubmit(event) { return submitForm(event, "contact"); }
