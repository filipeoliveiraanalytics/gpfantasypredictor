const ASSET_VERSION = "20260604-price-step-185";
const DATA_PATH = `data/fantasy_projections.csv?v=${ASSET_VERSION}`;
const PRICE_MOVEMENTS_PATH = `data/fantasy_price_movements.csv?v=${ASSET_VERSION}`;
const CONSENT_KEY = "gp_fantasy_predictor_analytics_consent";
const AVAILABLE_CHIPS_KEY = "gp_fantasy_predictor_available_chips";

const CHIP_CONFIG = {
  none: { label: "No chip" },
  limitless: { label: "Limitless" },
  wildcard: { label: "Wildcard" },
  final_fix: { label: "Final Fix" },
  auto_pilot: { label: "Auto Pilot" },
  no_negative: { label: "No Negative" },
  x3: { label: "x3 Boost" },
};

const STRATEGY_NOTES = {
  max_points: "Max Points ranks the strongest projected lineup, even if it uses paid transfers.",
  current_friendly: "Transfer Friendly avoids paid transfers unless a selected chip changes the transfer rules.",
  budget_growth: "Budget Growth buys assets with a realistic path to a price rise, then ranks by points plus price upside.",
};

const PRICE_RISE_TARGETS = {
  "driver:ALO": { pointsNeeded: 26, source: "community threshold read" },
  "driver:COL": { pointsNeeded: 0, source: "community threshold read" },
  "driver:STR": { pointsNeeded: 0, source: "community threshold read" },
};

const TEAM_COLORS = {
  Mercedes: "#00d2be",
  Ferrari: "#f91536",
  McLaren: "#ff8000",
  "Red Bull Racing": "#3671c6",
  "Haas F1 Team": "#b6babd",
  Alpine: "#2293d1",
  "Racing Bulls": "#6692ff",
  Williams: "#64c4ff",
  Cadillac: "#9b8f80",
  Audi: "#c9ccd1",
  "Aston Martin": "#006f62",
};

const DRIVER_AVATAR_PROFILES = {
  ANT: { skin: "#d9a071", hair: "#1c1714", hairline: 31, tilt: -2, beard: 0 },
  RUS: { skin: "#e4b48f", hair: "#4a2f23", hairline: 34, tilt: 2, beard: 0 },
  HAM: { skin: "#8a593f", hair: "#14100e", hairline: 36, tilt: -3, beard: 0.65 },
  LEC: { skin: "#d99f76", hair: "#251915", hairline: 29, tilt: -1, beard: 0.35 },
  PIA: { skin: "#e3b18c", hair: "#5d3d2d", hairline: 39, tilt: 1, beard: 0 },
  NOR: { skin: "#e2ad83", hair: "#3e2a20", hairline: 26, tilt: -4, beard: 0.12 },
  VER: { skin: "#e1b48e", hair: "#9b7043", hairline: 37, tilt: 3, beard: 0.18 },
  BEA: { skin: "#dfaa80", hair: "#3b241a", hairline: 28, tilt: -2, beard: 0 },
  GAS: { skin: "#d7a17a", hair: "#201612", hairline: 33, tilt: 2, beard: 0.45 },
  HAD: { skin: "#c88b67", hair: "#17110f", hairline: 30, tilt: -3, beard: 0.18 },
  ALO: { skin: "#c28a66", hair: "#261914", hairline: 35, tilt: 2, beard: 0.7 },
  OCO: { skin: "#d4a17e", hair: "#1b1512", hairline: 32, tilt: -2, beard: 0.16 },
  SAI: { skin: "#c78d68", hair: "#201512", hairline: 30, tilt: 1, beard: 0.55 },
  LAW: { skin: "#d7a580", hair: "#4a3023", hairline: 33, tilt: -1, beard: 0.12 },
  BOR: { skin: "#c89471", hair: "#2a1b16", hairline: 31, tilt: 2, beard: 0.12 },
  HUL: { skin: "#e2b58d", hair: "#b68a50", hairline: 36, tilt: 1, beard: 0.22 },
  BOT: { skin: "#d6a47d", hair: "#9b7a58", hairline: 38, tilt: -1, beard: 0.65 },
  STR: { skin: "#d5a07a", hair: "#2d1e18", hairline: 29, tilt: 2, beard: 0.18 },
  LIN: { skin: "#bd8765", hair: "#15110f", hairline: 27, tilt: -3, beard: 0 },
  PER: { skin: "#b77957", hair: "#17110f", hairline: 34, tilt: 3, beard: 0.72 },
  ALB: { skin: "#b98562", hair: "#15100e", hairline: 32, tilt: -1, beard: 0.22 },
  COL: { skin: "#c88e68", hair: "#2b1b15", hairline: 29, tilt: 1, beard: 0.12 },
};

const state = {
  projections: [],
  drivers: [],
  constructors: [],
  driverPhotos: new Set(),
  driverPhotoBasePath: "assets/drivers",
  priceMovements: new Map(),
  constructorLogos: new Set(),
  constructorLogoFiles: new Map(),
  constructorLogoBasePath: "assets/constructors",
  pickerType: null,
  pickerSelection: new Set(),
};

const els = {
  form: document.querySelector("#optimizer-form"),
  optimizeButton: document.querySelector("#optimize-button"),
  status: document.querySelector("#data-status"),
  budget: document.querySelector("#budget"),
  freeTransfers: document.querySelector("#free-transfers"),
  drivers: document.querySelector("#drivers"),
  constructors: document.querySelector("#constructors"),
  strategy: document.querySelector("#strategy"),
  strategyNote: document.querySelector("#strategy-note"),
  availableChipInputs: [...document.querySelectorAll("#available-chip-options input[type='checkbox']")],
  chipStatus: document.querySelector("#chip-status"),
  openDriverPicker: document.querySelector("#open-driver-picker"),
  openConstructorPicker: document.querySelector("#open-constructor-picker"),
  driverPickerSummary: document.querySelector("#driver-picker-summary"),
  constructorPickerSummary: document.querySelector("#constructor-picker-summary"),
  modal: document.querySelector("#picker-modal"),
  pickerTitle: document.querySelector("#picker-title"),
  pickerHelp: document.querySelector("#picker-help"),
  pickerList: document.querySelector("#picker-list"),
  closePicker: document.querySelector("#close-picker"),
  applyPicker: document.querySelector("#apply-picker"),
  netPoints: document.querySelector("#net-points"),
  teamCost: document.querySelector("#team-cost"),
  boostCardLabel: document.querySelector("#boost-card-label"),
  boostDriver: document.querySelector("#boost-driver"),
  priceDelta: document.querySelector("#price-delta"),
  whyLineup: document.querySelector("#why-lineup"),
  driverList: document.querySelector("#driver-list"),
  constructorList: document.querySelector("#constructor-list"),
  transfersIn: document.querySelector("#transfers-in"),
  transfersOut: document.querySelector("#transfers-out"),
  transferPenalty: document.querySelector("#transfer-penalty"),
  alternatives: document.querySelector("#alternatives"),
  alternativeCards: document.querySelector("#alternative-cards"),
  cookieBanner: document.querySelector("#cookie-banner"),
  acceptAnalytics: document.querySelector("#accept-analytics"),
  declineAnalytics: document.querySelector("#decline-analytics"),
  forecastLink: document.querySelector("#forecast-link"),
};

function hasAnalyticsId() {
  return window.GA_MEASUREMENT_ID && !window.GA_MEASUREMENT_ID.includes("XXXXXXXXXX");
}

function loadAnalytics() {
  if (!hasAnalyticsId() || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", window.GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${window.GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

function assetByKey(type, key) {
  return state.projections.find((row) => row.entity_type === type && row.key === key);
}

function trackAssetSet(eventName, keys, type, context = {}) {
  keys.forEach((key, index) => {
    const asset = assetByKey(type, key);
    trackEvent(eventName, {
      ...context,
      asset_type: type,
      asset_key: key,
      asset_name: asset?.name ?? key,
      asset_team: asset?.team ?? "",
      asset_slot: index + 1,
    });
  });
}

function initConsent() {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === "accepted") {
    loadAnalytics();
    return;
  }
  if (consent !== "declined") {
    els.cookieBanner.hidden = false;
  }
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseKeys(value) {
  return new Set(
    String(value)
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  );
}

function combinations(items, size) {
  const output = [];
  const combo = [];

  function walk(start) {
    if (combo.length === size) {
      output.push([...combo]);
      return;
    }
    for (let i = start; i <= items.length - (size - combo.length); i += 1) {
      combo.push(items[i]);
      walk(i + 1);
      combo.pop();
    }
  }

  walk(0);
  return output;
}

function strategyScore(team, strategy) {
  if (strategy === "current_friendly") return team.netExpectedPoints;
  if (strategy === "budget_growth") return team.netExpectedPoints + team.projectedBudgetDelta * 35 + incomingBudgetDelta(team) * 20;
  return team.projectedPoints;
}

function updateStrategyNote() {
  els.strategyNote.textContent = STRATEGY_NOTES[els.strategy.value] || STRATEGY_NOTES.max_points;
}

function chipLabel(value) {
  return CHIP_CONFIG[value]?.label ?? "No chip";
}

function getAvailableChips() {
  return new Set(els.availableChipInputs.filter((input) => input.checked).map((input) => input.value));
}

function loadAvailableChips() {
  const saved = localStorage.getItem(AVAILABLE_CHIPS_KEY);
  if (saved === null) return;

  const available = parseKeys(saved);
  els.availableChipInputs.forEach((input) => {
    input.checked = available.has(input.value.toUpperCase());
  });
}

function saveAvailableChips() {
  localStorage.setItem(AVAILABLE_CHIPS_KEY, [...getAvailableChips()].join(","));
}

function syncChipAvailability() {
  const available = getAvailableChips();
  els.chipStatus.textContent =
    available.size === 0
      ? "No chips available. The model will keep standard rules."
      : `${available.size} ${available.size === 1 ? "chip" : "chips"} available. The model will recommend whether to use one.`;
}

function hasUnlimitedTransfers(chip) {
  return chip === "limitless" || chip === "wildcard";
}

function ignoresBudget(chip) {
  return chip === "limitless";
}

function teamColor(team) {
  return TEAM_COLORS[team] || "#f0c84b";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hashKey(value) {
  return String(value ?? "")
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 997, 7);
}

function driverAvatar(row, size = "default") {
  const hash = hashKey(row.key);
  const skinTones = ["#f0c7a5", "#dca77d", "#b97857", "#8d5b42", "#f4d4b8", "#c68a64"];
  const hairTones = ["#201713", "#4b3024", "#7b563b", "#c09a63", "#111827", "#5d4032"];
  const profile = DRIVER_AVATAR_PROFILES[row.key] || {};
  const skin = profile.skin || skinTones[hash % skinTones.length];
  const hair = profile.hair || hairTones[Math.floor(hash / 7) % hairTones.length];
  const hairline = profile.hairline || 28 + (hash % 15);
  const tilt = profile.tilt ?? -7 + (hash % 15);
  const beard = profile.beard ?? 0;
  const brow = 0.38 + Math.min(0.38, beard * 0.26 + (hash % 4) * 0.035);
  const hairHeight = 22 + (hash % 8);
  const hairWidth = 52 + (hash % 8);
  const photoKey = row.key.toLowerCase();
  const hasPhoto = state.driverPhotos.has(photoKey);
  const photoClass = hasPhoto ? "driver-avatar--photo" : "";
  const photoMarkup = hasPhoto
    ? `<img class="driver-avatar__photo" src="${escapeHtml(state.driverPhotoBasePath)}/${escapeHtml(photoKey)}.webp" alt="" loading="lazy" onerror="this.parentElement.classList.remove('driver-avatar--photo'); this.remove();" />`
    : "";

  return `
    <span class="driver-avatar ${photoClass} driver-avatar--${size} driver-avatar--${escapeHtml(photoKey)}" style="--team-color:${teamColor(row.team)}; --avatar-skin:${skin}; --avatar-hair:${hair}; --avatar-hairline:${hairline}%; --avatar-tilt:${tilt}deg; --avatar-beard:${beard}; --avatar-brow:${brow}; --avatar-hair-height:${hairHeight}%; --avatar-hair-width:${hairWidth}%" aria-hidden="true">
      ${photoMarkup}
      <span class="driver-avatar__suit"></span>
      <span class="driver-avatar__neck"></span>
      <span class="driver-avatar__ear driver-avatar__ear--left"></span>
      <span class="driver-avatar__ear driver-avatar__ear--right"></span>
      <span class="driver-avatar__head"></span>
      <span class="driver-avatar__hair"></span>
      <span class="driver-avatar__brows"></span>
      <span class="driver-avatar__eyes"></span>
      <span class="driver-avatar__nose"></span>
      <span class="driver-avatar__beard"></span>
      <span class="driver-avatar__smile"></span>
      <span class="driver-avatar__code">${escapeHtml(row.key)}</span>
    </span>`;
}

function constructorMark(row, size = "default") {
  const key = row.key.toUpperCase();
  const logoKey = key.toLowerCase();
  const hasLogo = state.constructorLogos.has(logoKey);
  const logoClass = hasLogo ? "constructor-mark--logo" : "";
  const logoFile = state.constructorLogoFiles.get(logoKey) || `${logoKey}.webp`;
  const logoMarkup = hasLogo
    ? `<img class="constructor-mark__logo" src="${escapeHtml(state.constructorLogoBasePath)}/${escapeHtml(logoFile)}" alt="" loading="lazy" onerror="this.parentElement.classList.remove('constructor-mark--logo'); this.remove();" />`
    : "";
  return `
    <span class="constructor-mark ${logoClass} constructor-mark--${size} constructor-mark--${escapeHtml(logoKey)}" style="--team-color:${teamColor(row.team)}" aria-hidden="true">
      ${logoMarkup}
      <span class="constructor-mark__fallback">${escapeHtml(key)}</span>
    </span>`;
}

function entityMark(row, size = "default") {
  return row.entity_type === "driver" ? driverAvatar(row, size) : constructorMark(row, size);
}

function summarizeTeam(driverCombo, constructorCombo, inputs) {
  const entities = [...driverCombo, ...constructorCombo];
  const driverKeys = driverCombo.map((row) => row.key);
  const constructorKeys = constructorCombo.map((row) => row.key);
  const totalCost = entities.reduce((sum, row) => sum + toNumber(row.price_m), 0);
  const expectedPoints = entities.reduce((sum, row) => sum + toNumber(row.expected_fantasy_points), 0);
  const avgRiskScore = entities.reduce((sum, row) => sum + toNumber(row.risk_score), 0) / entities.length;
  const newDrivers = new Set(driverKeys);
  const newConstructors = new Set(constructorKeys);
  const driversIn = [...newDrivers].filter((key) => !inputs.currentDrivers.has(key));
  const driversOut = [...inputs.currentDrivers].filter((key) => !newDrivers.has(key));
  const constructorsIn = [...newConstructors].filter((key) => !inputs.currentConstructors.has(key));
  const constructorsOut = [...inputs.currentConstructors].filter((key) => !newConstructors.has(key));
  const transferCount = driversIn.length + constructorsIn.length;
  const paidTransfers = hasUnlimitedTransfers(inputs.activeChip) ? 0 : Math.max(0, transferCount - inputs.freeTransfers);
  const transferPenalty = paidTransfers * -10;
  const bestBoost = [...driverCombo].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points))[0];
  const boostBase = toNumber(bestBoost?.expected_fantasy_points);
  const boostMultiplier = 2;
  const chipExtraPoints = inputs.activeChip === "x3" ? boostBase : 0;
  const boostExtraPoints = boostBase + chipExtraPoints;
  const noNegativeProtection =
    inputs.activeChip === "no_negative"
      ? entities.reduce((sum, row) => sum + Math.abs(Math.min(0, toNumber(row.dnf_penalty_points_est))), 0)
      : 0;
  const projectedPoints = expectedPoints + boostExtraPoints + noNegativeProtection;
  const netExpectedPoints = projectedPoints + transferPenalty;
  const projectedBudgetDelta = teamBudgetDelta(entities);

  return {
    drivers: driverCombo,
    constructors: constructorCombo,
    driverKeys,
    constructorKeys,
    totalCost,
    budgetRemaining: inputs.budget - totalCost,
    activeChip: inputs.activeChip,
    expectedPoints,
    projectedPoints,
    netExpectedPoints,
    projectedBudgetDelta,
    valuePerMillion: expectedPoints / totalCost,
    avgRiskScore,
    transferCount,
    paidTransfers,
    transferPenalty,
    boostMultiplier,
    chipExtraPoints,
    boostExtraPoints,
    noNegativeProtection,
    driversIn,
    driversOut,
    constructorsIn,
    constructorsOut,
    bestBoost,
  };
}

function currentInputs(activeChip = "none") {
  return {
    budget: toNumber(els.budget.value),
    freeTransfers: Math.max(0, Math.floor(toNumber(els.freeTransfers.value))),
    currentDrivers: parseKeys(els.drivers.value),
    currentConstructors: parseKeys(els.constructors.value),
    strategy: els.strategy.value,
    activeChip,
  };
}

function findTopTeams(inputs) {
  const driverCombos = combinations(state.drivers, 5);
  const constructorCombos = combinations(state.constructors, 2);
  const teams = [];
  const budgetLimit = ignoresBudget(inputs.activeChip) ? Number.POSITIVE_INFINITY : inputs.budget;

  for (const driverCombo of driverCombos) {
    const driverCost = driverCombo.reduce((sum, row) => sum + toNumber(row.price_m), 0);
    if (driverCost > budgetLimit) continue;

    for (const constructorCombo of constructorCombos) {
      const team = summarizeTeam(driverCombo, constructorCombo, inputs);
      if (team.totalCost > budgetLimit) continue;
      if (inputs.strategy === "current_friendly" && !hasUnlimitedTransfers(inputs.activeChip) && team.transferCount > inputs.freeTransfers) continue;
      if (inputs.strategy === "budget_growth" && !hasOnlyGrowthTransfers(team)) continue;
      team.strategyScore = strategyScore(team, inputs.strategy);
      teams.push(team);
    }
  }

  teams.sort((a, b) => b.strategyScore - a.strategyScore || b.projectedPoints - a.projectedPoints);
  return teams.slice(0, 10);
}

function topDriverGap(team) {
  if (!team?.drivers?.length) return 0;
  const sorted = [...team.drivers].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points));
  return toNumber(sorted[0]?.expected_fantasy_points) - toNumber(sorted[1]?.expected_fantasy_points);
}

function trackProfile(team) {
  const gp = (team?.drivers?.[0]?.next_gp ?? "").toLowerCase();
  return {
    gp,
    isMonaco: gp.includes("monaco"),
    isStreet: ["monaco", "singapore", "baku", "jeddah", "las vegas"].some((name) => gp.includes(name)),
    isSprint: gp.includes("sprint"),
  };
}

function applyChipToTeam(team, chip, strategy) {
  if (!team) return team;
  const entities = [...team.drivers, ...team.constructors];
  const boostMultiplier = 2;
  const boostBase = toNumber(team.bestBoost?.expected_fantasy_points);
  const chipExtraPoints = chip === "x3" ? boostBase : 0;
  const boostExtraPoints = boostBase + chipExtraPoints;
  const noNegativeProtection =
    chip === "no_negative"
      ? entities.reduce((sum, row) => sum + Math.abs(Math.min(0, toNumber(row.dnf_penalty_points_est))), 0)
      : 0;
  const paidTransfers = hasUnlimitedTransfers(chip) ? 0 : team.paidTransfers;
  const transferPenalty = paidTransfers * -10;
  const projectedPoints = team.expectedPoints + boostExtraPoints + noNegativeProtection;
  const updatedTeam = {
    ...team,
    activeChip: chip,
    paidTransfers,
    transferPenalty,
    boostMultiplier,
    chipExtraPoints,
    boostExtraPoints,
    noNegativeProtection,
    projectedPoints,
    netExpectedPoints: projectedPoints + transferPenalty,
    projectedBudgetDelta: team.projectedBudgetDelta,
  };

  return {
    ...updatedTeam,
    strategyScore: strategyScore(updatedTeam, strategy),
  };
}

function recommendChip(base, availableChips) {
  if (!base || availableChips.size === 0) {
    return { chip: "none", confidence: "Hold", reason: "No available chip creates a strong enough edge this week." };
  }

  const profile = trackProfile(base);
  const result = { chip: "none", confidence: "Hold", reason: "No available chip creates a strong enough edge this week." };
  const transferPressure = base.paidTransfers > 0 || base.transferCount >= 4;
  const boostGap = topDriverGap(base);
  const riskProtection = applyChipToTeam(base, "no_negative", "max_points").noNegativeProtection;

  const candidates = [];
  if (availableChips.has("final_fix") && (profile.isMonaco || profile.isStreet)) {
    candidates.push({
      chip: "final_fix",
      score: profile.isMonaco ? 12 : 9,
      confidence: "Strong",
      reason: `${chipLabel("final_fix")} fits ${base.drivers[0]?.next_gp ?? "this GP"} because qualifying and track position are unusually important. Hold it until after qualifying, then fix one weak grid result.`,
    });
  }

  if (availableChips.has("limitless") && (profile.isSprint || (profile.isMonaco && base.budgetRemaining < 0.7 && transferPressure))) {
    candidates.push({
      chip: "limitless",
      score: profile.isSprint ? 13 : 8,
      confidence: profile.isSprint ? "Strong" : "Medium",
      reason: `${chipLabel("limitless")} can work as a one-week attack when the best lineup is budget squeezed, especially if premium constructors are important.`,
    });
  }

  if (availableChips.has("wildcard") && transferPressure) {
    candidates.push({
      chip: "wildcard",
      score: base.paidTransfers > 0 ? 11 + base.paidTransfers : 7 + base.transferCount,
      confidence: base.transferCount >= 5 ? "Strong" : "Medium",
      reason: `${chipLabel("wildcard")} fits because the optimizer wants ${base.transferCount} moves and the free-transfer limit is holding the rebuild back.`,
    });
  }

  if (availableChips.has("x3") && boostGap >= 7) {
    candidates.push({
      chip: "x3",
      score: boostGap + (profile.isSprint ? 5 : 0),
      confidence: boostGap >= 10 ? "Strong" : "Medium",
      reason: `${chipLabel("x3")} fits because ${base.bestBoost?.key ?? "the top driver"} is clearly ahead of the next boost option by about ${formatNumber(boostGap, 1)} pts.`,
    });
  }

  if (availableChips.has("auto_pilot") && boostGap <= 3 && base.drivers.length) {
    candidates.push({
      chip: "auto_pilot",
      score: 7 - boostGap + (profile.isSprint ? 2 : 0),
      confidence: "Medium",
      reason: `${chipLabel("auto_pilot")} fits because the best 2x choice is close; letting the game pick after the weekend reduces manual boost risk.`,
    });
  }

  if (availableChips.has("no_negative") && (riskProtection >= 8 || profile.isStreet)) {
    candidates.push({
      chip: "no_negative",
      score: riskProtection + (profile.isStreet ? 4 : 0),
      confidence: riskProtection >= 10 ? "Strong" : "Medium",
      reason: `${chipLabel("no_negative")} protects about ${formatNumber(riskProtection, 1)} pts of modelled downside, useful on street or chaotic weekends.`,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? result;
}

function optimize() {
  const baseInputs = currentInputs("none");
  const availableChips = getAvailableChips();
  const baseTeams = findTopTeams(baseInputs);
  const chipRecommendation = recommendChip(baseTeams[0], availableChips);
  const topTeams = baseTeams
    .map((team) => applyChipToTeam(team, chipRecommendation.chip, baseInputs.strategy))
    .sort((a, b) => b.strategyScore - a.strategyScore || b.projectedPoints - a.projectedPoints)
    .slice(0, 10);

  render(topTeams, chipRecommendation);

  if (topTeams[0]) {
    const currentDriverKeys = [...baseInputs.currentDrivers];
    const currentConstructorKeys = [...baseInputs.currentConstructors];
    const recommended = topTeams[0];
    const modelContext = {
      strategy: baseInputs.strategy,
      next_gp: recommended.drivers[0]?.next_gp ?? "",
      model_mode: recommended.drivers[0]?.mode ?? "",
    };

    trackEvent("optimize_team", {
      strategy: baseInputs.strategy,
      free_transfers: baseInputs.freeTransfers,
      recommended_chip: chipRecommendation.chip,
      available_chips: [...availableChips].join("|"),
      budget: baseInputs.budget,
      current_drivers: currentDriverKeys.join("|"),
      current_constructors: currentConstructorKeys.join("|"),
      recommended_drivers: recommended.driverKeys.join("|"),
      recommended_constructors: recommended.constructorKeys.join("|"),
      recommended_boost: recommended.bestBoost?.key ?? "",
      transfer_count: recommended.transferCount,
      paid_transfers: recommended.paidTransfers,
    });

    trackAssetSet("fantasy_asset_selected", currentDriverKeys, "driver", modelContext);
    trackAssetSet("fantasy_asset_selected", currentConstructorKeys, "constructor", modelContext);
    trackAssetSet("fantasy_asset_recommended", recommended.driverKeys, "driver", modelContext);
    trackAssetSet("fantasy_asset_recommended", recommended.constructorKeys, "constructor", modelContext);
  }
}

function runOptimization() {
  document.body.classList.add("is-optimizing");
  els.optimizeButton.disabled = true;
  els.optimizeButton.textContent = "Optimizing...";
  els.status.textContent = "Calculating the best lineup...";

  requestAnimationFrame(() => {
    try {
      optimize();
    } finally {
      document.body.classList.remove("is-optimizing");
      els.optimizeButton.disabled = false;
      els.optimizeButton.textContent = "Optimize Team";
    }
  });
}

function chip(row) {
  const color = teamColor(row.team);
  const price = `${formatNumber(toNumber(row.price_m), 1)}M`;
  const points = `${formatNumber(toNumber(row.expected_fantasy_points), 1)} pts`;
  const priceSignal = priceMomentum(row);
  return `
    <span class="chip ${row.entity_type === "driver" ? "chip--driver" : "chip--constructor"}" style="--team-color:${color}">
      ${entityMark(row, "chip")}
      <span class="chip-copy">
        <strong>${escapeHtml(row.name)}</strong>
        <span>${escapeHtml(row.team)} | ${price} | ${points}</span>
      </span>
      <span class="price-signal price-signal--${priceSignal.tone}" title="${escapeHtml(priceSignal.reason)}">${escapeHtml(priceSignal.label)}</span>
    </span>`;
}

function rowValue(row) {
  const explicitValue = toNumber(row.value_per_million, Number.NaN);
  if (Number.isFinite(explicitValue)) return explicitValue;
  const price = toNumber(row.price_m);
  return price ? toNumber(row.expected_fantasy_points) / price : 0;
}

function sortByValue(rows) {
  return [...rows].sort(
    (a, b) =>
      rowValue(b) - rowValue(a) ||
      toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points) ||
      a.name.localeCompare(b.name)
  );
}

function priceMoveKey(row) {
  return `${row.entity_type}:${row.key}`;
}

function latestPriceMove(row) {
  return state.priceMovements.get(priceMoveKey(row)) || null;
}

function priceStep(row) {
  return toNumber(row.price_m) < 18.5 ? 0.6 : 0.3;
}

function priceRiseTarget(row) {
  return PRICE_RISE_TARGETS[priceMoveKey(row)] || null;
}

function thresholdPriceSignal(row) {
  const target = priceRiseTarget(row);
  if (!target) return null;

  const expected = toNumber(row.expected_fantasy_points);
  const pointsNeeded = toNumber(target.pointsNeeded);
  const edge = expected - pointsNeeded;
  const step = priceStep(row);
  const easyRiseBuffer = pointsNeeded <= 1 && edge >= -1;

  if (edge >= 0 || easyRiseBuffer) {
    return {
      delta: step,
      tone: "rise",
      label: `+${formatNumber(step, 1)}M`,
      reason:
        edge >= 0
          ? `${formatNumber(expected, 1)} projected pts vs ${formatNumber(pointsNeeded, 1)} needed for a likely price rise (${target.source}).`
          : `${formatNumber(pointsNeeded, 1)} pts appears enough for a price rise; ${formatNumber(expected, 1)} projected pts is close enough to keep as budget upside (${target.source}).`,
    };
  }

  if (edge <= -8) {
    return {
      delta: -step,
      tone: "fall",
      label: `${formatNumber(-step, 1)}M`,
      reason: `${formatNumber(expected, 1)} projected pts is well short of the ${formatNumber(pointsNeeded, 1)} pts likely needed for a price rise (${target.source}).`,
    };
  }

  return {
    delta: 0,
    tone: "stable",
    label: "Stable",
    reason: `${formatNumber(expected, 1)} projected pts is close to the ${formatNumber(pointsNeeded, 1)} pts price-rise target (${target.source}).`,
  };
}

function inferredPriceChange(row) {
  const ppm = rowValue(row);
  const step = priceStep(row);
  const recentMove = toNumber(latestPriceMove(row)?.price_delta_m, 0);

  if (ppm >= 1.2) return step;
  if (ppm >= 0.9) return Math.max(0.1, step / 2);
  if (ppm <= 0.55) return -step;
  if (ppm <= 0.75) return -Math.max(0.1, step / 2);
  if (recentMove > 0 && ppm >= 0.78) return Math.max(0.1, step / 2);
  if (recentMove < 0 && ppm <= 0.82) return -Math.max(0.1, step / 2);
  return 0;
}

function projectedPriceChange(row) {
  return thresholdPriceSignal(row)?.delta ?? inferredPriceChange(row);
}

function priceMomentum(row) {
  const thresholdSignal = thresholdPriceSignal(row);
  if (thresholdSignal) return thresholdSignal;

  const delta = projectedPriceChange(row);
  const ppm = rowValue(row);
  if (delta > 0) {
    return {
      delta,
      tone: "rise",
      label: `+${formatNumber(delta, 1)}M`,
      reason: `${formatNumber(ppm, 2)} projected pts/M suggests price-rise momentum.`,
    };
  }
  if (delta < 0) {
    return {
      delta,
      tone: "fall",
      label: `${formatNumber(delta, 1)}M`,
      reason: `${formatNumber(ppm, 2)} projected pts/M suggests price-fall risk.`,
    };
  }
  return {
    delta,
    tone: "stable",
    label: "Stable",
    reason: `${formatNumber(ppm, 2)} projected pts/M looks close to stable.`,
  };
}

function teamBudgetDelta(rows) {
  return rows.reduce((sum, row) => sum + projectedPriceChange(row), 0);
}

function rowsByKey(type, keys) {
  const source = type === "driver" ? state.drivers : state.constructors;
  const lookup = new Map(source.map((row) => [row.key, row]));
  return keys.map((key) => lookup.get(key)).filter(Boolean);
}

function transferInRows(team) {
  return [...rowsByKey("driver", team.driversIn), ...rowsByKey("constructor", team.constructorsIn)];
}

function incomingBudgetDelta(team) {
  return teamBudgetDelta(transferInRows(team));
}

function hasOnlyGrowthTransfers(team) {
  const incoming = transferInRows(team);
  return incoming.length === 0 || incoming.every((row) => projectedPriceChange(row) > 0);
}

function formatSignedMoney(value) {
  if (value > 0) return `+${formatNumber(value, 1)}M`;
  if (value < 0) return `${formatNumber(value, 1)}M`;
  return "Stable";
}

function formatNumber(value, decimals = 1) {
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function budgetLeftLabel(team) {
  if (team.activeChip === "limitless") return "Limitless";
  return `${formatNumber(team.budgetRemaining, 1)}M left`;
}

function transferSummary(team) {
  if (team.transferCount === 0) return "No transfers needed";
  if (team.paidTransfers === 0) return `${team.transferCount} free ${team.transferCount === 1 ? "move" : "moves"}`;
  return `${team.transferCount} moves | ${team.paidTransfers} paid`;
}

function boostDriverMarkup(team) {
  const driver = team.bestBoost;
  if (!driver) return "--";

  return `
    ${driverAvatar(driver, "boost")}
    <span>
      <b>${escapeHtml(driver.key)}</b>
      <small>${escapeHtml(driver.name)}</small>
    </span>`;
}

function chipContext(team, recommendation) {
  const chip = recommendation?.chip ?? team.activeChip;
  if (recommendation?.reason) return recommendation.reason;
  if (chip === "limitless") {
    return "Limitless ignores budget and transfer penalties, so this is treated as a one-week points attack rather than a permanent squad.";
  }
  if (chip === "wildcard") {
    return "Wildcard removes transfer penalties while staying under budget, so the recommendation can reshape the team without move costs.";
  }
  if (chip === "final_fix") {
    return "Final Fix is best judged after qualifying; use this lineup as the baseline, then repair one weak grid result before the race.";
  }
  if (chip === "auto_pilot") {
    return `Auto Pilot fits if you do not want to manually choose the 2x driver; the model currently expects ${team.bestBoost?.key ?? "the top driver"} to lead this lineup.`;
  }
  if (chip === "no_negative") {
    return `No Negative adds about ${formatNumber(team.noNegativeProtection, 1)} pts of downside protection from the model's negative-risk estimates.`;
  }
  if (chip === "x3") {
    return `x3 Boost makes ${team.bestBoost?.key ?? "the top driver"} the chip focus, lifting the projected boost from 2x to 3x.`;
  }
  return "No chip recommended, so the result keeps standard budget and transfer rules.";
}

function constructorContext(team) {
  const constructorNames = team.constructors.map((row) => row.name).join(" + ");
  const constructorKeys = new Set(team.constructorKeys);

  if (constructorKeys.has("MER") && constructorKeys.has("FER")) {
    return `${constructorNames} is expensive, but it fits Monaco: Mercedes leads the model's constructor projection and Ferrari is also strong on qualifying-heavy weekends.`;
  }
  if (constructorKeys.has("MER")) {
    return `${constructorNames} keeps Mercedes exposure, which is useful at Monaco because constructor qualifying points can be hard to recover elsewhere.`;
  }
  if (constructorKeys.has("FER")) {
    return `${constructorNames} leans into Ferrari's Monaco profile, where track position and clean qualifying tend to matter more than race overtakes.`;
  }
  return `${constructorNames} gives the model the best points-per-budget balance for this track and the selected transfer limit.`;
}

function budgetContext(team) {
  const budgetLeft = `${formatNumber(team.budgetRemaining, 1)}M`;
  if (team.paidTransfers > 0) {
    return `${transferSummary(team)} with ${budgetLeft} left. The projection still clears the transfer hit, but it is a more aggressive play.`;
  }
  if (team.activeChip === "limitless") {
    return `${transferSummary(team)} and no budget cap for this GP. The displayed cost shows what this one-week lineup would normally cost.`;
  }
  if (team.budgetRemaining < 0.3) {
    return `${transferSummary(team)} and nearly all budget used. That is acceptable here because Monaco rewards concentrated qualifying strength.`;
  }
  return `${transferSummary(team)} with ${budgetLeft} left, so the lineup improves projection without spending paid transfers.`;
}

function priceContext(team) {
  if (els.strategy.value === "budget_growth") {
    const incoming = transferInRows(team);
    const names = incoming.map((row) => `${row.key} ${priceMomentum(row).label}`).join(", ");
    return incoming.length
      ? `Budget Growth only bought rise candidates: ${names}. Existing fall-risk assets may stay if replacing them would hurt points or budget.`
      : "Budget Growth found no positive-momentum transfer that improved the lineup enough, so it kept the current structure.";
  }
  if (team.projectedBudgetDelta > 0.4) {
    return `This lineup has ${formatSignedMoney(team.projectedBudgetDelta)} estimated price momentum, useful if you want to grow budget for future GPs.`;
  }
  if (team.projectedBudgetDelta < -0.4) {
    return `This lineup has ${formatSignedMoney(team.projectedBudgetDelta)} estimated price risk, so it may cost future budget if the price model is right.`;
  }
  return "Price outlook looks fairly stable, so this recommendation is mostly about points and transfer efficiency.";
}

function trackContext(team, recommendation) {
  const gp = team.drivers[0]?.next_gp ?? "this GP";
  if (gp.toLowerCase().includes("monaco")) {
    return {
      title: "Monaco context: qualifying and track position carry extra weight",
      summary:
        "Monaco is usually low-overtake, so the optimizer is leaning into teams and drivers expected to qualify well rather than chasing comeback points.",
      insights: [
        ["Track logic", "Clean qualifying matters because race recovery is limited and position-change upside is harder to find."],
        ["Constructor logic", constructorContext(team)],
        ["Chip logic", chipContext(team, recommendation)],
        ["Price logic", priceContext(team)],
        ["Budget logic", budgetContext(team)],
      ],
    };
  }

  return {
    title: `${gp} context: model fit and transfer value`,
    summary:
      "The recommendation balances expected fantasy points with the cost of changing your current team.",
    insights: [
      ["Track logic", "The model weights qualifying, race finish, position-change and reliability estimates for this GP."],
      ["Constructor logic", constructorContext(team)],
      ["Chip logic", chipContext(team, recommendation)],
      ["Price logic", priceContext(team)],
      ["Budget logic", budgetContext(team)],
    ],
  };
}

function renderWhyLineup(team, recommendation) {
  const context = trackContext(team, recommendation);
  const recommendationLabel = recommendation?.chip === "none" ? "Save chips" : `Use ${chipLabel(recommendation?.chip)}`;

  els.whyLineup.hidden = false;
  els.whyLineup.innerHTML = `
    <div>
      <span class="why-lineup__kicker">Race context</span>
      <span class="chip-recommendation-badge">${escapeHtml(recommendationLabel)} | ${escapeHtml(recommendation?.confidence ?? "Hold")}</span>
      <strong>${escapeHtml(context.title)}</strong>
      <p>${escapeHtml(context.summary)}</p>
    </div>
    <ul>
      ${context.insights
        .map(
          ([label, value]) => `
          <li>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </li>`
        )
        .join("")}
    </ul>`;
}

function render(teams, chipRecommendation = { chip: "none", confidence: "Hold", reason: "No chip recommended." }) {
  const best = teams[0];
  if (!best) {
    els.status.textContent = "No valid team found for this budget.";
    els.alternatives.innerHTML = "";
    els.alternativeCards.innerHTML = "";
    els.whyLineup.hidden = true;
    els.whyLineup.innerHTML = "";
    return;
  }

  els.status.textContent = `${best.drivers[0]?.next_gp ?? "Next GP"} | ${best.drivers[0]?.mode ?? "Projection"}`;
  els.netPoints.textContent = formatNumber(best.projectedPoints, 1);
  els.teamCost.textContent = `${formatNumber(best.totalCost, 1)}M`;
  els.boostCardLabel.textContent = "2x boost driver";
  els.boostDriver.innerHTML = boostDriverMarkup(best);
  els.priceDelta.textContent = formatSignedMoney(best.projectedBudgetDelta);
  els.priceDelta.className = best.projectedBudgetDelta > 0 ? "price-positive" : best.projectedBudgetDelta < 0 ? "price-negative" : "";
  els.driverList.innerHTML = sortByValue(best.drivers).map(chip).join("");
  els.constructorList.innerHTML = sortByValue(best.constructors).map(chip).join("");
  els.transfersIn.textContent = [...best.driversIn, ...best.constructorsIn].join(", ") || "None";
  els.transfersOut.textContent = [...best.driversOut, ...best.constructorsOut].join(", ") || "None";
  els.transferPenalty.textContent = `${best.transferPenalty.toFixed(0)} pts`;
  renderWhyLineup(best, chipRecommendation);

  const displayTeams = teams.slice(0, 5);

  els.alternatives.innerHTML = displayTeams
    .map(
      (team, index) => `
      <tr class="${index === 0 ? "is-best" : ""}">
        <td>
          <span class="rank-badge">#${index + 1}</span>
          ${index === 0 ? `<span class="alt-tag">Recommended</span>` : ""}
        </td>
        <td>
          <div class="alt-lineup">
            <div>
              <span>Drivers</span>
              ${lineupList(team.drivers, "driver")}
            </div>
            <div>
              <span>Constructors</span>
              ${lineupList(team.constructors, "constructor")}
            </div>
          </div>
        </td>
        <td>
          <strong class="alt-score">${formatNumber(team.projectedPoints, 1)}</strong>
          <span class="alt-sub">Boost ${boostLabel(team)}${team.activeChip !== "none" ? ` | ${chipLabel(team.activeChip)}` : ""}</span>
        </td>
        <td>
          <strong>${formatNumber(team.totalCost, 1)}M</strong>
          <span class="alt-sub">${budgetLeftLabel(team)} | ${formatSignedMoney(team.projectedBudgetDelta)} outlook</span>
        </td>
        <td>
          <span class="transfer-pill ${team.paidTransfers ? "transfer-pill--paid" : ""}">${team.transferCount} moves</span>
          <span class="alt-sub">${team.paidTransfers ? `${team.paidTransfers} paid` : "Free only"}</span>
        </td>
      </tr>`
    )
    .join("");

  els.alternativeCards.innerHTML = displayTeams
    .map(
      (team, index) => `
      <article class="alternative-card ${index === 0 ? "is-best" : ""}">
        <header>
          <span class="rank-badge">#${index + 1}</span>
          <strong>${formatNumber(team.projectedPoints, 1)} pts</strong>
        </header>
        ${index === 0 ? `<span class="alt-tag">Recommended</span>` : ""}
        <dl>
          <div>
            <dt>Drivers</dt>
            <dd>${lineupList(team.drivers, "driver")}</dd>
          </div>
          <div>
            <dt>Constructors</dt>
            <dd>${lineupList(team.constructors, "constructor")}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>${formatNumber(team.totalCost, 1)}M | ${formatSignedMoney(team.projectedBudgetDelta)} outlook</dd>
          </div>
          <div>
            <dt>Boost</dt>
            <dd>${boostLabel(team)}</dd>
          </div>
          <div>
            <dt>Chip</dt>
            <dd>${chipLabel(team.activeChip)}</dd>
          </div>
          <div>
            <dt>Transfers</dt>
            <dd>${team.transferCount} moves | ${team.paidTransfers ? `${team.paidTransfers} paid` : "free only"}</dd>
          </div>
        </dl>
      </article>`
    )
    .join("");
}

function boostLabel(team) {
  const driver = team.bestBoost;
  return driver ? `${driver.key} x2` : "--";
}

function lineupList(rows, type) {
  return `
    <span class="lineup-list lineup-list--${type}">
      ${sortByValue(rows)
        .map(
          (row) => `
          <span class="lineup-token" title="${escapeHtml(`${row.name} | ${formatNumber(rowValue(row), 2)} value/million`)}">
            ${entityMark(row, "mini")}
            <span>${escapeHtml(row.key)}</span>
          </span>`
        )
        .join("")}
    </span>`;
}

function updatePickerSummaries() {
  els.driverPickerSummary.textContent = [...parseKeys(els.drivers.value)].join(", ") || "Choose drivers";
  els.constructorPickerSummary.textContent = [...parseKeys(els.constructors.value)].join(", ") || "Choose constructors";
}

function openPicker(type) {
  state.pickerType = type;
  const isDriver = type === "driver";
  const rows = isDriver ? state.drivers : state.constructors;
  const selected = parseKeys(isDriver ? els.drivers.value : els.constructors.value);
  const max = isDriver ? 5 : 2;
  state.pickerSelection = new Set(selected);
  els.pickerTitle.textContent = isDriver ? "Choose current drivers" : "Choose current constructors";
  els.pickerHelp.textContent = `Selected ${state.pickerSelection.size} of ${max}. Choose exactly ${max} ${isDriver ? "drivers" : "constructors"}.`;
  renderPickerOptions(rows);
  els.modal.classList.add("open");
  els.modal.setAttribute("aria-hidden", "false");
}

function renderPickerOptions(rows) {
  els.pickerList.innerHTML = rows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => pickerOption(row, state.pickerSelection.has(row.key)))
    .join("");
}

function pickerOption(row, selected) {
  const color = teamColor(row.team);
  return `
    <button class="picker-option ${selected ? "selected" : ""}" type="button" data-key="${row.key}" style="--team-color:${color}">
      ${entityMark(row, "picker")}
      <span>
        <strong>${escapeHtml(row.name)}</strong>
        <small>${escapeHtml(row.team)} | ${formatNumber(toNumber(row.price_m), 1)}M</small>
      </span>
    </button>`;
}

function closePicker() {
  els.modal.classList.remove("open");
  els.modal.setAttribute("aria-hidden", "true");
}

function applyPicker() {
  const isDriver = state.pickerType === "driver";
  const max = isDriver ? 5 : 2;
  if (state.pickerSelection.size !== max) {
    els.pickerHelp.textContent = `Please select exactly ${max}. Currently selected: ${state.pickerSelection.size}.`;
    return;
  }
  const value = [...state.pickerSelection].join(", ");
  if (isDriver) els.drivers.value = value;
  else els.constructors.value = value;
  updatePickerSummaries();
  els.status.textContent = "Selection applied. Click Optimize Team to refresh the recommendation.";
  trackEvent("apply_selection", { asset_type: isDriver ? "driver" : "constructor" });
  closePicker();
}

async function loadDriverPhotoManifest() {
  for (const basePath of ["assets/drivers", "driver"]) {
    try {
      const response = await fetch(`${basePath}/manifest.json?v=${ASSET_VERSION}`, { cache: "no-store" });
      if (!response.ok) continue;
      const manifest = await response.json();
      const photoCodes = (manifest.photos?.length ? manifest.photos : manifest.expectedFiles || []).map((key) =>
        String(key).trim().toLowerCase().replace(/\.webp$/, "")
      );
      state.driverPhotoBasePath = basePath;
      state.driverPhotos = new Set(photoCodes.filter(Boolean));
      return;
    } catch {
      state.driverPhotos = new Set();
    }
  }
}

async function loadConstructorLogoManifest() {
  for (const basePath of ["assets/constructors", "constructors", "constructor"]) {
    try {
      const response = await fetch(`${basePath}/manifest.json?v=${ASSET_VERSION}`, { cache: "no-store" });
      if (!response.ok) continue;
      const manifest = await response.json();
      const logoFiles = new Map();
      const logoPattern = /\.(webp|png|jpe?g|svg)$/;

      if (manifest.files && typeof manifest.files === "object") {
        Object.entries(manifest.files).forEach(([code, file]) => {
          const logoCode = String(code).trim().toLowerCase();
          const logoFile = String(file).trim();
          if (logoCode && logoFile) logoFiles.set(logoCode, logoFile);
        });
      } else {
        (manifest.logos?.length ? manifest.logos : manifest.expectedFiles || []).forEach((item) => {
          const logoFile = String(item).trim().toLowerCase();
          const logoCode = logoFile.replace(logoPattern, "");
          if (logoCode) logoFiles.set(logoCode, logoPattern.test(logoFile) ? logoFile : `${logoCode}.webp`);
        });
      }

      state.constructorLogoBasePath = basePath;
      state.constructorLogoFiles = logoFiles;
      state.constructorLogos = new Set(logoFiles.keys());
      return;
    } catch {
      state.constructorLogos = new Set();
      state.constructorLogoFiles = new Map();
    }
  }
}

async function loadPriceMovements() {
  try {
    const response = await fetch(PRICE_MOVEMENTS_PATH, { cache: "no-store" });
    if (!response.ok) return;
    const rows = parseCsv(await response.text());
    state.priceMovements = new Map(rows.map((row) => [priceMoveKey(row), row]));
  } catch {
    state.priceMovements = new Map();
  }
}

async function init() {
  updateStrategyNote();
  await Promise.all([loadDriverPhotoManifest(), loadConstructorLogoManifest(), loadPriceMovements()]);
  const response = await fetch(DATA_PATH);
  if (!response.ok) throw new Error(`Could not load ${DATA_PATH}`);
  state.projections = parseCsv(await response.text());
  state.drivers = state.projections.filter((row) => row.entity_type === "driver");
  state.constructors = state.projections.filter((row) => row.entity_type === "constructor");
  const sample = state.projections[0];
  els.status.textContent = `${sample?.next_gp ?? "Next GP"} ${sample?.mode ? `| ${sample.mode}` : ""} model ready. Click Optimize Team to run it.`;
  updatePickerSummaries();
  loadAvailableChips();
  syncChipAvailability();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runOptimization();
});

els.openDriverPicker.addEventListener("click", () => openPicker("driver"));
els.openConstructorPicker.addEventListener("click", () => openPicker("constructor"));
els.strategy.addEventListener("change", updateStrategyNote);
els.availableChipInputs.forEach((input) =>
  input.addEventListener("change", () => {
    saveAvailableChips();
    syncChipAvailability();
  })
);
els.closePicker.addEventListener("click", closePicker);
els.applyPicker.addEventListener("click", applyPicker);
els.acceptAnalytics.addEventListener("click", () => {
  localStorage.setItem(CONSENT_KEY, "accepted");
  els.cookieBanner.hidden = true;
  loadAnalytics();
  trackEvent("analytics_consent", { choice: "accepted" });
});
els.declineAnalytics.addEventListener("click", () => {
  localStorage.setItem(CONSENT_KEY, "declined");
  els.cookieBanner.hidden = true;
});
els.forecastLink.addEventListener("click", () => {
  trackEvent("open_full_gp_forecast");
});
els.modal.addEventListener("click", (event) => {
  if (event.target === els.modal) closePicker();
});
els.pickerList.addEventListener("click", (event) => {
  const option = event.target.closest(".picker-option");
  if (!option) return;
  const max = state.pickerType === "driver" ? 5 : 2;
  const key = option.dataset.key;
  if (state.pickerSelection.has(key)) {
    state.pickerSelection.delete(key);
  } else if (state.pickerSelection.size < max) {
    state.pickerSelection.add(key);
  }
  els.pickerHelp.textContent = `Selected ${state.pickerSelection.size} of ${max}.`;
  const rows = state.pickerType === "driver" ? state.drivers : state.constructors;
  renderPickerOptions(rows);
});

init().catch((error) => {
  els.status.textContent = error.message;
});
initConsent();
