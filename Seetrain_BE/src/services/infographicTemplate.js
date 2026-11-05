function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSectionIcon(heading) {
  const normalizedHeading = String(heading ?? "").toLowerCase();

  if (/overview|intro|start|basic|foundation/.test(normalizedHeading))
    return "📖";
  if (/idea|concept|learn|think|innovation/.test(normalizedHeading))
    return "💡";
  if (/technology|computer|digital|code|software/.test(normalizedHeading))
    return "💻";
  if (/data|result|chart|stat|metric|analysis/.test(normalizedHeading))
    return "📊";
  if (/security|safe|protect|risk/.test(normalizedHeading)) return "🛡️";

  return "📚";
}

const illustrations = [
  // Book and graduation cap
  `<svg viewBox="0 0 180 150" class="illustration">
    <circle cx="90" cy="75" r="67" fill="#dbeafe"/>
    <path d="M35 52 Q65 38 90 55 Q115 38 145 52 V112 Q115 99 90 116 Q65 99 35 112Z" fill="#fff" stroke="#2563eb" stroke-width="5"/>
    <path d="M90 55 V116" stroke="#2563eb" stroke-width="4"/>
    <path d="M45 35 L90 15 L135 35 L90 54Z" fill="#1e40af"/>
    <path d="M135 35 V63" stroke="#f59e0b" stroke-width="4"/>
    <circle cx="135" cy="67" r="5" fill="#f59e0b"/>
  </svg>`,

  // Light bulb
  `<svg viewBox="0 0 180 150" class="illustration">
    <circle cx="90" cy="75" r="67" fill="#fef3c7"/>
    <path d="M90 25 C55 25 43 68 67 91 C76 100 77 108 77 112 H103 C103 108 104 100 113 91 C137 68 125 25 90 25Z" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
    <path d="M77 120 H103 M80 130 H100" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
    <path d="M90 5 V15 M30 32 L40 40 M150 32 L140 40" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  </svg>`,

  // Computer
  `<svg viewBox="0 0 180 150" class="illustration">
    <circle cx="90" cy="75" r="67" fill="#dbeafe"/>
    <rect x="30" y="28" width="120" height="82" rx="9" fill="#2563eb"/>
    <rect x="38" y="36" width="104" height="65" rx="4" fill="#eff6ff"/>
    <rect x="52" y="51" width="30" height="7" rx="3" fill="#60a5fa"/>
    <rect x="52" y="65" width="75" height="6" rx="3" fill="#93c5fd"/>
    <rect x="52" y="78" width="55" height="6" rx="3" fill="#93c5fd"/>
    <path d="M20 115 H160 L145 127 H35Z" fill="#1e40af"/>
  </svg>`,

  // Chart
  `<svg viewBox="0 0 180 150" class="illustration">
    <circle cx="90" cy="75" r="67" fill="#dcfce7"/>
    <path d="M35 115 V35 M35 115 H150" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
    <rect x="50" y="80" width="19" height="35" rx="5" fill="#4ade80"/>
    <rect x="80" y="58" width="19" height="57" rx="5" fill="#22c55e"/>
    <rect x="110" y="35" width="19" height="80" rx="5" fill="#15803d"/>
    <path d="M45 65 L78 43 L105 49 L145 20" stroke="#f59e0b" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,

  // Shield
  `<svg viewBox="0 0 180 150" class="illustration">
    <circle cx="90" cy="75" r="67" fill="#fce7f3"/>
    <path d="M90 20 L140 40 V77 C140 108 115 127 90 138 C65 127 40 108 40 77 V40Z" fill="#f472b6" stroke="#be185d" stroke-width="4"/>
    <path d="M90 42 V105 M66 74 H114" stroke="white" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
];

function genInfographicHTML(data) {
  const sections = (data.sections || []).slice(0, 5);

  const sectionColors = ["blue", "yellow", "green", "pink", "purple"];

  const sectionsHTML = sections
    .map((section, index) => {
      const color = sectionColors[index % sectionColors.length];

      const pointsHTML = (section.points || [])
        .map(
          (point) => `
        <li>
          <span class="bullet-check">✓</span>
          <span>${escapeHtml(point)}</span>
        </li>
      `,
        )
        .join("");

      return `
      <section class="info-card ${color}">
        <div class="card-heading">
          <span class="number">${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(section.heading)}</h2>
        </div>

        <div class="card-body">
          <div class="illustration-wrap">
            ${
              section.imageDataUrl
                ? `<img
                     class="section-image"
                     src="${section.imageDataUrl}"
                     alt="${escapeHtml(section.heading)}"
                   />`
                : `<div class="section-icon">${getSectionIcon(section.heading)}</div>`
            }
          </div>

          <ul class="points">
            ${pointsHTML}
          </ul>
        </div>

        <div class="decorative-dot dot-one"></div>
        <div class="decorative-dot dot-two"></div>
      </section>
    `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    width: 1000px;
    padding: 42px;
    background: #edf4ff;
    font-family: Arial, Helvetica, sans-serif;
    color: #172554;
  }

  .poster {
    background: #ffffff;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 18px 50px rgba(30, 64, 175, 0.12);
  }

  /* HERO */

  .hero {
    position: relative;
    min-height: 340px;
    padding: 48px 50px;
    background: linear-gradient(135deg, #dbeafe, #eff6ff 65%, #bfdbfe);
    overflow: hidden;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 21px;
    font-weight: 800;
    color: #1d4ed8;
    letter-spacing: 2px;
    margin-bottom: 38px;
  }

  .brand-icon {
    font-size: 30px;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 65%;
  }

  h1 {
    font-size: 52px;
    line-height: 1.12;
    margin: 0 0 18px;
    color: #172554;
    overflow-wrap: anywhere;
  }

  .subtitle {
    font-size: 22px;
    line-height: 1.5;
    color: #475569;
  }

  .hero-art {
  position: absolute;
  right: 25px;
  bottom: 12px;
  width: 300px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-art img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  border-radius: 20px;
}

.hero-circle {
  position: absolute;
  width: 250px;
  height: 250px;
  right: 15px;
  bottom: 0;
  border-radius: 50%;
  background: #93c5fd;
  opacity: 0.5;
}

  .hero-book {
    position: absolute;
    right: 42px;
    bottom: 20px;
    font-size: 130px;
  }

  .hero-star {
    position: absolute;
    font-size: 38px;
    color: #f59e0b;
  }

  .star-one {
    top: 20px;
    right: 80px;
  }

  .star-two {
    top: 95px;
    right: 260px;
  }

  /* CONTENT */

  .content {
    padding: 34px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }

  .info-card {
    position: relative;
    min-height: 300px;
    padding: 24px;
    border-radius: 24px;
    overflow: hidden;
    border: 2px solid transparent;
  }

  .blue {
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .yellow {
    background: #fffbeb;
    border-color: #fde68a;
  }

  .green {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .pink {
    background: #fdf2f8;
    border-color: #fbcfe8;
  }

  .purple {
    background: #f5f3ff;
    border-color: #ddd6fe;
  }

  .card-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
    position: relative;
    z-index: 1;
  }

  .number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2563eb;
    color: white;
    font-size: 19px;
    font-weight: 800;
    border-radius: 50%;
  }

  .yellow .number { background: #d97706; }
  .green .number { background: #16a34a; }
  .pink .number { background: #db2777; }
  .purple .number { background: #7c3aed; }

  h2 {
    font-size: 23px;
    line-height: 1.2;
    margin: 0;
    color: #1e3a8a;
    overflow-wrap: anywhere;
  }

  .yellow h2 { color: #92400e; }
  .green h2 { color: #166534; }
  .pink h2 { color: #9d174d; }
  .purple h2 { color: #5b21b6; }

  .card-body {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  .section-image {
    display: block;
    width: 100%;
    height: 150px;
    object-fit: contain;
    border-radius: 14px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.65);
  }

  .section-icon {
    width: 150px;
    height: 150px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
  }

  .illustration-wrap {
    flex: 0 0 42%;
    min-width: 0;
  }

  .illustration {
    display: block;
    width: 100%;
    height: auto;
  }

  .points {
    flex: 1;
    min-width: 0;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .points li {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    font-size: 16px;
    line-height: 1.4;
    color: #334155;
    margin-bottom: 12px;
    overflow-wrap: anywhere;
  }

  .bullet-check {
    flex-shrink: 0;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #2563eb;
    color: white;
    font-size: 13px;
    font-weight: bold;
  }

  .yellow .bullet-check { background: #d97706; }
  .green .bullet-check { background: #16a34a; }
  .pink .bullet-check { background: #db2777; }
  .purple .bullet-check { background: #7c3aed; }

  .decorative-dot {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
  }

  .dot-one {
    width: 90px;
    height: 90px;
    background: white;
    right: -35px;
    top: -35px;
  }

  .dot-two {
    width: 35px;
    height: 35px;
    background: white;
    left: -12px;
    bottom: -12px;
  }

  /* FOOTER */

  .footer {
    padding: 25px 35px;
    text-align: center;
    background: #1e3a8a;
    color: #dbeafe;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  @media print {
    body {
      background: white;
    }
  }
</style>
</head>

<body>
  <main class="poster">

    <header class="hero">
      <div class="brand">
        <span class="brand-icon">✦</span>
        SEETRAIN
      </div>

      <div class="hero-content">
        <h1>${escapeHtml(data.title || "Learning Guide")}</h1>
        <div class="subtitle">
          ${escapeHtml(data.subtitle || "Explore the key ideas")}
        </div>
      </div>

      <div class="hero-art">
        <div class="hero-circle"></div>

        ${
          data.heroImageDataUrl
            ? `<img src="${data.heroImageDataUrl}" alt="AI generated illustration">`
            : `<div class="hero-book">📚</div>`
        }
      </div>
    </header>

    <div class="content">
      ${sectionsHTML}
    </div>

    <footer class="footer">
      ${escapeHtml(data.footer || "Generated by SeeTrain")}
    </footer>

  </main>
</body>
</html>
  `;
}

module.exports = {
  genInfographicHTML,
};
