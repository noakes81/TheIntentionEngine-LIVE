import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const APP_NAME = "The Intention Engine";
const APP_VERSION = "V.1";
const APP_FULL = `${APP_NAME} ${APP_VERSION}`;
const COMPANY = "Super Manifestation X";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 72, bottom: 72, left: 72, right: 72 },
  info: {
    Title: `${APP_FULL} — User Manual`,
    Author: COMPANY,
    Subject: "Professional Radionic Software Manual",
    Keywords: "radionics, manifestation, orgone, chi, broadcasting, intention",
  },
});

const OUT_PATH = path.resolve("./manuals/intention-engine-v1-manual.pdf");
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
const stream = fs.createWriteStream(OUT_PATH);
doc.pipe(stream);

// ── Palette ───────────────────────────────────────────────────────────────────
const INDIGO       = "#4338CA";   // headings & accents
const INDIGO_LIGHT = "#818CF8";   // sub-accents
const AMBER        = "#B45309";   // callout labels
const AMBER_BG     = "#FFFBEB";   // callout background
const AMBER_BORDER = "#FCD34D";
const TEXT         = "#111827";   // primary body text
const TEXT_MUTED   = "#6B7280";   // captions / running headers
const DIVIDER      = "#E5E7EB";
const SECTION_BG   = "#EEF2FF";   // indigo-50 section header bg
const WHITE        = "#FFFFFF";
const PAGE_W       = 595.28;      // A4 pt
const MARGIN       = 72;
const CONTENT_W    = PAGE_W - MARGIN * 2;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hr() {
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_W - MARGIN, doc.y)
    .strokeColor(DIVIDER)
    .lineWidth(0.75)
    .stroke();
  doc.moveDown(0.6);
}

function pageHeader(title: string = APP_FULL.toUpperCase()) {
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(7.5)
    .text(title, MARGIN, 36, { width: CONTENT_W, align: "left", characterSpacing: 1.2 });
  doc
    .moveTo(MARGIN, 48)
    .lineTo(PAGE_W - MARGIN, 48)
    .strokeColor(DIVIDER)
    .lineWidth(0.5)
    .stroke();
  doc.y = MARGIN;
}

function pageFooter(pageNum: number) {
  const footY = 595.28 - 40;
  doc
    .moveTo(MARGIN, footY - 8)
    .lineTo(PAGE_W - MARGIN, footY - 8)
    .strokeColor(DIVIDER)
    .lineWidth(0.5)
    .stroke();
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(`${APP_FULL} — User Manual`, MARGIN, footY, {
      width: CONTENT_W / 2,
      align: "left",
    });
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(`Page ${pageNum}`, MARGIN + CONTENT_W / 2, footY, {
      width: CONTENT_W / 2,
      align: "right",
    });
}

function sectionHeading(text: string) {
  if (doc.y > 680) {
    doc.addPage();
    pageHeader();
  }
  doc.moveDown(1.2);
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_W, 28).fill(SECTION_BG);
  doc
    .fillColor(INDIGO)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(text, MARGIN + 10, y + 7, { width: CONTENT_W - 20 });
  doc.y = y + 38;
}

function subHeading(text: string) {
  doc.moveDown(0.9);
  doc
    .fillColor(INDIGO)
    .font("Helvetica-Bold")
    .fontSize(11.5)
    .text(text, MARGIN, doc.y);
  doc.moveDown(0.35);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + 160, doc.y)
    .strokeColor(INDIGO_LIGHT)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);
}

function body(text: string, opts?: PDFKit.Mixins.TextOptions) {
  doc
    .fillColor(TEXT)
    .font("Helvetica")
    .fontSize(11)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, lineGap: 4, ...opts });
  doc.moveDown(0.5);
}

function bullet(items: string[]) {
  for (const item of items) {
    const y = doc.y;
    doc
      .fillColor(INDIGO)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("•", MARGIN + 6, y, { width: 14, lineBreak: false });
    doc
      .fillColor(TEXT)
      .font("Helvetica")
      .fontSize(11)
      .text(item, MARGIN + 22, y, { width: CONTENT_W - 22, lineGap: 4 });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.4);
}

function callout(text: string) {
  doc.moveDown(0.5);
  const startY = doc.y;
  const approxHeight = Math.ceil(text.length / 70) * 16 + 20;
  doc.rect(MARGIN, startY, CONTENT_W, approxHeight).fill(AMBER_BG);
  doc
    .rect(MARGIN, startY, 4, approxHeight)
    .fill(AMBER_BORDER);
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("NOTE", MARGIN + 14, startY + 6, { characterSpacing: 1 });
  doc
    .fillColor(TEXT)
    .font("Helvetica-Oblique")
    .fontSize(10.5)
    .text(text, MARGIN + 14, startY + 18, {
      width: CONTENT_W - 24,
      lineGap: 3,
    });
  doc.y = startY + approxHeight + 6;
  doc.moveDown(0.4);
}

// ── Cover Page ────────────────────────────────────────────────────────────────

doc.rect(0, 0, PAGE_W, 841.89).fill(WHITE);

// Top colour band
doc.rect(0, 0, PAGE_W, 220).fill(INDIGO);

// Decorative inner rectangle
doc
  .rect(MARGIN - 10, 20, PAGE_W - (MARGIN - 10) * 2, 180)
  .strokeColor(INDIGO_LIGHT)
  .lineWidth(0.5)
  .stroke();

// Product name on cover
doc
  .fillColor(WHITE)
  .font("Helvetica-Bold")
  .fontSize(34)
  .text(APP_NAME, MARGIN, 70, {
    width: CONTENT_W,
    align: "center",
    characterSpacing: 1,
  });

doc
  .fillColor(INDIGO_LIGHT)
  .font("Helvetica")
  .fontSize(17)
  .text(`Software ${APP_VERSION}`, MARGIN, 116, {
    width: CONTENT_W,
    align: "center",
    characterSpacing: 2,
  });

doc
  .fillColor("rgba(255,255,255,0.55)")
  .font("Helvetica")
  .fontSize(12)
  .text(COMPANY, MARGIN, 148, {
    width: CONTENT_W,
    align: "center",
    characterSpacing: 0.8,
  });

// Sub-title below band
doc
  .fillColor(TEXT_MUTED)
  .font("Helvetica")
  .fontSize(13)
  .text("User Manual & Operation Guide", MARGIN, 248, {
    width: CONTENT_W,
    align: "center",
  });

doc
  .fillColor(TEXT_MUTED)
  .font("Helvetica")
  .fontSize(10)
  .text(`Version 1.0  ·  ${new Date().getFullYear()}`, MARGIN, 270, {
    width: CONTENT_W,
    align: "center",
  });

doc.y = 310;
hr();

// Table of Contents
doc
  .fillColor(INDIGO)
  .font("Helvetica-Bold")
  .fontSize(13)
  .text("Contents", MARGIN, doc.y, { width: CONTENT_W, align: "left" });
doc.moveDown(0.8);

const toc: [string, string][] = [
  ["1", "Introduction & Overview"],
  ["2", "Getting Started — License Activation"],
  ["3", "Control Panel (Dashboard)"],
  ["4", "Position Builder"],
  ["5", "Radionic Rates & the StickPad"],
  ["6", "Trends & Targets Explained"],
  ["7", "Operations Manager"],
  ["8", "Session Timer & Chi Frequency"],
  ["9", "Symbolic Filter Cards"],
  ["10", "Background & Visual Settings"],
  ["11", "Sequencer"],
  ["12", "Export & Transfer Diagrams"],
  ["13", "Compatible Hardware & Devices"],
  ["14", "Best Practices & Tips"],
  ["15", "Troubleshooting"],
];

for (const [num, title] of toc) {
  const y = doc.y;
  doc
    .fillColor(INDIGO)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(`${num}.`, MARGIN + 10, y, { width: 28, lineBreak: false });
  doc
    .fillColor(TEXT)
    .font("Helvetica")
    .fontSize(11)
    .text(title, MARGIN + 40, y, { width: CONTENT_W - 40 });
  doc.moveDown(0.25);
}

doc.y = 700;
doc
  .fillColor(TEXT_MUTED)
  .font("Helvetica-Oblique")
  .fontSize(9)
  .text(
    "CONFIDENTIAL — For licensed users only. Unauthorized distribution is prohibited.",
    MARGIN, 770,
    { width: CONTENT_W, align: "center" }
  );

// ── Page 2: Section 1 ─────────────────────────────────────────────────────────
let pageNum = 2;

doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("1 · Introduction & Overview");
body(
  `${APP_FULL} is a professional-grade radionic broadcasting platform inspired by the pioneering hardware workstation devices of Karl Hans Welz — inventor of the orgone chi generator and founder of modern radionic instrument design. The Intention Engine brings the core workflow of a Welz-style radionics workstation into a digital environment accessible from any browser.`
);
body(
  "The software provides a digital chi-field transmission environment where you can compose multi-position radionic operations, lock precise numerical rates, and broadcast Trend/Target pairings continuously or on a timed schedule. All session data is stored locally on your device. No data is transmitted externally except for license key verification."
);
body(
  `${APP_FULL} is designed to work alongside any physical orgone or radionic device. Whether you use Karl Welz orgone generators, a QSB (Quantum Scalar Box), a scalar energy device, or a paper radionics board such as the classic Hieronymus machine, the software acts as the digital intelligence layer — handling rate computation, structural linking, intention broadcasting, and session timing while your physical device provides the chi or scalar carrier field.`
);

subHeading("Core Concepts");
bullet([
  "Trend — the desired outcome or intention you wish to manifest or broadcast.",
  "Target — the person, place, or object that the operation is directed toward.",
  "Radionic Rate — a 10-digit numerical code representing the subtle-energy signature of a quality or intention.",
  "Chi Frequency (Hz) — the carrier frequency at which the operation broadcasts.",
  "Position — a single Trend or Target slot within an operation. Multiple positions enable complex multi-layer broadcasts.",
  "Filter Cards — symbolic sigil cards applied to an operation to modulate or amplify the broadcast field.",
]);

callout(
  `${APP_FULL} is a tool for focused intention and energetic broadcasting. Use it ethically and with positive intent.`
);

pageFooter(pageNum++);

// ── Section 2: License Activation ────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("2 · Getting Started — License Activation");
body(
  `When you first open ${APP_FULL}, you will see the License Activation screen. You must enter a valid license key to access the software.`
);

subHeading("Entering Your License Key");
bullet([
  "Your license key follows the format:  ORGX-XXXXXXXX-XXXXXXXX-XXXXXXXX",
  "Type or paste the key exactly as provided — it is not case-sensitive.",
  "Click Activate License. The system verifies your key with the server.",
  "Once activated, the key is stored in your browser and you will not need to re-enter it on this device.",
]);

callout(
  "If you clear your browser data or switch devices, you will need to re-enter your license key. Keep a copy of your key in a safe place."
);

subHeading("Key Activation Rules");
bullet([
  "Each key is checked against the server on every session start.",
  "If a key is revoked, you will be prompted to enter a valid key on your next visit.",
  "Contact your supplier if you lose your key or need a replacement.",
]);

pageFooter(pageNum++);

// ── Section 3: Control Panel ──────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("3 · Control Panel (Dashboard)");
body(
  "The Control Panel is your main hub. It shows the currently active operation (if any) along with recently configured operations ready to launch."
);

subHeading("Active Operation Panel");
body("When an operation is transmitting or paused, the Active Operation Panel appears at the top. It displays:");
bullet([
  "Operation name and current status: Transmitting, Paused, or Standby.",
  "Trend / Intention — cycles through all Trend positions every 3 seconds, showing each position's intention statement, radionic rate, and filter cards.",
  "Target / Structural Link — shows the target name, witness photo (if provided), and amber LCD rate display.",
  "Chi waveform — an animated bar graph synchronized to the chi frequency.",
  "Session timer — shows elapsed time for unlimited sessions, or a countdown with progress ring for timed sessions.",
  "Filter Cards — displayed as a visual grid of symbolic sigil tiles in the right column.",
]);

subHeading("Transmit / Pause / Stop Controls");
bullet([
  "Play / Transmit — begins or resumes the operation.",
  "Pause — freezes the timer while keeping the operation active.",
  "Stop — ends the operation and returns it to idle status.",
  "Reset — stops and resets elapsed time to zero.",
]);

subHeading("Launching Stored Operations");
body(
  "Below the active panel, recently configured operations are listed as cards. Click the Transmit button on any card to launch it instantly. Only one operation can be running at a time; starting a new one will pause the currently running operation."
);

pageFooter(pageNum++);

// ── Section 4: Position Builder ───────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("4 · Position Builder");
body(
  "The Position Builder is where you create and configure radionic operations. Each operation consists of one or more positions — one Target and up to nine Trend positions."
);

subHeading("Creating an Operation");
bullet([
  "Navigate to Builder in the sidebar.",
  "Enter a descriptive name for the operation in the Session Name field.",
  "You will see two default positions: Target and Trend 1.",
  "Click + Add Position to add additional Trend positions (up to 9 total).",
  "Use the tabs at the top to switch between positions.",
]);

subHeading("Configuring the Target Position");
bullet([
  "Target Name — the full name of the person, place, or object.",
  "Description — optional notes or supporting intention.",
  "Witness / Photo — upload a photo to create a stronger structural link.",
  "Transfer Diagram — upload or generate a diagram for physical chi-generator use.",
  "Structural Link Type — choose from Name, Photo, Written, or Transfer.",
  "Radionic Rate — use the StickPad or manual entry (pencil icon) to set the 10-digit rate.",
]);

subHeading("Configuring Trend Positions");
bullet([
  "Position Type — label such as Trend 1, Trend 2, etc.",
  "Intention Statement — a clear, present-tense affirmative statement of the desired outcome.",
  "Radionic Rate — set via the StickPad or manual entry.",
  "Filter Cards — select symbolic cards from the library to amplify this specific trend.",
  "Custom Sigil Image — upload your own image as a card for this position.",
]);

subHeading("Chi Frequency & Session Duration");
bullet([
  "Frequency (Hz) — use the logarithmic slider or the preset dropdown to select a chi carrier frequency.",
  "Duration — choose Timed Session and enter a value in minutes (1–1440), or toggle Continuous for an unlimited run.",
]);

subHeading("Saving & Launching");
bullet([
  "Click Save Operation to store the operation without running it.",
  "Click Save & Transmit to store and immediately launch the operation.",
  "Saved operations appear in the Operations list and on the Control Panel.",
]);

pageFooter(pageNum++);

// ── Section 5: StickPad & Rates ───────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("5 · Radionic Rates & the StickPad");
body(
  "Radionic rates are 10-digit numerical codes that encode the subtle-energy signature of an intention, quality, or target. In traditional radionics, rates are found by dowsing dials while rubbing a stick pad until you feel a sticky resistance — called the stick reaction."
);
body(`${APP_FULL} digitally simulates this process:`);
bullet([
  "Press and hold the StickPad circle to begin scanning — it will cycle through digits.",
  "Release when you intuitively sense the correct digit — it locks in place.",
  "Repeat for each of the 10 digit positions.",
  "The pencil icon opens manual entry mode so you can type any digit directly.",
  "The lock icon freezes the entire rate to prevent accidental changes.",
]);

callout(
  "Trust your intuition during the stick reaction process. Many practitioners report a tactile or energetic sense when the correct digit is reached. Others prefer to set rates analytically or use published reference rates."
);

subHeading("LCD Rate Display");
body(
  "Trend rates are displayed in green LCD-style digits. Target rates are shown in amber. During an active operation, each digit animates independently as positions cycle through."
);

pageFooter(pageNum++);

// ── Section 6: Trends & Targets ───────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("6 · Trends & Targets Explained");

subHeading("The Trend");
body(
  "A Trend is the intended outcome — what you want to manifest, attract, or transmit. It is the 'what' of the operation. Examples:"
);
bullet([
  "Perfect health and vitality for [name]",
  "Financial abundance flowing freely to [name]",
  "Protection from negative energies",
  "Optimal crop growth and yield",
  "Deep and restful sleep every night",
]);
body(
  "Write Trend intentions in the present tense, as if already manifested. Avoid negations — state what you want, not what you don't want."
);

subHeading("The Target");
body(
  "The Target is the structural link — the person, place, or object the operation is directed toward. This is the 'who' or 'what' of the operation."
);
body("Structural link types in order of potency:");
bullet([
  "Photo — a clear photograph of the target. Most powerful structural link.",
  "Transfer Diagram — a printed diagram placed on a physical chi generator.",
  "Written — a handwritten name or description.",
  "Name — digital text-only link. Weakest but still effective.",
]);

subHeading("Multi-Position Operations");
body(
  "Advanced operators use multiple Trend positions within a single operation to broadcast several intentions simultaneously toward the same target. The Active Operation Panel cycles through all Trend positions during transmission."
);

pageFooter(pageNum++);

// ── Section 7: Operations Manager ────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("7 · Operations Manager");
body(
  "The Operations page lists all saved operations. Use it to manage, launch, pause, duplicate, or delete operations."
);

subHeading("Status Indicators");
bullet([
  "Green LED — operation is currently transmitting.",
  "Amber LED — operation is paused.",
  "Dim LED — operation is idle / stored.",
]);

subHeading("Card Controls");
bullet([
  "Transmit / Pause — starts or pauses the operation and navigates to the Control Panel.",
  "Edit (pencil icon) — opens the Position Builder with the operation pre-loaded.",
  "Duplicate (copy icon) — creates a copy of the operation with idle status.",
  "Delete (trash icon) — permanently removes the operation after confirmation.",
]);

callout(
  "Starting an operation from the Operations list will automatically navigate you to the Control Panel so you can monitor the active transmission."
);

pageFooter(pageNum++);

// ── Section 8: Session Timer & Chi Frequency ─────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("8 · Session Timer & Chi Frequency");

subHeading("Timed Sessions");
body(
  "Set a duration in minutes (1–1440). The session runs until elapsed time reaches the target, then automatically stops and marks the operation as completed. The progress ring in the Control Panel shows percentage completion."
);

subHeading("Continuous Sessions");
body(
  "When Continuous mode is selected, the session runs indefinitely until you manually stop or pause it. The clock displays elapsed time counting upward. Ideal for long-running environmental broadcasts."
);

subHeading("Chi Frequency Presets");
doc.moveDown(0.5);

const freqs: [string, string][] = [
  ["0.6 Hz",   "Deep delta — unconscious programming"],
  ["7.83 Hz",  "Schumann Resonance — Earth's natural frequency"],
  ["10 Hz",    "Alpha — relaxation, enhanced receptivity"],
  ["40 Hz",    "Gamma — peak focus, manifestation clarity"],
  ["174 Hz",   "Foundation / pain relief"],
  ["285 Hz",   "Tissue and field repair"],
  ["396 Hz",   "Liberation from fear and guilt"],
  ["417 Hz",   "Undoing situations, facilitating change"],
  ["432 Hz",   "Natural tuning, heart resonance"],
  ["528 Hz",   "DNA repair, transformation, miracles"],
  ["639 Hz",   "Relationships and reconnection"],
  ["741 Hz",   "Awakening intuition, solutions"],
  ["852 Hz",   "Spiritual order, intuition"],
  ["963 Hz",   "Crown activation, divine connection"],
];

for (const [hz, desc] of freqs) {
  const y = doc.y;
  const col1 = 80;
  doc.rect(MARGIN, y, col1, 18).fill("#F5F3FF");
  doc
    .fillColor(INDIGO)
    .font("Courier-Bold")
    .fontSize(10.5)
    .text(hz, MARGIN + 4, y + 3, { width: col1 - 8, lineBreak: false });
  doc
    .fillColor(TEXT)
    .font("Helvetica")
    .fontSize(10.5)
    .text(desc, MARGIN + col1 + 10, y + 3, { width: CONTENT_W - col1 - 10 });
  doc.y = y + 22;
}

doc.moveDown(0.5);
pageFooter(pageNum++);

// ── Section 9: Symbolic Filter Cards ─────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("9 · Symbolic Filter Cards");
body(
  "Filter Cards are symbolic sigils drawn from traditions of sacred geometry, solfeggio frequencies, chakra systems, numerology, and elemental forces. They act as energetic modulators applied to your broadcast."
);
body("Cards can be assigned at two levels:");
bullet([
  "Operation-wide — applied to the entire operation (all positions).",
  "Position-specific — applied only to the specific Trend position where they are selected.",
]);

subHeading("Card Categories");
bullet([
  "Chakra — energy centers of the subtle body (Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown).",
  "Solfeggio — tonal frequencies with specific vibrational qualities.",
  "Protection — shields, barriers, and defensive energy patterns.",
  "Manifestation — amplifiers for attraction, abundance, and materialization.",
  "Elements — Earth, Water, Fire, Air, Ether / Akasha.",
  "Numerology — numerical archetypes and their vibrational meaning.",
]);

subHeading("Managing the Card Library");
bullet([
  "Navigate to Cards in the sidebar to view all available cards.",
  "Star cards to mark them as favourites for quick access.",
  "Filter by category using the tabs at the top.",
  "Custom cards can be created with a name, symbol (emoji), and description.",
]);

subHeading("Applying Cards to Operations");
body(
  "In the Position Builder, each position has a Cards section. Click a card to add or remove it. During transmission, cards appear in the Control Panel — position-specific cards cycle inside the Trend panel, and operation-wide cards appear in the Filter Cards grid."
);

pageFooter(pageNum++);

// ── Section 10: Background & Visual Settings ──────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("10 · Background & Visual Settings");
body(
  "The BG button at the bottom of the sidebar opens the Background Picker. Personalize the machine-room atmosphere with six built-in gradient presets or a custom image upload."
);
bullet([
  "Dark — the default deep space background.",
  "Nebula — purple cosmic nebula gradient.",
  "Matrix — deep matrix green.",
  "Plasma — red and magenta plasma field.",
  "Aurora — teal and cyan aurora effect.",
  "Golden — warm amber and gold tones.",
  "Upload — use any image from your device as the background.",
]);
body("Your background choice is saved and persists across sessions.");

// ── Section 11: Sequencer ─────────────────────────────────────────────────────
sectionHeading("11 · Sequencer");
body(
  "The Sequencer lets you chain multiple frequency steps into an automated sequence. Each step has its own chi frequency and duration, and the system advances through steps in order."
);
bullet([
  "Add steps with the + button.",
  "Set the frequency and duration (in minutes) for each step.",
  "Give the sequence a name and save it.",
  "Start the sequencer from the Sequencer page — it will step through automatically.",
]);
callout(
  "The Sequencer is ideal for multi-stage clearing protocols, layered healing sessions, or progressive manifestation sequences."
);

pageFooter(pageNum++);

// ── Section 12: Export & Transfer Diagrams ────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("12 · Export & Transfer Diagrams");

subHeading("Export Page");
body(
  "The Export page lets you save a complete snapshot of your operations and cards to a JSON file. You can back it up or import it on another device at any time."
);

subHeading("Transfer Diagrams");
body(
  "A Transfer Diagram is a printable document that encodes the operation's intention and target information. It is designed to be placed on or in front of a physical chi generator, orgone device, or scalar broadcaster to create a structural link between the digital operation and your hardware."
);
bullet([
  "Navigate to Transfer Diagram in the sidebar.",
  "Select an operation to generate its diagram.",
  "Print the diagram and place it on your physical device — on the output plate, well, or broadcast surface.",
  "The diagram includes the operation name, target, trend intention, and radionic rates.",
  "Compatible with Karl Welz orgone generators, QSB (Quantum Scalar Box), scalar devices, and paper radionics boards including the Hieronymus machine.",
]);

pageFooter(pageNum++);

// ── Section 13: Compatible Hardware & Devices ─────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("13 · Compatible Hardware & Devices");
body(
  `${APP_FULL} was designed with hardware integration in mind from the ground up. The software is inspired by the radionic workstation architecture pioneered by Karl Hans Welz, and functions as the digital control and intelligence layer for any physical orgone, scalar, or radionic device you already own.`
);

subHeading("Karl Welz Orgone Generators");
body(
  "Karl Hans Welz invented the modern orgone chi generator in 1991 and developed the first PC-controlled radionics workstation software. His devices generate a continuous stream of chi (orgone) energy that serves as a carrier for radionic transmissions."
);
bullet([
  "Supported models: Any Welz LPOG, RAD, ATGS, or PCHD series orgone generator.",
  "Place the printed Transfer Diagram on the output plate or in the transfer cavity of the device.",
  "Run The Intention Engine operation simultaneously — the software handles the intention and rate information while the Welz device provides the chi carrier field.",
  "For Welz devices with a built-in Manifestation Program (such as the ATGS 3000), The Intention Engine can act as the rate and intention controller.",
]);

subHeading("QSB — Quantum Scalar Box");
body(
  "The QSB (Quantum Scalar Box) by Life Technology™ generates scalar longitudinal waves modulated by solfeggio and sacred frequencies. It pairs exceptionally well with The Intention Engine's built-in solfeggio chi frequency presets."
);
bullet([
  "Set The Intention Engine's chi frequency to match or harmonically complement the QSB's active frequency.",
  "Place the printed Transfer Diagram beneath or in front of the QSB coil.",
  "Use the Sequencer to step through multiple solfeggio frequencies while the QSB broadcasts continuously.",
  "The 528 Hz, 396 Hz, and 963 Hz presets are particularly effective when paired with QSB scalar output.",
]);

subHeading("Scalar Energy Devices");
body(
  "Scalar devices — including scalar pendants, coil-based scalar generators, torsion-field emitters, and scalar laser devices — can all be combined with The Intention Engine to add a directed intention layer to their output."
);
bullet([
  "Print the Transfer Diagram and place it on the scalar device's output face, coil, or broadcast surface.",
  "Point the scalar output toward the diagram or target photograph.",
  "Use continuous session mode for passive environmental broadcasts with scalar devices.",
  "The Intention Engine's Filter Cards add an additional symbolic-frequency modulation to the scalar carrier.",
]);

subHeading("Paper Radionics Boards — The Hieronymus Machine");
body(
  "T. Galen Hieronymus designed one of the first eloptic energy analyzers and radionic instruments in the early 20th century. His paper radionics board design — sometimes called the 'Symbolic Hieronymus Machine' — demonstrated that a paper diagram of a circuit can function as an operational radionic device when charged with intent."
);
bullet([
  "Print The Intention Engine's Transfer Diagram and use it as the broadcast well or witness plate on a Hieronymus-style paper board.",
  "Write or paste the radionic rates from the operation directly onto the board's rate dials.",
  "Run The Intention Engine operation simultaneously to reinforce the paper broadcast with digital chi cycling.",
  "The paper board's symbolic circuitry and The Intention Engine's digital rates work synergistically — the paper provides the physical link, the software provides precision rate locking and session timing.",
]);

subHeading("General Integration Workflow");
bullet([
  "Step 1 — Build your operation in The Intention Engine's Position Builder. Set your Trend, Target, rate, and filter cards.",
  "Step 2 — Navigate to Transfer Diagram and print the diagram for the operation.",
  "Step 3 — Place the diagram on or in front of your physical device.",
  "Step 4 — Power on your physical device and set it to broadcast.",
  "Step 5 — Start the operation in The Intention Engine. The software and device now work in unison.",
  "Step 6 — Monitor progress in the Control Panel. Use timed sessions for protocols, or continuous mode for ambient broadcasting.",
]);

callout(
  "You do not need a physical device to use The Intention Engine — the software broadcasts intentions digitally on its own. Physical devices amplify and extend the broadcast with a tangible chi or scalar carrier field."
);

pageFooter(pageNum++);

// ── Section 14: Best Practices ────────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("14 · Best Practices & Tips");

subHeading("Crafting Effective Intentions");
bullet([
  "Use present-tense, positive language: 'I am healthy and vibrant' rather than 'I am not sick'.",
  "Be specific but not restrictive — allow the best path to emerge naturally.",
  "Charge each word with genuine feeling and belief.",
  "Review and refine your intention statements regularly.",
]);

subHeading("Rate Finding");
bullet([
  "Find rates in a calm, centered state — brief meditation before rate-finding improves accuracy.",
  "Trust your first impression. Overthinking leads to less accurate rates.",
  "Published rate books can be used for common qualities — enter them manually using the pencil icon.",
  "Lock rates once found to protect them from accidental changes.",
]);

subHeading("Session Strategy");
bullet([
  "For acute situations, run continuous sessions and check in daily.",
  "For long-term goals, timed daily sessions of 30–60 minutes are effective.",
  "Use multiple Trend positions to address different facets of the same goal.",
  "Apply protection and clearing cards first, then manifestation amplifiers.",
  "Layer operations: one for clearing obstacles, one for attracting the desired outcome.",
]);

subHeading("Working with Physical Devices");
bullet([
  "Print the Transfer Diagram and place it on your Karl Welz orgone generator, QSB scalar box, scalar coil, or Hieronymus paper board.",
  "Point the output of the physical device toward the diagram or target photograph.",
  "Run the corresponding digital operation simultaneously for maximum effect — the software and device work in unison.",
  "Match The Intention Engine's chi frequency to your device's carrier frequency for optimal resonance.",
  "Replace printed diagrams weekly or whenever the intention changes.",
]);

callout(
  `${APP_FULL} is a spiritual intention-focusing tool. It is not a medical device and makes no medical claims. Use responsibly and ethically.`
);

pageFooter(pageNum++);

// ── Section 14: Troubleshooting ───────────────────────────────────────────────
doc.addPage({ size: "A4", margins: { top: 72, bottom: 72, left: 72, right: 72 } });
pageHeader();

sectionHeading("15 · Troubleshooting");

const troubleshooting: [string, string][] = [
  [
    "License key not accepted",
    "Check for typos or extra spaces. Keys are not case-sensitive. If the key was previously used on this device, clear browser storage and re-enter. Contact support if the issue persists.",
  ],
  [
    "Operation stops immediately after starting",
    "If a timed operation was previously run to completion, it will reset and start fresh. If it stops within 5 seconds, check the session duration setting in the Builder.",
  ],
  [
    "StickPad not responding to hold",
    "Ensure you are pressing and holding (not just clicking) the StickPad circle. On touch devices, hold without moving your finger.",
  ],
  [
    "Background image not displaying",
    "Uploaded background images are stored in localStorage. If your browser has strict storage limits, the image may not persist. Try a smaller image file.",
  ],
  [
    "Rates appear to reset",
    "Ensure you lock the rate with the lock icon after finding it. Unlocked rates can be overwritten accidentally.",
  ],
  [
    "Cards not showing during transmission",
    "Only cards assigned to the operation or specific positions will appear. Assign cards in the Position Builder under each position's Cards section.",
  ],
  [
    "Data lost after clearing browser storage",
    "All data (operations, cards, settings) is stored in browser localStorage. Use the Export function regularly to back up your data to a JSON file.",
  ],
];

for (const [problem, solution] of troubleshooting) {
  doc.moveDown(0.6);
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_W, 14).fill("#FEF3C7");
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(problem, MARGIN + 8, y + 1, { width: CONTENT_W - 16 });
  doc.y = y + 18;
  doc
    .fillColor(TEXT)
    .font("Helvetica")
    .fontSize(11)
    .text(solution, MARGIN + 8, doc.y, { width: CONTENT_W - 16, lineGap: 4 });
  doc.moveDown(0.4);
}

doc.moveDown(1.5);
hr();
doc.moveDown(0.6);

doc
  .fillColor(TEXT_MUTED)
  .font("Helvetica-Oblique")
  .fontSize(10)
  .text(
    `© ${new Date().getFullYear()} ${COMPANY}. All rights reserved.`,
    MARGIN,
    doc.y,
    { width: CONTENT_W, align: "center" }
  );

pageFooter(pageNum++);

// ── Finalize ──────────────────────────────────────────────────────────────────
doc.end();

stream.on("finish", () => {
  console.log(`✅ Manual generated: ${OUT_PATH}`);
});

stream.on("error", (err) => {
  console.error("❌ Error writing PDF:", err);
  process.exit(1);
});
