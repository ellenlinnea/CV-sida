// ============================================================
// RANDOM BACKGROUND WITH CANVAS
// ============================================================

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function r(min, max) {
  return min + Math.random() * (max - min);
}

const lineCount = 7;
const lines = Array.from({ length: lineCount }, (_, i) => ({
  baseY:    (i + 1) / (lineCount + 1),
  speed1:   0.00018 + i * 0.000045,
  speed2:   0.00014 + i * 0.000038,
  phase1:   i * 0.9,
  phase2:   i * 1.4,
  amp1:     0.18 + (i % 3) * 0.07,
  amp2:     0.15 + (i % 4) * 0.06,
  opacity:  0.09 + (i % 3) * 0.04,
  width:    0.7 + (i % 3) * 0.4,
}));

function drawBackground(ts = 0) {
  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.classList.contains("dark");
  const strokeColor = isDark ? "255,255,255" : "90,70,70";

  for (const ln of lines) {
    const y0 = H * (ln.baseY + 0.04 * Math.sin(ts * ln.speed1 + ln.phase1));
    const y3 = H * (ln.baseY + 0.04 * Math.sin(ts * ln.speed2 + ln.phase2 + 1));

    const cy1 = y0 + H * ln.amp1 * Math.sin(ts * ln.speed1 * 1.3 + ln.phase1 + 2);
    const cy2 = y3 + H * ln.amp2 * Math.sin(ts * ln.speed2 * 0.9 + ln.phase2 + 4);

    ctx.beginPath();
    ctx.moveTo(-10, y0);
    ctx.bezierCurveTo(W * 0.33, cy1, W * 0.66, cy2, W + 10, y3);
    ctx.strokeStyle = `rgba(${strokeColor}, ${ln.opacity})`;
    ctx.lineWidth   = ln.width;
    ctx.stroke();
  }

  requestAnimationFrame(drawBackground);
}

requestAnimationFrame(drawBackground);

window.addEventListener("resize", () => {});
document.addEventListener("themeChanged", () => {});


// ============================================================
// TYPEWRITER EFFECT ON SUBTITLE
// ============================================================

const subtitleEl = document.getElementById("subtitle");
const subtitleText = "System Developer (.NET) • Malmö";
let charIndex = 0;

function typeWriter() {
  if (charIndex < subtitleText.length) {
    subtitleEl.textContent += subtitleText[charIndex];
    charIndex++;
    const delay = 40 + Math.random() * 40;
    setTimeout(typeWriter, delay);
  } else {
    setTimeout(() => subtitleEl.classList.add("done"), 800);
  }
}

setTimeout(typeWriter, 900);


// ============================================================
// DARK / LIGHT MODE TOGGLE
// ============================================================

const btn = document.getElementById("themeToggle");
const html = document.documentElement;

const saved = localStorage.getItem("theme");
if (saved === "dark") {
  html.classList.add("dark");
  btn.textContent = "☀️ Light mode";
}

btn.addEventListener("click", () => {
  const isDark = html.classList.toggle("dark");
  if (isDark) {
    btn.textContent = "☀️ Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.textContent = "🌙 Dark mode";
    localStorage.setItem("theme", "light");
  }
  document.dispatchEvent(new CustomEvent("themeChanged"));

  document.body.style.display = "none";
  // eslint-disable-next-line no-unused-expressions
  document.body.offsetHeight;
  document.body.style.display = "";
});


// ============================================================
// SCROLL ANIMATIONS – cards pop up when scrolled into view
// ============================================================

const cards = document.querySelectorAll(".card");

cards.forEach((card) => card.classList.add("will-animate"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.remove("will-animate");
          entry.target.classList.add("visible");
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.08,
  }
);

cards.forEach((card) => observer.observe(card));


// ============================================================
// CONTACT FORM – validation + confirmation
// ============================================================

const form       = document.getElementById("contactForm");
const nameInput  = document.getElementById("contactName");
const emailInput = document.getElementById("contactEmail");
const msgInput   = document.getElementById("contactMessage");
const success    = document.getElementById("formSuccess");

function validate(input, errorId, condition) {
  const error = document.getElementById(errorId);
  if (condition) {
    input.classList.remove("invalid");
    error.classList.remove("visible");
    return true;
  } else {
    input.classList.add("invalid");
    error.classList.add("visible");
    return false;
  }
}

nameInput.addEventListener("input",  () => validate(nameInput,  "nameError",  nameInput.value.trim().length > 0));
emailInput.addEventListener("input", () => validate(emailInput, "emailError", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)));
msgInput.addEventListener("input",   () => validate(msgInput,   "messageError", msgInput.value.trim().length > 0));

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameOk  = validate(nameInput,  "nameError",  nameInput.value.trim().length > 0);
  const emailOk = validate(emailInput, "emailError", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value));
  const msgOk   = validate(msgInput,   "messageError", msgInput.value.trim().length > 0);

  if (!nameOk || !emailOk || !msgOk) return;

  try {
    const formData = new FormData(form);
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    form.style.display = "none";
    success.hidden = false;

  } catch {
    const submitBtn = form.querySelector(".form-submit");
    submitBtn.textContent = "Something went wrong – please try again";
    submitBtn.style.background = "#c0392b";
  }
});
