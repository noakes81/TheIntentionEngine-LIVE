import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title: "Orgone Manifestation X — User Manual",
    Author: "Super Manifestation X",
    Subject: "Professional Radionic Software Manual",
    Keywords: "radionics, manifestation, orgone, chi, broadcasting",
  },
});

const OUT_PATH = path.resolve("./manuals/orgone-manifestation-x-manual.pdf");
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
const stream = fs.createWriteStream(OUT_PATH);
doc.pipe(stream);

// Colours
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#A78BFA";
const AMBER = "#F59E0B";
const DIM = "#6B7280";
const BODY = "#1F2937";
const BG_DARK = "#0F1117";
const WHITE = "#FFFFFF";

// ─── helpers ─────────────────────────────────────────────────────────────────

function hr(y?: number) {
  const posY = y ?? doc.y;
  doc
    .moveTo(60, posY)
    .lineTo(doc.page.width - 60, posY)
    .strokeColor("#3B3B5C")
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.5);
}

function sectionHeading(text: string) {
  doc.moveDown(1);
  doc
    .rect(60, doc.y, doc.page.width - 120, 22)
    .fill("#1A1A2E");
  doc
    .fillColor(PURPLE_LIGHT)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(text.toUpperCase(), 68, doc.y - 18, { continued: false });
  doc.moveDown(0.8);
}

function subHeading(text: string) {
  doc.moveDown(0.6);
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(text);
  doc.moveDown(0.2);
}

function body(text: string, opts?: PDFKit.Mixins.TextOptions) {
  doc
    .fillColor(BODY)
    .font("Helvetica")
    .fontSize(9.5)
    .text(text, { lineGap: 3, ...opts });
  doc.moveDown(0.3);
}

function bullet(items: string[]) {
  for (const item of items) {
    doc
      .fillColor(PURPLE_LIGHT)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text("• ", { continued: true });
    doc
      .fillColor(BODY)
      .font("Helvetica")
      .fontSize(9.5)
      .text(item, { lineGap: 3 });
  }
  doc.moveDown(0.3);
}

function note(text: string) {
  const y = doc.y;
  doc
    .rect(60, y, doc.page.width - 120, 0)
    .stroke();
  doc
    .rect(60, y, 3, 999)
    .fillColor(PURPLE);

  doc
    .fillColor(DIM)
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text(text, 72, y, {
      width: doc.page.width - 132,
      lineGap: 3,
    });

  const endY = doc.y;
  doc
    .rect(60, y, 3, endY - y + 4)
    .fill(PURPLE);
  doc.moveDown(0.5);
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

doc
  .rect(0, 0, doc.page.width, doc.page.height)
  .fill(BG_DARK);

// Decorative border
doc
  .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
  .strokeColor("#2D2D5A")
  .lineWidth(1)
  .stroke();

doc
  .rect(36, 36, doc.page.width - 72, doc.page.height - 72)
  .strokeColor("#1F1F40")
  .lineWidth(0.5)
  .stroke();

// Logo area
doc
  .rect(doc.page.width / 2 - 40, 140, 80, 80)
  .fillAndStroke("#14143A", PURPLE);

doc
  .fillColor(PURPLE_LIGHT)
  .font("Helvetica-Bold")
  .fontSize(32)
  .text("Ψ", doc.page.width / 2 - 40, 158, { width: 80, align: "center" });

doc.moveDown(2);
doc
  .fillColor(WHITE)
  .font("Helvetica-Bold")
  .fontSize(26)
  .text("ORGONE MANIFESTATION X", 60, 260, {
    align: "center",
    width: doc.page.width - 120,
    characterSpacing: 2,
  });

doc
  .fillColor(PURPLE_LIGHT)
  .font("Helvetica")
  .fontSize(13)
  .text("Super Manifestation X — Professional Radionic Software", {
    align: "center",
    width: doc.page.width - 120,
    characterSpacing: 0.5,
  });

doc.moveDown(2);
hr(doc.y);
doc.moveDown(1);

doc
  .fillColor(DIM)
  .font("Helvetica")
  .fontSize(10)
  .text("User Manual & Operation Guide", { align: "center", width: doc.page.width - 120 });

doc
  .fillColor(DIM)
  .font("Helvetica")
  .fontSize(9)
  .text(`Version 1.0  ·  ${new Date().getFullYear()}`, { align: "center", width: doc.page.width - 120 });

doc.moveDown(4);

doc
  .fillColor(PURPLE_LIGHT)
  .font("Helvetica-Bold")
  .fontSize(9)
  .text("CONTENTS", { align: "center", width: doc.page.width - 120, characterSpacing: 3 });

doc.moveDown(0.8);

const toc = [
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
  ["13", "Best Practices & Tips"],
  ["14", "Troubleshooting"],
];

for (const [num, title] of toc) {
  const cx = doc.page.width / 2;
  doc
    .fillColor(PURPLE_LIGHT)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(`${num}.`, cx - 160, doc.y, { continued: true, width: 20 });
  doc
    .fillColor("#C0C0D0")
    .font("Helvetica")
    .fontSize(9)
    .text(` ${title}`, { width: 280 });
}

// Footer
doc
  .fillColor("#2D2D5A")
  .font("Helvetica")
  .fontSize(8)
  .text(
    "CONFIDENTIAL — For licensed users only. Unauthorized distribution is prohibited.",
    60,
    doc.page.height - 60,
    { align: "center", width: doc.page.width - 120 }
  );

// ─── Page 2+ ──────────────────────────────────────────────────────────────────

doc.addPage({
  size: "A4",
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
});

// Running header
function pageHeader() {
  doc
    .fillColor(DIM)
    .font("Helvetica")
    .fontSize(7.5)
    .text("ORGONE MANIFESTATION X — USER MANUAL", 60, 30, { characterSpacing: 1.5 });
  doc
    .moveTo(60, 42)
    .lineTo(doc.page.width - 60, 42)
    .strokeColor("#2D2D5A")
    .lineWidth(0.5)
    .stroke();
  doc.y = 60;
}

pageHeader();

// ─── Section 1: Introduction ─────────────────────────────────────────────────

sectionHeading("1 · Introduction & Overview");
body(
  "Orgone Manifestation X (OMX) is a professional-grade radionic broadcasting platform inspired by hardware workstation radionics devices. It provides a digital chi-field transmission environment where you can compose multi-position radionic operations, lock precise numerical rates, and broadcast trend/target pairings continuously or on a timed schedule."
);
body(
  "The software operates entirely in your browser with all data stored locally on your device. No data is transmitted externally except for license key validation."
);

subHeading("Core Concepts");
bullet([
  "Trend — the desired outcome or intention you wish to manifest or broadcast.",
  "Target — the person, place, or thing that the operation is directed toward.",
  "Radionic Rate — a 10-digit numerical code representing the subtle-energy signature of a quality or intention.",
  "Chi Frequency (Hz) — the carrier frequency in hertz at which the operation broadcasts.",
  "Position — a single Trend or Target slot within an operation; multiple positions enable complex multi-layer broadcasts.",
  "Filter Cards — symbolic sigil cards applied to an operation that modulate or amplify the broadcast.",
]);

// ─── Section 2: License Activation ───────────────────────────────────────────

sectionHeading("2 · Getting Started — License Activation");
body(
  "When you first open Orgone Manifestation X, you will see the License Activation screen. You must enter a valid license key to access the software."
);

subHeading("Entering Your License Key");
bullet([
  "Your license key follows the format: ORGX-XXXXXXXX-XXXXXXXX-XXXXXXXX",
  "Type or paste the key exactly as provided — it is not case-sensitive.",
  "Click 'Activate License'. The system verifies your key with the server.",
  "Once activated, the key is stored in your browser and you will not need to enter it again on this device.",
]);

note(
  "If you clear your browser data or switch devices, you will need to re-enter your license key. Keep a copy of your key in a safe place."
);

subHeading("Key Activation Rules");
bullet([
  "Each key is tied to first activation and is verified on every session start.",
  "If a key is revoked, you will be prompted to enter a valid key on your next visit.",
  "Contact your supplier if you lose your key or need a replacement.",
]);

// ─── Section 3: Control Panel ─────────────────────────────────────────────────

sectionHeading("3 · Control Panel (Dashboard)");
body(
  "The Control Panel is your main hub. It shows the currently active operation (if any) and a list of recently configured operations ready to launch."
);

subHeading("Active Operation Panel");
body(
  "When an operation is transmitting or paused, the Active Operation Panel appears at the top of the Control Panel. It displays:"
);
bullet([
  "Operation name and current status (transmitting / paused / standby).",
  "Trend / Intention section — cycles through all trend positions every 3 seconds when running, showing each position's intention statement, radionic rate, and associated filter cards.",
  "Target / Structural Link — shows the target name, witness photo (if provided), and amber LCD rate.",
  "Chi waveform display — an animated bar graph synchronized to the chi frequency.",
  "Session timer — shows elapsed time (for unlimited sessions) or a countdown with progress ring (for timed sessions).",
  "Filter Cards — displayed as a visual grid of symbolic sigil tiles in the right column.",
]);

subHeading("Transmit / Pause / Stop Controls");
bullet([
  "Play / Transmit — begins or resumes the operation.",
  "Pause — freezes the timer while keeping the operation active.",
  "Stop (square) — ends the operation and returns it to idle status.",
  "Reset (circular arrow) — stops and resets the elapsed time to zero.",
]);

subHeading("Launching Stored Operations");
body(
  "Below the active panel, recently configured operations are listed. Click the Transmit button on any card to launch it instantly. Only one operation can be running at a time; starting a new one will pause any currently running operation."
);

// ─── Section 4: Position Builder ──────────────────────────────────────────────

doc.addPage({ size: "A4", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
pageHeader();

sectionHeading("4 · Position Builder");
body(
  "The Position Builder is where you create and configure radionic operations. Each operation consists of one or more positions — a Target and up to nine Trend positions."
);

subHeading("Creating an Operation");
bullet([
  "Navigate to 'Builder' in the sidebar.",
  "Enter a descriptive name for the operation in the Session Name field at the top.",
  "You will see two default positions: Target and Trend 1.",
  "Click the + Add Position button to add additional Trend positions (up to 9 total).",
  "Use the tabs at the top to switch between positions.",
]);

subHeading("Configuring the Target Position");
bullet([
  "Target Name — the full name of the person, place, or object.",
  "Description — optional additional notes or intention.",
  "Witness / Photo — upload a photo to create a stronger structural link.",
  "Transfer Diagram — upload or generate a diagram for physical chi-generator use.",
  "Structural Link Type — choose from Name, Photo, Written, or Transfer.",
  "Radionic Rate — use the StickPad or manual entry (pencil icon) to set the 10-digit rate.",
]);

subHeading("Configuring Trend Positions");
bullet([
  "Position Type — label such as Trend 1, Trend 2, etc.",
  "Intention Statement — a clear, present-tense affirmative statement of the desired outcome.",
  "Radionic Rate — set via StickPad or manual entry.",
  "Filter Cards — select symbolic cards from the library to amplify this specific trend.",
  "Custom Sigil Image — upload your own image as a card for this position.",
]);

subHeading("Chi Frequency & Session Duration");
body(
  "At the bottom of the Builder, configure the broadcast parameters:"
);
bullet([
  "Frequency (Hz) — use the logarithmic slider or the preset dropdown to select a chi carrier frequency. Common presets include 7.83 Hz (Schumann Resonance), 432 Hz, 528 Hz (DNA repair), and 963 Hz.",
  "Duration — choose 'Timed session' and enter a duration in minutes (1–1440), or toggle to 'Continuous' for an unlimited run with no auto-stop.",
]);

subHeading("Saving & Launching");
bullet([
  "Click 'Save Operation' to store the operation without running it.",
  "Click 'Save & Transmit' to store and immediately launch the operation.",
  "Saved operations appear in the Operations list and on the Control Panel.",
]);

// ─── Section 5: StickPad & Rates ──────────────────────────────────────────────

sectionHeading("5 · Radionic Rates & the StickPad");
body(
  "Radionic rates are 10-digit numerical codes that encode the subtle-energy signature of an intention, quality, or target. In traditional radionics, rates are found by dowsing dials while rubbing a 'stick pad' until you feel a sticky resistance (the stick reaction)."
);
body(
  "The OMX StickPad digitally simulates this process:"
);
bullet([
  "Press and hold the StickPad circle to begin scanning — it will cycle randomly through digits.",
  "Release when you feel or intuitively sense the correct digit — it locks in place.",
  "Repeat for each of the 10 digit positions.",
  "The pencil icon opens manual entry mode, where you can type any digit directly.",
  "The lock icon freezes the entire rate to prevent accidental changes.",
]);

note(
  "Trust your intuition during the stick reaction process. Many practitioners report a tactile or energetic response when the correct digit is reached. Others prefer to set rates analytically or use known reference rates."
);

subHeading("LCD Rate Display");
body(
  "Trend rates are shown in green LCD-style displays. Target rates are shown in amber. During an active operation, the trend display animates digit-by-digit as positions cycle — each digit flips to the new value independently."
);

// ─── Section 6: Trends & Targets ─────────────────────────────────────────────

doc.addPage({ size: "A4", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
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
  "Write Trend intentions in the present tense, as if already manifested. Avoid negations ('not', 'no', 'without') — state what you want, not what you don't want."
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
  "Advanced operators use multiple Trend positions within a single operation. This allows you to broadcast several intentions simultaneously toward the same target. The Active Operation Panel cycles through all trend positions during transmission, showing each in turn."
);

// ─── Section 7: Operations Manager ───────────────────────────────────────────

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
  "Edit (pencil) — opens the Position Builder with the operation pre-loaded.",
  "Duplicate (copy) — creates a copy of the operation with 'idle' status.",
  "Delete (trash) — permanently removes the operation (with confirmation).",
]);

note(
  "Starting an operation from the Operations list will automatically navigate you to the Control Panel so you can monitor the active transmission."
);

// ─── Section 8: Session Timer & Chi Frequency ────────────────────────────────

sectionHeading("8 · Session Timer & Chi Frequency");

subHeading("Timed Sessions");
body(
  "Set a duration in minutes (1–1440 min). The session runs until the elapsed time reaches the target, then automatically stops and marks the operation as completed. The progress ring in the Control Panel shows percentage completion."
);

subHeading("Continuous Sessions");
body(
  "When 'Continuous' mode is selected, the session runs indefinitely until you manually stop or pause it. The clock displays elapsed time counting upward. This is ideal for long-running environmental broadcasts."
);

subHeading("Chi Frequency Presets");
const freqs = [
  ["0.6 Hz", "Deep delta — unconscious programming"],
  ["7.83 Hz", "Schumann Resonance — Earth's natural frequency"],
  ["10 Hz", "Alpha — relaxation, enhanced receptivity"],
  ["40 Hz", "Gamma — peak focus, manifestation clarity"],
  ["174 Hz", "Foundation / pain relief"],
  ["285 Hz", "Tissue and field repair"],
  ["396 Hz", "Liberation from fear and guilt"],
  ["417 Hz", "Undoing situations, facilitating change"],
  ["432 Hz", "Natural tuning, heart resonance"],
  ["528 Hz", "DNA repair, transformation, miracles"],
  ["639 Hz", "Relationships and reconnection"],
  ["741 Hz", "Awakening intuition, solutions"],
  ["852 Hz", "Spiritual order, intuition"],
  ["963 Hz", "Crown activation, divine connection"],
];
for (const [hz, desc] of freqs) {
  doc
    .fillColor(AMBER)
    .font("Courier-Bold")
    .fontSize(9)
    .text(`${hz.padEnd(9)}`, 60, doc.y, { continued: true, width: 90 });
  doc
    .fillColor(BODY)
    .font("Helvetica")
    .fontSize(9)
    .text(desc, { lineGap: 2 });
}
doc.moveDown(0.5);

// ─── Section 9: Symbolic Filter Cards ────────────────────────────────────────

doc.addPage({ size: "A4", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
pageHeader();

sectionHeading("9 · Symbolic Filter Cards");
body(
  "Filter Cards are symbolic sigils drawn from traditions of sacred geometry, solfeggio frequencies, chakra systems, numerology, and elemental forces. They act as energetic modulators applied to your broadcast."
);
body(
  "Cards can be assigned at two levels:"
);
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
  "Elements — Earth, Water, Fire, Air, Ether/Akasha.",
  "Numerology — numerical archetypes and their vibrational meaning.",
]);

subHeading("Managing the Card Library");
bullet([
  "Navigate to 'Cards' in the sidebar to view all available cards.",
  "Star cards to mark them as favourites for quick access.",
  "Filter by category using the tabs at the top.",
  "Custom cards can be created with a name, symbol (emoji), and description.",
]);

subHeading("Applying Cards to Operations");
body(
  "In the Position Builder, each position has a Cards section. Click cards to add or remove them. Selected cards appear highlighted. During transmission, cards are shown in the Control Panel — position-specific cards appear inside the cycling Trend panel, and operation-wide cards appear in the Filter Cards grid."
);

// ─── Section 10: Background & Visual Settings ─────────────────────────────────

sectionHeading("10 · Background & Visual Settings");
body(
  "The 'BG' button at the bottom of the sidebar opens the Background Picker. You can personalize the machine-room atmosphere with six built-in gradient presets or a custom image upload."
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

// ─── Section 11: Sequencer ────────────────────────────────────────────────────

sectionHeading("11 · Sequencer");
body(
  "The Sequencer allows you to chain multiple frequency steps into an automated sequence. Each step has its own chi frequency and duration, and the system moves through steps in order."
);
bullet([
  "Add steps with the + button.",
  "Set the frequency and duration (in minutes) for each step.",
  "Give the sequence a name and save it.",
  "Start the sequencer from the Sequencer page — it will step through automatically.",
]);
note("The Sequencer is ideal for multi-stage clearing protocols, layered healing sessions, or progressive manifestation sequences.");

// ─── Section 12: Export & Transfer Diagrams ───────────────────────────────────

sectionHeading("12 · Export & Transfer Diagrams");

subHeading("Export Page");
body(
  "The Export page allows you to save a complete snapshot of your operations and cards to a JSON file, which you can back up or import on another device."
);

subHeading("Transfer Diagrams");
body(
  "A Transfer Diagram is a printable document that encodes the operation's intention and target information. It is designed to be placed on a physical chi generator (such as an orgone accumulator or radionic broadcaster) to create a structural link between the digital operation and a physical device."
);
bullet([
  "Navigate to 'Transfer Diagram' in the sidebar.",
  "Select an operation to generate its diagram.",
  "Print the diagram and place it on your physical device.",
  "The diagram includes the operation name, target, trend intention, and radionic rates.",
]);

// ─── Section 13: Best Practices ───────────────────────────────────────────────

doc.addPage({ size: "A4", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
pageHeader();

sectionHeading("13 · Best Practices & Tips");

subHeading("Crafting Effective Intentions");
bullet([
  "Use present-tense, positive language: 'I am healthy and vibrant' rather than 'I am not sick'.",
  "Be specific but not restrictive — allow the universe to find the best path.",
  "Charge each word with genuine feeling and belief.",
  "Review and refine your intention statements regularly.",
]);

subHeading("Rate Finding");
bullet([
  "Find rates in a calm, centered state — meditation before rate-finding improves accuracy.",
  "Trust your first impression. Overthinking leads to less accurate rates.",
  "Reference rate books can be used for common qualities — enter them manually.",
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
  "Print the Transfer Diagram and place it on your orgone accumulator or chi generator.",
  "Point the output of the physical device toward the diagram.",
  "Run the corresponding digital operation simultaneously for maximum effect.",
  "Replace printed diagrams weekly or whenever the intention changes.",
]);

note(
  "Orgone Manifestation X is a tool for focused intention and energetic broadcasting. Results vary based on operator skill, clarity of intention, and alignment with natural laws. Use this software ethically and with positive intent."
);

// ─── Section 14: Troubleshooting ─────────────────────────────────────────────

sectionHeading("14 · Troubleshooting");

const troubleshooting: [string, string][] = [
  [
    "License key not accepted",
    "Check for typos or extra spaces. Keys are not case-sensitive. If the key was previously used on this device, clear browser storage and re-enter. Contact support if the issue persists.",
  ],
  [
    "Operation stops immediately after starting",
    "If an operation has a short timed duration and was previously run to completion, it will reset to zero and start fresh. If it stops in under 5 seconds, check the session duration setting in the Builder.",
  ],
  [
    "StickPad not responding to hold",
    "Ensure you are pressing and holding (not just clicking) the StickPad circle. On touch devices, hold your finger without moving.",
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
  doc.moveDown(0.5);
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(`Q: ${problem}`);
  doc
    .fillColor(BODY)
    .font("Helvetica")
    .fontSize(9.5)
    .text(`A: ${solution}`, { lineGap: 3 });
}

doc.moveDown(2);
hr();
doc.moveDown(1);

doc
  .fillColor(DIM)
  .font("Helvetica-Oblique")
  .fontSize(9)
  .text(
    "Orgone Manifestation X is a spiritual and intention-focusing tool. It is not a medical device and makes no medical claims. Use responsibly and ethically.",
    { align: "center", width: doc.page.width - 120 }
  );

doc.moveDown(0.5);
doc
  .fillColor("#2D2D5A")
  .font("Helvetica-Bold")
  .fontSize(9)
  .text(`© ${new Date().getFullYear()} Super Manifestation X. All rights reserved.`, {
    align: "center",
    width: doc.page.width - 120,
  });

// ─── Finalize ─────────────────────────────────────────────────────────────────

doc.end();

stream.on("finish", () => {
  console.log(`✅ Manual generated: ${OUT_PATH}`);
});

stream.on("error", (err) => {
  console.error("❌ Error writing PDF:", err);
  process.exit(1);
});
