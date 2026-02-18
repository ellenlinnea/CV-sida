// ============================================================
// SLUMPMÄSSIG BAKGRUND MED CANVAS
// ============================================================

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

function r(min, max) {
  return min + Math.random() * (max - min);
}

function drawBackground() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isDark = document.documentElement.classList.contains("dark");
  const strokeColor = isDark ? "255,255,255" : "90,70,70";

  const W = canvas.width;
  const H = canvas.height;

  // 8 mjuka linjer som alla flödar från vänster till höger,
  // utspridda jämnt vertikalt men med slumpmässig böj
  const lineCount = 8;
  for (let i = 0; i < lineCount; i++) {
    // Startpunkt: vänster kant, jämnt utspridda med lite slump
    const baseY = (H / (lineCount + 1)) * (i + 1);
    const y0 = baseY + r(-H * 0.08, H * 0.08);
    const y3 = baseY + r(-H * 0.08, H * 0.08);

    // Kontrollpunkter: håller sig nära sin "spår" men med varierande vertikal böj
    const cy1 = y0 + r(-H * 0.25, H * 0.25);
    const cy2 = y3 + r(-H * 0.25, H * 0.25);

    ctx.beginPath();
    ctx.moveTo(-10, y0);
    ctx.bezierCurveTo(
      W * 0.33, cy1,
      W * 0.66, cy2,
      W + 10,   y3
    );

    ctx.strokeStyle = `rgba(${strokeColor}, ${r(0.07, 0.18)})`;
    ctx.lineWidth   = r(0.7, 1.8);
    ctx.stroke();
  }
}

drawBackground();

// Rita om vid fönsterändring
window.addEventListener("resize", drawBackground);

// Rita om när temat byts (anropas igen längre ner i filen)
document.addEventListener("themeChanged", drawBackground);


// ============================================================
// SKRIVMASKINS-EFFEKT PÅ UNDERTITELN
// ============================================================

const subtitleEl = document.getElementById("subtitle");
const subtitleText = "Systemutvecklare (.NET) • Malmö";
let charIndex = 0;

function typeWriter() {
  if (charIndex < subtitleText.length) {
    subtitleEl.textContent += subtitleText[charIndex];
    charIndex++;
    // Lite ojämn hastighet för mer naturlig känsla
    const delay = 40 + Math.random() * 40;
    setTimeout(typeWriter, delay);
  } else {
    // Klar – ta bort markören efter en liten paus
    setTimeout(() => subtitleEl.classList.add("done"), 800);
  }
}

// Starta efter att h1-animationen är klar (0.6s) + lite marginal
setTimeout(typeWriter, 900);


// ============================================================
// DARK / LIGHT MODE TOGGLE
// ============================================================

const btn = document.getElementById("themeToggle");
const html = document.documentElement;

const saved = localStorage.getItem("theme");
if (saved === "dark") {
  html.classList.add("dark");
  btn.textContent = "☀️ Ljust läge";
}

btn.addEventListener("click", () => {
  const isDark = html.classList.toggle("dark");
  if (isDark) {
    btn.textContent = "☀️ Ljust läge";
    localStorage.setItem("theme", "dark");
  } else {
    btn.textContent = "🌙 Mörkt läge";
    localStorage.setItem("theme", "light");
  }
  // Uppdatera bakgrundslinjer med rätt färg för nytt tema
  document.dispatchEvent(new CustomEvent("themeChanged"));
});


// ============================================================
// SCROLL-ANIMATIONER – kort "ploppar upp" när de syns
// ============================================================

const cards = document.querySelectorAll(".card");

// Markera alla kort som ska animeras – görs i JS så att
// kort utan JS aldrig blir osynliga
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
