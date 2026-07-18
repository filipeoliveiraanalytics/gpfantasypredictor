const ASSET_VERSION = "20260718-spa-after-practice-penalties";
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
  budget_growth: "Budget Growth targets assets projected into price-rise bands while keeping total points close.",
};
const TOP_TEAM_LIMIT = 5;

const SEASON_CHIP_CONTEXT = {
  sprintWeekends: [
    { name: "Chinese GP", order: 2, aliases: ["china", "chinese", "shanghai"] },
    { name: "Miami GP", order: 4, aliases: ["miami"] },
    { name: "Canadian GP", order: 5, aliases: ["canada", "canadian", "montreal"] },
    { name: "British GP", order: 9, aliases: ["british", "silverstone", "great britain"] },
    { name: "Dutch GP", order: 12, aliases: ["dutch", "zandvoort", "netherlands"] },
    { name: "Singapore GP", order: 16, aliases: ["singapore"] },
  ],
  gpOrder: [
    { order: 1, aliases: ["australia", "australian", "melbourne"] },
    { order: 2, aliases: ["china", "chinese", "shanghai"] },
    { order: 3, aliases: ["japan", "japanese", "suzuka"] },
    { order: 4, aliases: ["miami"] },
    { order: 5, aliases: ["canada", "canadian", "montreal"] },
    { order: 6, aliases: ["monaco", "monte-carlo", "monte carlo"] },
    { order: 7, aliases: ["barcelona", "catalunya", "spain", "spanish"] },
    { order: 8, aliases: ["austria", "austrian", "spielberg", "red bull ring"] },
    { order: 9, aliases: ["british", "silverstone", "great britain"] },
    { order: 10, aliases: ["belgium", "belgian", "spa"] },
    { order: 11, aliases: ["hungary", "hungarian", "hungaroring"] },
    { order: 12, aliases: ["dutch", "zandvoort", "netherlands"] },
    { order: 13, aliases: ["italy", "italian", "monza"] },
    { order: 14, aliases: ["spain", "spanish", "madrid"] },
    { order: 15, aliases: ["azerbaijan", "baku"] },
    { order: 16, aliases: ["singapore"] },
    { order: 17, aliases: ["united states", "austin", "cota"] },
    { order: 18, aliases: ["mexico", "mexican"] },
    { order: 19, aliases: ["brazil", "brazilian", "sao paulo", "interlagos"] },
    { order: 20, aliases: ["las vegas"] },
    { order: 21, aliases: ["qatar", "lusail"] },
    { order: 22, aliases: ["abu dhabi", "yas marina"] },
  ],
};

const GP_IDENTITY = [
  { aliases: ["australia", "australian", "melbourne"], location: "Melbourne, Australia", flag: "au" },
  { aliases: ["china", "chinese", "shanghai"], location: "Shanghai, China", flag: "cn" },
  { aliases: ["japan", "japanese", "suzuka"], location: "Suzuka, Japan", flag: "jp" },
  { aliases: ["miami"], location: "Miami, USA", flag: "us" },
  { aliases: ["canada", "canadian", "montreal"], location: "Montreal, Canada", flag: "ca" },
  { aliases: ["monaco", "monte-carlo", "monte carlo"], location: "Monte-Carlo, Monaco", flag: "mc" },
  { aliases: ["barcelona", "catalunya", "spain", "spanish"], location: "Barcelona, Spain", flag: "es" },
  { aliases: ["austria", "austrian", "spielberg", "red bull ring"], location: "Spielberg, Austria", flag: "at" },
  { aliases: ["british", "silverstone", "great britain"], location: "Silverstone, UK", flag: "gb" },
  { aliases: ["belgium", "belgian", "spa"], location: "Spa-Francorchamps, Belgium", flag: "be" },
  { aliases: ["hungary", "hungarian", "hungaroring"], location: "Budapest, Hungary", flag: "hu" },
  { aliases: ["dutch", "zandvoort", "netherlands"], location: "Zandvoort, Netherlands", flag: "nl" },
  { aliases: ["italy", "italian", "monza"], location: "Monza, Italy", flag: "it" },
  { aliases: ["azerbaijan", "baku"], location: "Baku, Azerbaijan", flag: "az" },
  { aliases: ["singapore"], location: "Singapore", flag: "sg" },
  { aliases: ["united states", "austin", "cota"], location: "Austin, USA", flag: "us" },
  { aliases: ["mexico", "mexican"], location: "Mexico City, Mexico", flag: "mx" },
  { aliases: ["brazil", "brazilian", "sao paulo", "interlagos"], location: "Sao Paulo, Brazil", flag: "br" },
  { aliases: ["las vegas"], location: "Las Vegas, USA", flag: "us" },
  { aliases: ["qatar", "lusail"], location: "Lusail, Qatar", flag: "qa" },
  { aliases: ["abu dhabi", "yas marina"], location: "Abu Dhabi, UAE", flag: "ae" },
];

const FLAG_MARKUP = {
  gb: `
    <svg viewBox="0 0 60 36" preserveAspectRatio="xMidYMid slice" role="img" aria-label="UK flag" focusable="false">
      <rect width="60" height="36" fill="#012169"></rect>
      <path d="M0 0 60 36M60 0 0 36" stroke="#fff" stroke-width="7.2"></path>
      <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" stroke-width="4.8"></path>
      <path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"></path>
      <path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7.2"></path>
    </svg>`,
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
  driverCombos: [],
  constructorCombos: [],
  driverComboMetaCache: new Map(),
  constructorComboMetaCache: new Map(),
  driverKeyBits: new Map(),
  constructorKeyBits: new Map(),
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
  modelUpdatePill: document.querySelector("#model-update-pill"),
  modelAdjustment: document.querySelector("#model-adjustment"),
  modelNoteCopy: document.querySelector("#model-note-copy"),
  gpIdentity: document.querySelector("#gp-identity"),
  gpFlag: document.querySelector("#gp-flag"),
  gpLocation: document.querySelector("#gp-location"),
  gpWeekendType: document.querySelector("#gp-weekend-type"),
  budget: document.querySelector("#budget"),
  budgetValidation: document.querySelector("#budget-validation"),
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
  priceProbability: document.querySelector("#price-probability"),
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
  forecastTitle: document.querySelector("#forecast-title"),
  forecastCopy: document.querySelector("#forecast-copy"),
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
  if (strategy === "budget_growth") {
    const transferBudgetDelta = Number.isFinite(team.incomingBudgetDeltaValue)
      ? team.incomingBudgetDeltaValue
      : incomingBudgetDelta(team);
    return team.netExpectedPoints + team.projectedBudgetDelta * 18 + transferBudgetDelta * 10 + (team.budgetGrowthScore ?? 0) * 2;
  }
  return team.projectedPoints;
}

function compareTeams(a, b) {
  return b.strategyScore - a.strategyScore || b.projectedPoints - a.projectedPoints;
}

function keepTopTeam(topTeams, team, limit = TOP_TEAM_LIMIT) {
  if (topTeams.length < limit) {
    topTeams.push(team);
    topTeams.sort(compareTeams);
    return;
  }

  const weakest = topTeams[topTeams.length - 1];
  if (compareTeams(team, weakest) >= 0) return;

  topTeams[topTeams.length - 1] = team;
  topTeams.sort(compareTeams);
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

function displayGpName(value) {
  return String(value || "Next GP").replaceAll("_", " ");
}

function shortGpName(value) {
  return displayGpName(value).replace(" Grand Prix", " GP");
}

function displayModeName(value) {
  const mode = String(value || "latest").trim();
  if (!mode) return "latest";
  return mode;
}

function gpIdentityFor(value) {
  const gpName = displayGpName(value);
  const normalized = gpName.toLowerCase();
  return (
    GP_IDENTITY.find((entry) => entry.aliases.some((alias) => normalized.includes(alias))) || {
      location: gpName,
      flag: "generic",
    }
  );
}

function weekendTypeLabel(gpName, modeName) {
  const sprintRead = sprintOpportunity(gpName);
  const weekendType = sprintRead.currentSprint ? "Sprint weekend" : "Standard weekend";
  return `${shortGpName(gpName)} | ${weekendType} | ${modeName}`;
}

function modeFreshnessLabel(mode, gpName = "") {
  const normalized = String(mode || "").toLowerCase();
  if (normalized.includes("practice")) {
    return sprintOpportunity(gpName).currentSprint ? "FP1 + Sprint Qualifying + Sprint included" : "Free-practice data included";
  }
  if (normalized.includes("quali")) return "Qualifying data included";
  if (normalized.includes("pre")) return "Latest race results included";
  return "Latest model data included";
}

function updateModelCopy(sample) {
  const gpName = displayGpName(sample?.next_gp);
  const modeName = displayModeName(sample?.mode);
  const freshness = modeFreshnessLabel(modeName, gpName);
  const identity = gpIdentityFor(gpName);

  if (els.gpIdentity) {
    els.gpIdentity.hidden = false;
    els.gpIdentity.setAttribute("aria-label", `${identity.location}, ${weekendTypeLabel(gpName, modeName)}`);
  }

  if (els.gpFlag) {
    const flagMarkup = FLAG_MARKUP[identity.flag] || "";
    els.gpFlag.className = `gp-flag gp-flag--${identity.flag}${flagMarkup ? " gp-flag--inline" : ""}`;
    els.gpFlag.innerHTML = flagMarkup;
  }

  if (els.gpLocation) {
    els.gpLocation.textContent = identity.location;
  }

  if (els.gpWeekendType) {
    els.gpWeekendType.textContent = weekendTypeLabel(gpName, modeName);
  }

  if (els.modelUpdatePill) {
    els.modelUpdatePill.textContent = freshness;
  }

  if (els.modelAdjustment) {
    const hasSpaPenalties = gpName.toLowerCase().includes("belgium");
    els.modelAdjustment.hidden = !hasSpaPenalties;
    els.modelAdjustment.textContent = hasSpaPenalties
      ? "Grid penalties for Norris, Hadjar, Stroll and Alonso are included in this model."
      : "";
  }

  if (els.modelNoteCopy) {
    els.modelNoteCopy.textContent =
      `The optimizer combines the ${gpName} ${modeName} GP model, updated F1 Fantasy prices, rolling price-momentum estimates, transfer penalties and the mandatory 2x driver boost. It is built for lineup decisions before team lock, with deeper race context available in the full GP Predictor.`;
  }

  if (els.forecastTitle) {
    els.forecastTitle.textContent = `Open the ${shortGpName(gpName)} race forecast.`;
  }

  if (els.forecastCopy) {
    els.forecastCopy.textContent =
      "See the grid prediction, podium odds, fastest-lap pick, weather, safety-car risk and track-fit ratings behind this optimizer.";
  }
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

function cacheProjectionNumbers(row) {
  row._cost = toNumber(row.price_m);
  row._points = toNumber(row.expected_fantasy_points);
  row._risk = toNumber(row.risk_score);
  row._projectedPriceDelta = projectedPriceChange(row);
  row._priceDelta = budgetGrowthDelta(row);
  row._growthScore = priceGrowthScore(row);
  row._riseProbability = priceGrowthProfile(row).riseProbability;
  row._fallProbability = priceGrowthProfile(row).fallProbability;
  row._dnfProtection = Math.abs(Math.min(0, toNumber(row.dnf_penalty_points_est)));
}

function comboFromRows(rows, type) {
  const keys = rows.map((row) => row.key);
  const cost = rows.reduce((sum, row) => sum + row._cost, 0);
  const expectedPoints = rows.reduce((sum, row) => sum + row._points, 0);
  const budgetDelta = rows.reduce((sum, row) => sum + row._priceDelta, 0);
  const growthScore = rows.reduce((sum, row) => sum + row._growthScore, 0);
  const riseProbability = rows.reduce((sum, row) => sum + row._riseProbability, 0) / Math.max(rows.length, 1);
  const fallProbability = rows.reduce((sum, row) => sum + row._fallProbability, 0) / Math.max(rows.length, 1);
  const noNegativeProtection = rows.reduce((sum, row) => sum + row._dnfProtection, 0);
  const riskSum = rows.reduce((sum, row) => sum + row._risk, 0);
  const mask = rows.reduce((bits, row) => bits | row._bit, 0);
  const nonGrowthMask = rows.reduce((bits, row) => (hasBudgetRisePath(row) ? bits : bits | row._bit), 0);
  const bestBoost =
    type === "driver"
      ? [...rows].sort((a, b) => b._points - a._points)[0]
      : null;

  return {
    rows,
    keys,
    keyText: keys.join("|"),
    size: rows.length,
    mask,
    nonGrowthMask,
    cost,
    expectedPoints,
    budgetDelta,
    growthScore,
    riseProbability,
    fallProbability,
    noNegativeProtection,
    riskSum,
    bestBoost,
  };
}

function buildComboCaches() {
  state.projections.forEach(cacheProjectionNumbers);
  state.driverKeyBits = new Map();
  state.constructorKeyBits = new Map();
  state.drivers.forEach((row, index) => {
    row._bit = 1 << index;
    state.driverKeyBits.set(row.key, row._bit);
  });
  state.constructors.forEach((row, index) => {
    row._bit = 1 << index;
    state.constructorKeyBits.set(row.key, row._bit);
  });
  state.driverCombos = combinations(state.drivers, 5).map((rows) => comboFromRows(rows, "driver"));
  state.constructorCombos = combinations(state.constructors, 2).map((rows) => comboFromRows(rows, "constructor"));
  state.driverComboMetaCache = new Map();
  state.constructorComboMetaCache = new Map();
}

function popCount(value) {
  let bits = value >>> 0;
  let count = 0;
  while (bits) {
    bits &= bits - 1;
    count += 1;
  }
  return count;
}

function maskFromKeys(keys, keyBits) {
  let mask = 0;
  keys.forEach((key) => {
    mask |= keyBits.get(key) || 0;
  });
  return mask;
}

function comboIncomingBudgetDelta(combo, currentMask) {
  let total = 0;
  for (const row of combo.rows) {
    if ((row._bit & currentMask) === 0) total += row._priceDelta;
  }
  return total;
}

function strongPriceRiseAsset(row) {
  const profile = priceGrowthProfile(row);
  return profile.expectedDelta >= 0.25 || profile.riseProbability >= 0.65 || projectedPriceChange(row) >= priceStep(row) - 0.05;
}

function highPriceFallRiskAsset(row) {
  if (isAtPriceFloor(row)) return false;
  const profile = priceGrowthProfile(row);
  return profile.expectedDelta <= -0.25 || profile.fallProbability >= 0.55 || projectedPriceChange(row) <= -priceStep(row) + 0.05;
}

function protectedPriceTradeoff(combo, currentMask, sourceRows) {
  const inRows = combo.rows.filter((row) => (row._bit & currentMask) === 0);
  const outRows = sourceRows.filter((row) => (row._bit & currentMask) !== 0 && (row._bit & combo.mask) === 0);
  if (!inRows.length || !outRows.length) return null;

  const protectedOut = outRows.filter(strongPriceRiseAsset);
  const riskyIn = inRows.filter(highPriceFallRiskAsset);
  if (!protectedOut.length || !riskyIn.length) return null;
  const weakRiskSwitch = riskyIn.some((inRow) =>
    protectedOut.some((outRow) => {
      const pointGain = inRow._points - outRow._points;
      const budgetSwing = Math.max(0, outRow._priceDelta) + Math.abs(Math.min(0, inRow._priceDelta));
      return budgetSwing >= 0.6 && pointGain < 4.0;
    })
  );

  return {
    pointGain: inRows.reduce((sum, row) => sum + row._points, 0) - outRows.reduce((sum, row) => sum + row._points, 0),
    budgetSwing:
      protectedOut.reduce((sum, row) => sum + Math.max(0, row._priceDelta), 0) +
      riskyIn.reduce((sum, row) => sum + Math.abs(Math.min(0, row._priceDelta)), 0),
    weakRiskSwitch,
  };
}

function blocksProtectedPriceTradeoff(tradeoff, inputs) {
  if (!tradeoff || inputs.activeChip === "limitless") return false;
  if (tradeoff.weakRiskSwitch) return true;
  const minimumPointGain = inputs.strategy === "budget_growth" ? 8 : 5;
  const swingPenalty = tradeoff.budgetSwing >= 0.8 ? 1 : 0;
  return tradeoff.pointGain < minimumPointGain + swingPenalty;
}

function comboProjectedPoints(driverCombo, constructorCombo, activeChip) {
  const expectedPoints = driverCombo.expectedPoints + constructorCombo.expectedPoints;
  const boostBase = driverCombo.bestBoost?._points ?? 0;
  const chipExtraPoints = activeChip === "x3" ? boostBase : 0;
  const noNegativeProtection =
    activeChip === "no_negative" ? driverCombo.noNegativeProtection + constructorCombo.noNegativeProtection : 0;
  return expectedPoints + boostBase + chipExtraPoints + noNegativeProtection;
}

function minimumFreeTransferGain(transferCount, budgetDeltaChange, inputs) {
  let minimum = transferCount === 1 ? 1.2 : 1.8 + Math.max(0, transferCount - 2) * 0.4;

  if (budgetDeltaChange < -0.25) minimum += 0.8;
  if (budgetDeltaChange > 0.25) minimum -= 0.5;
  if (inputs.strategy === "budget_growth") minimum -= 0.4;

  return Math.max(0.8, minimum);
}

function blocksLowValueFreeTransfer(candidate, currentBaseline, inputs) {
  if (!currentBaseline || candidate.transferCount <= 0 || candidate.paidTransfers > 0) return false;
  if (hasUnlimitedTransfers(inputs.activeChip)) return false;

  const pointGain = candidate.projectedPoints - currentBaseline.projectedPoints;
  const budgetDeltaChange = candidate.projectedBudgetDelta - currentBaseline.projectedBudgetDelta;
  const minimumGain = minimumFreeTransferGain(candidate.transferCount, budgetDeltaChange, inputs);

  return pointGain < minimumGain;
}

function comboRunMeta(combo, currentMask, sourceRows) {
  const keptCount = popCount(combo.mask & currentMask);
  return {
    combo,
    transferCount: combo.size - keptCount,
    incomingBudgetDeltaValue: comboIncomingBudgetDelta(combo, currentMask),
    growthEligible: (combo.nonGrowthMask & currentMask) === combo.nonGrowthMask,
    protectedPriceTradeoff: protectedPriceTradeoff(combo, currentMask, sourceRows),
  };
}

function cachedComboRunMeta(combo, type, currentMask, sourceRows) {
  const cache = type === "driver" ? state.driverComboMetaCache : state.constructorComboMetaCache;
  const cacheKey = `${currentMask}:${combo.mask}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const meta = comboRunMeta(combo, currentMask, sourceRows);
  cache.set(cacheKey, meta);
  return meta;
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
  const budgetGrowthScore = teamBudgetGrowthScore(entities);
  const avgRiseProbability = averagePriceProbability(entities, "riseProbability");
  const avgFallProbability = averagePriceProbability(entities, "fallProbability");

  return {
    drivers: driverCombo,
    constructors: constructorCombo,
    driverKeys,
    constructorKeys,
    currentDriverKeys: [...inputs.currentDrivers],
    currentConstructorKeys: [...inputs.currentConstructors],
    totalCost,
    budgetRemaining: inputs.budget - totalCost,
    activeChip: inputs.activeChip,
    expectedPoints,
    projectedPoints,
    netExpectedPoints,
    projectedBudgetDelta,
    budgetGrowthScore,
    avgRiseProbability,
    avgFallProbability,
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

function currentSelectionCost(inputs) {
  if (inputs.currentDrivers.size !== 5 || inputs.currentConstructors.size !== 2) return null;

  const selectedDrivers = state.drivers.filter((row) => inputs.currentDrivers.has(row.key));
  const selectedConstructors = state.constructors.filter((row) => inputs.currentConstructors.has(row.key));
  if (selectedDrivers.length !== 5 || selectedConstructors.length !== 2) return null;

  return [...selectedDrivers, ...selectedConstructors].reduce((sum, row) => sum + toNumber(row.price_m), 0);
}

function updateBudgetValidation() {
  const inputs = currentInputs();
  const currentCost = currentSelectionCost(inputs);
  if (!els.budgetValidation || currentCost === null || inputs.budget <= 0) {
    els.budgetValidation.hidden = true;
    return null;
  }

  const shortfall = currentCost - inputs.budget;
  if (shortfall > 0.01) {
    els.budgetValidation.hidden = false;
    els.budgetValidation.textContent = `Current selection costs ${formatNumber(currentCost, 1)}M, which is ${formatNumber(shortfall, 1)}M above this budget. Enter your full current squad value, not only unused cash.`;
    return currentCost;
  }

  els.budgetValidation.hidden = true;
  return currentCost;
}

function comboSummary(rows, type, inputs) {
  const currentKeys = type === "driver" ? inputs.currentDrivers : inputs.currentConstructors;
  const keys = rows.map((row) => row.key);
  const newKeys = new Set(keys);
  const inKeys = keys.filter((key) => !currentKeys.has(key));
  const outKeys = [...currentKeys].filter((key) => !newKeys.has(key));
  const incomingRows = rows.filter((row) => inKeys.includes(row.key));

  return {
    rows,
    keys,
    cost: rows.reduce((sum, row) => sum + toNumber(row.price_m), 0),
    expectedPoints: rows.reduce((sum, row) => sum + toNumber(row.expected_fantasy_points), 0),
    budgetDelta: teamBudgetDelta(rows),
    growthScore: teamBudgetGrowthScore(rows),
    noNegativeProtection: rows.reduce((sum, row) => sum + Math.abs(Math.min(0, toNumber(row.dnf_penalty_points_est))), 0),
    bestBoost:
      type === "driver"
        ? [...rows].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points))[0]
        : null,
    inKeys,
    outKeys,
    incomingBudgetDelta: teamBudgetDelta(incomingRows),
    hasOnlyGrowthTransfers: incomingRows.length === 0 || incomingRows.every(hasBudgetRisePath),
  };
}

function entityPoolScore(row, inputs) {
  const points = toNumber(row.expected_fantasy_points);
  const price = toNumber(row.price_m);
  const value = price ? points / price : 0;
  const priceDelta = budgetGrowthDelta(row);
  const growthScore = priceGrowthScore(row);
  const growthWeight = inputs.strategy === "budget_growth" ? 12 : 4;
  return points + value * 3 + priceDelta * 12 + growthScore * growthWeight;
}

function pickDriverPool(inputs) {
  const currentKeys = inputs.currentDrivers;
  const byKey = new Map(state.drivers.map((row) => [row.key, row]));
  const selected = new Map();
  const poolLimit = inputs.strategy === "budget_growth" ? 16 : 15;

  currentKeys.forEach((key) => {
    const row = byKey.get(key);
    if (row) selected.set(key, row);
  });

  const cheapest = [...state.drivers].sort((a, b) => toNumber(a.price_m) - toNumber(b.price_m));
  const ranked = [...state.drivers].sort((a, b) => entityPoolScore(b, inputs) - entityPoolScore(a, inputs));

  // Keep realistic funding paths before filling the remaining places with the
  // best model targets. This caps the expensive 5-driver search without
  // removing a user's current lineup or low-cost enablers.
  cheapest.slice(0, 6).forEach((row) => {
    if (selected.size < poolLimit) selected.set(row.key, row);
  });

  ranked.forEach((row) => {
    if (selected.size < poolLimit) selected.set(row.key, row);
    else if (inputs.strategy === "budget_growth" && hasBudgetRisePath(row)) {
      const replaceable = [...selected.values()]
        .filter((candidate) => !currentKeys.has(candidate.key) && !hasBudgetRisePath(candidate))
        .sort((a, b) => entityPoolScore(a, inputs) - entityPoolScore(b, inputs))[0];
      if (replaceable && entityPoolScore(row, inputs) > entityPoolScore(replaceable, inputs)) {
        selected.delete(replaceable.key);
        selected.set(row.key, row);
      }
    }
  });

  return [...selected.values()];
}

function currentNearbyDriverCombos(inputs) {
  if (inputs.currentDrivers.size !== 5) return [];

  const byKey = new Map(state.drivers.map((row) => [row.key, row]));
  const currentRows = [...inputs.currentDrivers].map((key) => byKey.get(key)).filter(Boolean);
  if (currentRows.length !== 5) return [];

  const currentKeys = new Set(currentRows.map((row) => row.key));
  const alternatives = state.drivers.filter((row) => !currentKeys.has(row.key));
  const maxDriverChanges = Math.min(3, Math.max(1, inputs.freeTransfers));
  const combos = [];

  for (let changes = 0; changes <= maxDriverChanges; changes += 1) {
    for (const keepRows of combinations(currentRows, 5 - changes)) {
      for (const addRows of combinations(alternatives, changes)) {
        combos.push([...keepRows, ...addRows]);
      }
    }
  }

  return combos;
}

function comboPoolScore(combo, inputs) {
  const transferCost = combo.inKeys.length * (inputs.strategy === "current_friendly" ? 14 : 6);
  const growthBonus = combo.budgetDelta * (inputs.strategy === "budget_growth" ? 35 : 12);
  const growthQualityBonus = (combo.growthScore ?? 0) * (inputs.strategy === "budget_growth" ? 10 : 3);
  const valueBonus = combo.cost ? (combo.expectedPoints / combo.cost) * 4 : 0;
  return combo.expectedPoints + growthBonus + growthQualityBonus + valueBonus - transferCost;
}

function trimComboPool(combos, inputs, limit) {
  const protectedCombos = combos.filter((combo) => combo.isProtected || combo.inKeys.length === 0);
  const ranked = [...combos].sort((a, b) => comboPoolScore(b, inputs) - comboPoolScore(a, inputs));
  const seen = new Set();
  const output = [];

  [...protectedCombos, ...ranked].forEach((combo) => {
    const id = combo.keys.join("|");
    if (seen.has(id) || output.length >= limit) return;
    seen.add(id);
    output.push(combo);
  });

  return output;
}

function findTopTeams(inputs) {
  const topCandidates = [];
  let budgetGrowthBaseline = null;
  const budgetLimit = ignoresBudget(inputs.activeChip) ? Number.POSITIVE_INFINITY : inputs.budget;
  const currentDriverMask = maskFromKeys(inputs.currentDrivers, state.driverKeyBits);
  const currentConstructorMask = maskFromKeys(inputs.currentConstructors, state.constructorKeyBits);
  const budgetGrowth = inputs.strategy === "budget_growth";
  const transferFriendly = inputs.strategy === "current_friendly" && !hasUnlimitedTransfers(inputs.activeChip);
  const driverPoolMask = pickDriverPool(inputs).reduce((mask, row) => mask | row._bit, 0);
  const currentDriverCombo = state.driverCombos.find((combo) => combo.mask === currentDriverMask);
  const currentConstructorCombo = state.constructorCombos.find((combo) => combo.mask === currentConstructorMask);
  const currentBaseline =
    currentDriverCombo && currentConstructorCombo && currentDriverCombo.cost + currentConstructorCombo.cost <= budgetLimit
      ? {
          projectedPoints: comboProjectedPoints(currentDriverCombo, currentConstructorCombo, inputs.activeChip),
          projectedBudgetDelta: currentDriverCombo.budgetDelta + currentConstructorCombo.budgetDelta,
          budgetGrowthScore: currentDriverCombo.growthScore + currentConstructorCombo.growthScore,
        }
      : null;
  let budgetGrowthPointFloor = Number.NEGATIVE_INFINITY;
  let currentBudgetGrowthDelta = Number.NEGATIVE_INFINITY;
  let currentBudgetGrowthScore = Number.NEGATIVE_INFINITY;

  if (budgetGrowth && currentBaseline) {
    budgetGrowthPointFloor = currentBaseline.projectedPoints - 10;
    currentBudgetGrowthDelta = currentBaseline.projectedBudgetDelta;
    currentBudgetGrowthScore = currentBaseline.budgetGrowthScore;
  }

  const driverCandidates = state.driverCombos
    .filter((combo) => (combo.mask & driverPoolMask) === combo.mask)
    .map((combo) => cachedComboRunMeta(combo, "driver", currentDriverMask, state.drivers))
    .filter(
      (meta) =>
        meta.combo.cost <= budgetLimit &&
        (!transferFriendly || meta.transferCount <= inputs.freeTransfers) &&
        !blocksProtectedPriceTradeoff(meta.protectedPriceTradeoff, inputs)
    );
  const constructorCandidates = state.constructorCombos
    .map((combo) => cachedComboRunMeta(combo, "constructor", currentConstructorMask, state.constructors))
    .filter((meta) => !blocksProtectedPriceTradeoff(meta.protectedPriceTradeoff, inputs));

  for (const driverMeta of driverCandidates) {
    const driverCombo = driverMeta.combo;
    if (driverCombo.cost > budgetLimit) continue;
    for (const constructorMeta of constructorCandidates) {
      const constructorCombo = constructorMeta.combo;
      const totalCost = driverCombo.cost + constructorCombo.cost;
      if (totalCost > budgetLimit) continue;

      const transferCount = driverMeta.transferCount + constructorMeta.transferCount;
      if (transferFriendly && transferCount > inputs.freeTransfers) continue;
      const projectedPoints = comboProjectedPoints(driverCombo, constructorCombo, inputs.activeChip);
      if (budgetGrowth && projectedPoints < budgetGrowthPointFloor) continue;

      const paidTransfers = hasUnlimitedTransfers(inputs.activeChip) ? 0 : Math.max(0, transferCount - inputs.freeTransfers);
      const transferPenalty = paidTransfers * -10;
      const projectedBudgetDelta = driverCombo.budgetDelta + constructorCombo.budgetDelta;
      const budgetGrowthScore = driverCombo.growthScore + constructorCombo.growthScore;
      const incomingBudgetDeltaValue = driverMeta.incomingBudgetDeltaValue + constructorMeta.incomingBudgetDeltaValue;
      const isBudgetGrowthBaseline = budgetGrowth && transferCount === 0;
      if (
        budgetGrowth &&
        transferCount > 0 &&
        projectedBudgetDelta <= currentBudgetGrowthDelta + 0.05 &&
        budgetGrowthScore <= currentBudgetGrowthScore + 0.15
      ) {
        continue;
      }

      const candidate = {
        driverCombo,
        constructorCombo,
        transferCount,
        paidTransfers,
        projectedPoints,
        netExpectedPoints: projectedPoints + transferPenalty,
        projectedBudgetDelta,
        budgetGrowthScore,
        incomingBudgetDeltaValue,
        strategyScore: strategyScore(
          {
            projectedPoints,
            netExpectedPoints: projectedPoints + transferPenalty,
            projectedBudgetDelta,
            budgetGrowthScore,
            incomingBudgetDeltaValue,
          },
          inputs.strategy
        ),
      };

      if (blocksLowValueFreeTransfer(candidate, currentBaseline, inputs)) continue;

      if (isBudgetGrowthBaseline) {
        budgetGrowthBaseline = candidate;
        continue;
      }

      const weakest = topCandidates[topCandidates.length - 1];
      if (topCandidates.length === TOP_TEAM_LIMIT && compareTeams(candidate, weakest) >= 0) continue;

      keepTopTeam(topCandidates, candidate);
    }
  }

  if (budgetGrowth && topCandidates.length === 0 && budgetGrowthBaseline) {
    topCandidates.push(budgetGrowthBaseline);
  }

  return topCandidates.map((candidate) => {
    const team = summarizeTeam(candidate.driverCombo.rows, candidate.constructorCombo.rows, inputs);
    team.incomingBudgetDeltaValue = candidate.incomingBudgetDeltaValue;
    team.budgetGrowthScore = candidate.budgetGrowthScore;
    team.strategyScore = candidate.strategyScore;
    return team;
  });
}

function topDriverGap(team) {
  if (!team?.drivers?.length) return 0;
  const sorted = [...team.drivers].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points));
  return toNumber(sorted[0]?.expected_fantasy_points) - toNumber(sorted[1]?.expected_fantasy_points);
}

function matchesAlias(value, aliases) {
  const normalized = String(value ?? "").toLowerCase();
  return aliases.some((alias) => normalized.includes(alias));
}

function gpOrderIndex(gp) {
  const match = SEASON_CHIP_CONTEXT.gpOrder.find((entry) => matchesAlias(gp, entry.aliases));
  if (match) return match.order;

  const sprintMatch = SEASON_CHIP_CONTEXT.sprintWeekends.find((entry) => matchesAlias(gp, entry.aliases));
  return sprintMatch?.order ?? 0;
}

function sprintOpportunity(gp) {
  const order = gpOrderIndex(gp);
  const currentSprint = SEASON_CHIP_CONTEXT.sprintWeekends.find((entry) => matchesAlias(gp, entry.aliases));
  const remaining = SEASON_CHIP_CONTEXT.sprintWeekends.filter((entry) => {
    if (currentSprint && entry.order === currentSprint.order) return false;
    return order ? entry.order > order : !matchesAlias(gp, entry.aliases);
  });

  return {
    currentSprint,
    remaining,
    remainingLabel: remaining.map((entry) => entry.name).join(", "),
  };
}

function trackProfile(team) {
  const gp = team?.drivers?.[0]?.next_gp ?? "";
  const normalizedGp = gp.toLowerCase();
  const sprintRead = sprintOpportunity(gp);
  return {
    gp: normalizedGp,
    gpName: gp,
    isMonaco: normalizedGp.includes("monaco"),
    isStreet: ["monaco", "singapore", "baku", "jeddah", "las vegas"].some((name) => normalizedGp.includes(name)),
    isSprint: Boolean(sprintRead.currentSprint) || normalizedGp.includes("sprint"),
    remainingSprints: sprintRead.remaining,
    remainingSprintLabel: sprintRead.remainingLabel,
  };
}

function x3Predictability(team) {
  const profile = trackProfile(team);
  const driver = team?.bestBoost;
  if (!driver) return { score: 0, confidence: "Hold", reason: "No clear boost driver found." };

  const qualifying = toNumber(driver.qualifying_points_est);
  const finish = toNumber(driver.race_finish_points_est);
  const positionChange = Math.abs(toNumber(driver.position_change_points_est));
  const dnfRisk = Math.abs(Math.min(0, toNumber(driver.dnf_penalty_points_est)));
  const driverPoints = toNumber(driver.expected_fantasy_points);
  const lineupShare = team.expectedPoints ? driverPoints / team.expectedPoints : 0;

  let score = 0;
  const reasons = [];

  if (profile.isMonaco) {
    score += 7;
    reasons.push("Monaco turns qualifying and track position into unusually predictable race points");
  } else if (profile.isStreet) {
    score += 4;
    reasons.push("street-track position makes the top-driver outcome more stable");
  }

  if (qualifying >= 8) {
    score += 4;
    reasons.push(`${driver.key} has strong qualifying projection`);
  } else if (qualifying >= 5) {
    score += 2;
    reasons.push(`${driver.key} has usable qualifying projection`);
  }

  if (finish >= 18) {
    score += 4;
    reasons.push("race-finish projection is high");
  } else if (finish >= 12) {
    score += 2;
    reasons.push("race-finish projection is solid");
  }

  if (positionChange <= 1.5) score += 2;
  if (dnfRisk <= 1.5) score += 2;
  if (lineupShare >= 0.17) score += 2;
  if (profile.isSprint) {
    score += 4;
    reasons.push("sprint scoring adds extra upside for the boosted driver");
  } else if (profile.remainingSprints.length) {
    const opportunityPenalty = Math.min(5, 2 + profile.remainingSprints.length);
    score -= opportunityPenalty;
    reasons.push(`${profile.remainingSprintLabel} still offer higher-ceiling sprint spots`);
  }

  const confidence = score >= 13 ? "Strong" : score >= 9 ? "Medium" : "Hold";
  return {
    score,
    confidence,
    reason: reasons.length ? reasons.join("; ") : `${driver.key} is the best boost driver, but the top-driver outcome is not especially predictable.`,
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

function chipGain(base, team) {
  if (!base || !team) return 0;
  return team.netExpectedPoints - base.netExpectedPoints;
}

function chipGainLabel(gain) {
  return `${gain >= 0 ? "+" : ""}${formatNumber(gain, 1)} pts`;
}

function recommendChip(base, availableChips, chipPreviews = {}) {
  if (!base || availableChips.size === 0) {
    return { chip: "none", confidence: "Hold", reason: "No available chip creates a strong enough edge this week." };
  }

  const profile = trackProfile(base);
  const futureSprintText = profile.remainingSprintLabel ? ` (${profile.remainingSprintLabel})` : "";
  const result = {
    chip: "none",
    confidence: "Hold",
    reason:
      !profile.isSprint && profile.remainingSprints.length && (availableChips.has("x3") || availableChips.has("limitless"))
        ? `Save premium chips for remaining sprint weekends${futureSprintText} unless this GP has an exceptional edge.`
        : "No available chip creates a strong enough edge this week.",
  };
  const transferPressure = base.paidTransfers > 0 || base.transferCount >= 4;
  const boostGap = topDriverGap(base);
  const x3Read = x3Predictability(base);
  const x3SpendThreshold = profile.isSprint ? 9 : profile.remainingSprints.length ? 13 : 10;
  const x3Gain = chipGain(base, chipPreviews.x3) || toNumber(base.bestBoost?.expected_fantasy_points);
  const limitlessGain = chipGain(base, chipPreviews.limitless);
  const limitlessSpendThreshold = profile.isSprint ? 35 : profile.remainingSprints.length ? 45 : 30;
  const x3DominatedByLimitless =
    availableChips.has("limitless") && limitlessGain >= x3Gain + (profile.isSprint ? 8 : 12);
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

  const nonSprintLimitlessSpot = profile.isMonaco && base.budgetRemaining < 0.7 && transferPressure && profile.remainingSprints.length === 0;
  if (availableChips.has("limitless") && (profile.isSprint || nonSprintLimitlessSpot || limitlessGain >= limitlessSpendThreshold)) {
    const x3Comparison =
      availableChips.has("x3") && x3Gain > 0
        ? ` It also beats ${chipLabel("x3")}'s estimated ${chipGainLabel(x3Gain)} gain.`
        : "";
    candidates.push({
      chip: "limitless",
      score: limitlessGain + (profile.isSprint ? 4 : 0),
      confidence: limitlessGain >= limitlessSpendThreshold + 15 ? "Strong" : "Medium",
      reason: profile.isSprint
        ? `${chipLabel("limitless")} fits because sprint scoring gives the one-week attack more total points to chase; projected gain is about ${chipGainLabel(limitlessGain)} versus no chip.${x3Comparison}`
        : `${chipLabel("limitless")} can work as a one-week attack here; projected gain is about ${chipGainLabel(limitlessGain)} versus no chip.${x3Comparison}`,
    });
  }

  if (availableChips.has("wildcard") && transferPressure) {
    candidates.push({
      chip: "wildcard",
      score: base.paidTransfers > 0 ? 11 + base.paidTransfers : 7 + base.transferCount,
      confidence: base.transferCount >= 5 ? "Strong" : "Medium",
      reason: `${chipLabel("wildcard")} fits because the optimizer wants ${base.transferCount} moves and the normal free-transfer limit is holding the rebuild back. The chip makes those penalty-free Wildcard moves; it does not mean you have ${base.transferCount} ordinary free transfers.`,
    });
  }

  if (availableChips.has("x3") && x3Read.score >= x3SpendThreshold && x3Gain >= 18 && !x3DominatedByLimitless) {
    candidates.push({
      chip: "x3",
      score: x3Gain + x3Read.score * 0.3,
      confidence: x3Read.confidence,
      reason: `${chipLabel("x3")} adds about ${chipGainLabel(x3Gain)} because ${base.bestBoost?.key ?? "the top driver"} has a predictable high-upside path: ${x3Read.reason}.`,
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
  if (baseInputs.budget <= 0 || baseInputs.currentDrivers.size !== 5 || baseInputs.currentConstructors.size !== 2) {
    els.status.textContent = "Enter your budget and choose exactly 5 drivers + 2 constructors first.";
    els.whyLineup.hidden = true;
    els.whyLineup.innerHTML = "";
    els.alternatives.innerHTML = "";
    els.alternativeCards.innerHTML = "";
    return;
  }

  const currentCost = updateBudgetValidation();
  if (currentCost !== null && currentCost > baseInputs.budget + 0.01) {
    els.status.textContent = `Your current selection costs ${formatNumber(currentCost, 1)}M. Increase the total squad budget before optimizing.`;
    els.whyLineup.hidden = true;
    els.whyLineup.innerHTML = "";
    els.alternatives.innerHTML = "";
    els.alternativeCards.innerHTML = "";
    return;
  }

  const availableChips = getAvailableChips();
  const baseTeams = findTopTeams(baseInputs);
  const teamsByChip = new Map([["none", baseTeams]]);
  const teamsForChip = (chip) => {
    if (!teamsByChip.has(chip)) {
      teamsByChip.set(chip, findTopTeams({ ...baseInputs, activeChip: chip }));
    }
    return teamsByChip.get(chip);
  };
  const chipPreviews = {
    x3: availableChips.has("x3") ? teamsForChip("x3")[0] : null,
    limitless: availableChips.has("limitless") ? teamsForChip("limitless")[0] : null,
  };
  const chipRecommendation = recommendChip(baseTeams[0], availableChips, chipPreviews);
  const topTeams = teamsForChip(chipRecommendation.chip).slice(0, TOP_TEAM_LIMIT);

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

  setTimeout(() => {
    try {
      optimize();
    } finally {
      document.body.classList.remove("is-optimizing");
      els.optimizeButton.disabled = false;
      els.optimizeButton.textContent = "Optimize Team";
    }
  }, 0);
}

function chip(row) {
  const color = teamColor(row.team);
  const price = `${formatNumber(toNumber(row.price_m), 1)}M`;
  const points = `${formatNumber(toNumber(row.expected_fantasy_points), 1)} pts`;
  const priceSignal = priceMomentum(row);
  const probabilityLabel = priceProbabilityLabel(row);
  const probabilityTitle = priceProbabilityTitle(row, priceSignal);
  return `
    <span class="chip ${row.entity_type === "driver" ? "chip--driver" : "chip--constructor"}" style="--team-color:${color}">
      ${entityMark(row, "chip")}
      <span class="chip-copy">
        <strong>${escapeHtml(row.name)}</strong>
        <span>${escapeHtml(row.team)} | ${price} | ${points}</span>
      </span>
      <span class="price-signal price-signal--${priceSignal.tone}" title="${escapeHtml(probabilityTitle)}">
        <b>${escapeHtml(priceSignal.label)}</b>
        <small>${escapeHtml(probabilityLabel)}</small>
      </span>
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function priceConfidenceWeight(row) {
  const confidence = String(row.price_model_confidence ?? "").toLowerCase();
  if (confidence.includes("high")) return 1.0;
  if (confidence.includes("medium")) return 0.85;
  if (confidence.includes("low")) return 0.62;
  return hasModeledPriceChange(row) ? 0.75 : 0.55;
}

function isPriceFloorCapped(row) {
  return String(row.price_floor_capped ?? "").toUpperCase() === "TRUE";
}

function isAtPriceFloor(row) {
  return isPriceFloorCapped(row) && toNumber(row.projected_price_delta_m) >= 0;
}

function priceGrowthProfile(row) {
  if (row._priceGrowthProfile) return row._priceGrowthProfile;
  const rawDelta = projectedPriceChange(row);
  const step = Math.max(Math.abs(rawDelta), priceStep(row), 0.1);
  const expected = toNumber(row.expected_fantasy_points);
  const good = toNumber(row.price_points_needed_good, Number.NaN);
  const great = toNumber(row.price_points_needed_great, Number.NaN);
  const confidenceWeight = priceConfidenceWeight(row);
  const modelType = String(row.price_model_type ?? "");
  const providedExpectedDelta = toNumber(row.risk_adjusted_price_delta_m, Number.NaN);
  const providedGrowthScore = toNumber(row.price_growth_score, Number.NaN);
  const providedRiseProbability = toNumber(row.price_rise_path_score, Number.NaN);
  const providedFallProbability = toNumber(row.price_fall_risk_score, Number.NaN);
  const providedMarginToGood = toNumber(row.price_margin_to_good, Number.NaN);
  const providedMarginToGreat = toNumber(row.price_margin_to_great, Number.NaN);
  const floorCapped = isPriceFloorCapped(row);
  const atPriceFloor = isAtPriceFloor(row);

  if (
    Number.isFinite(providedExpectedDelta) ||
    Number.isFinite(providedGrowthScore) ||
    Number.isFinite(providedRiseProbability) ||
    Number.isFinite(providedFallProbability)
  ) {
    const riseProbability = Number.isFinite(providedRiseProbability)
      ? providedRiseProbability
      : rawDelta > 0
        ? confidenceWeight
        : 0.1 * confidenceWeight;
    const fallProbability = Number.isFinite(providedFallProbability)
      ? providedFallProbability
      : atPriceFloor
        ? 0
      : rawDelta < 0
        ? confidenceWeight
        : 0.1 * confidenceWeight;

    row._priceGrowthProfile = {
      rawDelta,
      expectedDelta: Number.isFinite(providedExpectedDelta) ? providedExpectedDelta : rawDelta * confidenceWeight,
      growthScore: Number.isFinite(providedGrowthScore)
        ? providedGrowthScore
        : (Number.isFinite(providedExpectedDelta) ? providedExpectedDelta : rawDelta * confidenceWeight) * 2.4 +
          riseProbability * 0.65 -
          fallProbability * 0.55,
      riseProbability: clamp(riseProbability, 0, 0.95),
      fallProbability: clamp(fallProbability, 0, 0.95),
      marginToGood: Number.isFinite(providedMarginToGood)
        ? providedMarginToGood
        : Number.isFinite(good)
          ? expected - good
          : Number.NaN,
      marginToGreat: Number.isFinite(providedMarginToGreat)
        ? providedMarginToGreat
        : Number.isFinite(great)
          ? expected - great
          : Number.NaN,
      confidenceWeight,
      modelType,
      floorCapped,
      atPriceFloor,
    };
    return row._priceGrowthProfile;
  }

  if (modelType === "threshold" && Number.isFinite(good)) {
    const greatTarget = Number.isFinite(great) ? great : good + Math.max(6, Math.abs(good) * 0.25);
    const bandWidth = Math.max(4, Math.abs(greatTarget - good), toNumber(row.price_m) * 0.35);
    const marginToGood = expected - good;
    const marginToGreat = expected - greatTarget;
    let riseProbability;

    if (marginToGreat >= 0) {
      riseProbability = 0.82 + clamp(marginToGreat / (bandWidth * 2), 0, 0.12);
    } else if (marginToGood >= 0) {
      riseProbability = 0.58 + clamp(marginToGood / bandWidth, 0, 0.20);
    } else {
      riseProbability = 0.08 + clamp((marginToGood + bandWidth) / bandWidth, 0, 0.30);
    }

    const fallProbability =
      atPriceFloor
        ? 0
        : rawDelta < 0
        ? 0.58 + clamp((good - expected) / Math.max(bandWidth, 1), 0, 0.28)
        : clamp(0.20 - Math.max(marginToGood, 0) / Math.max(bandWidth * 2, 1), 0.05, 0.22);
    const expectedDelta =
      rawDelta > 0
        ? rawDelta * riseProbability * confidenceWeight
        : rawDelta < 0
          ? rawDelta * fallProbability * confidenceWeight
          : 0;
    const growthScore =
      expectedDelta * 2.8 +
      riseProbability * 0.9 +
      clamp(marginToGood / Math.max(bandWidth, 1), -0.75, 1.25) * 0.35 -
      fallProbability * 0.65;

    row._priceGrowthProfile = {
      rawDelta,
      expectedDelta,
      growthScore,
      riseProbability: clamp(riseProbability * confidenceWeight, 0, 0.95),
      fallProbability: clamp(fallProbability * confidenceWeight, 0, 0.95),
      marginToGood,
      marginToGreat,
      confidenceWeight,
      modelType,
      floorCapped,
      atPriceFloor,
    };
    return row._priceGrowthProfile;
  }

  const ppm = rowValue(row);
  const recentMove = toNumber(latestPriceMove(row)?.price_delta_m, 0);
  const riseProbability = clamp((ppm - 0.75) / 0.65, 0.05, 0.78) + (recentMove > 0 ? 0.06 : 0);
  const fallProbability = clamp((0.82 - ppm) / 0.45, 0.05, 0.70) + (recentMove < 0 ? 0.08 : 0);
  const expectedDelta =
    rawDelta > 0
      ? rawDelta * clamp(riseProbability, 0, 0.9) * confidenceWeight
      : rawDelta < 0
        ? rawDelta * clamp(fallProbability, 0, 0.9) * confidenceWeight
        : 0;

  row._priceGrowthProfile = {
    rawDelta,
    expectedDelta,
    growthScore: expectedDelta * 2.4 + riseProbability * 0.65 - fallProbability * 0.55,
    riseProbability: clamp(riseProbability * confidenceWeight, 0, 0.9),
    fallProbability: clamp(fallProbability * confidenceWeight, 0, 0.9),
    marginToGood: Number.NaN,
    marginToGreat: Number.NaN,
    confidenceWeight,
    modelType,
  };
  return row._priceGrowthProfile;
}

function budgetGrowthDelta(row) {
  return priceGrowthProfile(row).expectedDelta;
}

function priceGrowthScore(row) {
  return priceGrowthProfile(row).growthScore;
}

function hasBudgetRisePath(row) {
  const profile = priceGrowthProfile(row);
  return profile.expectedDelta > 0.04 || profile.riseProbability >= 0.46 || profile.marginToGood >= -1.5;
}

function hasModeledPriceChange(row) {
  return String(row.projected_price_delta_m ?? "").trim() !== "";
}

function modeledPriceSignal(row) {
  if (!hasModeledPriceChange(row)) return null;

  const delta = toNumber(row.projected_price_delta_m);
  const expected = toNumber(row.expected_fantasy_points);
  const ppm = toNumber(row.price_projected_rolling_ppm);
  const neededGood = toNumber(row.price_points_needed_good);
  const neededGreat = toNumber(row.price_points_needed_great);
  const bucket = row.projected_price_bucket || "estimated";
  const modelType = row.price_model_type || "";
  const confidence = row.price_model_confidence || "";
  const floorCapped = isPriceFloorCapped(row);
  const atPriceFloor = isAtPriceFloor(row);
  const tone = delta > 0 ? "rise" : delta < 0 ? "fall" : "stable";
  const label = atPriceFloor ? "Floor" : delta > 0 ? `+${formatNumber(delta, 1)}M` : delta < 0 ? `${formatNumber(delta, 1)}M` : "Stable";
  const confidenceCopy = confidence ? ` Confidence: ${confidence}.` : "";

  if (modelType === "threshold") {
    const range = row.price_bucket_range || bucket;
    let thresholdCopy;
    if (atPriceFloor) {
      thresholdCopy = "the model sees downside, but price is already at the 3.0M floor";
    } else if (floorCapped) {
      thresholdCopy = "the model sees more downside, but the 3.0M floor caps the possible loss";
    } else if (delta > 0 && neededGreat <= expected) {
      thresholdCopy = "already projects inside the Great price-rise band";
    } else if (delta > 0) {
      thresholdCopy = `already projects inside the Good price-rise band; Great starts at ${formatNumber(neededGreat, 1)} pts`;
    } else {
      thresholdCopy = `Good starts at ${formatNumber(neededGood, 1)} pts and Great starts at ${formatNumber(neededGreat, 1)} pts`;
    }

    return {
      delta,
      tone,
      label,
      reason: `Projected ${formatNumber(expected, 1)} pts lands in the ${bucket} band (${range}). ${thresholdCopy}.${confidenceCopy}`,
    };
  }

  const knownPoints = toNumber(row.price_last_two_points);
  let thresholdCopy;
  if (delta > 0 && neededGreat <= expected) {
    thresholdCopy = "already projects inside max-rise territory";
  } else if (delta > 0) {
    thresholdCopy =
      neededGood <= expected
        ? `already projects inside a rise bucket; ${formatNumber(neededGreat, 1)} pts would point to max-rise territory`
        : `needs ${formatNumber(neededGood, 1)} pts for a rise bucket`;
  } else {
    thresholdCopy = `needs ${formatNumber(neededGood, 1)} pts to reach a rise bucket`;
  }

  return {
    delta,
    tone,
    label,
    reason: `${formatNumber(knownPoints, 1)} pts already banked from the previous two races + ${formatNumber(expected, 1)} projected here gives ${formatNumber(ppm, 2)} rolling pts/M (${bucket}); ${thresholdCopy}.`,
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
  return modeledPriceSignal(row)?.delta ?? inferredPriceChange(row);
}

function priceMomentum(row) {
  const modelSignal = modeledPriceSignal(row);
  if (modelSignal) return modelSignal;

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
  return rows.reduce((sum, row) => sum + budgetGrowthDelta(row), 0);
}

function teamBudgetGrowthScore(rows) {
  return rows.reduce((sum, row) => sum + priceGrowthScore(row), 0);
}

function averagePriceProbability(rows, field) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + (priceGrowthProfile(row)[field] ?? 0), 0) / rows.length;
}

function rowsByKey(type, keys) {
  const source = type === "driver" ? state.drivers : state.constructors;
  const lookup = new Map(source.map((row) => [row.key, row]));
  return keys.map((key) => lookup.get(key)).filter(Boolean);
}

function transferInRows(team) {
  return [...rowsByKey("driver", team.driversIn), ...rowsByKey("constructor", team.constructorsIn)];
}

function transferOutRows(team) {
  return [...rowsByKey("driver", team.driversOut), ...rowsByKey("constructor", team.constructorsOut)];
}

function incomingBudgetDelta(team) {
  return teamBudgetDelta(transferInRows(team));
}

function hasOnlyGrowthTransfers(team) {
  const incoming = transferInRows(team);
  return incoming.length === 0 || incoming.every(hasBudgetRisePath);
}

function formatSignedMoney(value) {
  if (Math.abs(value) < 0.05) return "Stable";
  if (value > 0) return `+${formatNumber(value, 1)}M`;
  if (value < 0) return `${formatNumber(value, 1)}M`;
  return "Stable";
}

function growthPathLabel(row) {
  const profile = priceGrowthProfile(row);
  const signal = priceMomentum(row);
  const risePct = Math.round(profile.riseProbability * 100);
  const margin =
    Number.isFinite(profile.marginToGood)
      ? profile.marginToGood >= 0
        ? `${formatNumber(profile.marginToGood, 1)} pts over Good`
        : `${formatNumber(Math.abs(profile.marginToGood), 1)} pts short of Good`
      : `${formatNumber(rowValue(row), 2)} pts/M`;
  return `${row.key} ${signal.label} (${risePct}% rise path, ${margin})`;
}

function priceProbabilityLabel(row) {
  const profile = priceGrowthProfile(row);
  const rawDelta = projectedPriceChange(row);
  if (rawDelta > 0 || profile.riseProbability >= profile.fallProbability + 0.08) {
    return `${Math.round(profile.riseProbability * 100)}% rise`;
  }
  if (rawDelta < 0 || profile.fallProbability >= profile.riseProbability + 0.08) {
    return `${Math.round(profile.fallProbability * 100)}% fall`;
  }
  const stableProbability = clamp(1 - profile.riseProbability - profile.fallProbability, 0, 0.9);
  return `${Math.round(stableProbability * 100)}% stable`;
}

function priceProbabilityTitle(row, signal = priceMomentum(row)) {
  const profile = priceGrowthProfile(row);
  const risePct = Math.round(profile.riseProbability * 100);
  const fallPct = Math.round(profile.fallProbability * 100);
  const marginCopy = Number.isFinite(profile.marginToGood)
    ? profile.marginToGood >= 0
      ? `${formatNumber(profile.marginToGood, 1)} pts above the Good threshold`
      : `${formatNumber(Math.abs(profile.marginToGood), 1)} pts below the Good threshold`
    : "threshold inferred from value trend";
  return `${signal.reason} Rise path: ${risePct}%. Fall risk: ${fallPct}%. ${marginCopy}.`;
}

function teamPriceProbabilityLabel(team) {
  const risePct = Math.round((team.avgRiseProbability ?? 0) * 100);
  const fallPct = Math.round((team.avgFallProbability ?? 0) * 100);
  if (team.projectedBudgetDelta > 0.05) return `${risePct}% avg rise path | ${fallPct}% fall risk`;
  if (team.projectedBudgetDelta < -0.05) return `${fallPct}% avg fall risk | ${risePct}% rise path`;
  return `${risePct}% avg rise path | stable outlook`;
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
  if (team.activeChip === "wildcard") {
    return `${team.transferCount} ${team.transferCount === 1 ? "Wildcard move" : "Wildcard moves"}`;
  }
  if (team.activeChip === "limitless") {
    return `${team.transferCount} temporary Limitless changes`;
  }
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
  const gp = team.drivers[0]?.next_gp ?? "this GP";
  const isMonaco = gp.toLowerCase().includes("monaco");
  const isAustria = gp.toLowerCase().includes("austria") || gp.toLowerCase().includes("spielberg");
  const isBritish = gp.toLowerCase().includes("british") || gp.toLowerCase().includes("silverstone");
  const isBelgium = gp.toLowerCase().includes("belgium") || gp.toLowerCase().includes("spa");
  const constructorNames = team.constructors.map((row) => row.name).join(" + ");
  const constructorKeys = new Set(team.constructorKeys);

  if (constructorKeys.has("MER") && constructorKeys.has("FER")) {
    return isMonaco
      ? `${constructorNames} is expensive, but it fits Monaco: Mercedes leads the model's constructor projection and Ferrari is also strong on qualifying-heavy weekends.`
      : isAustria
        ? `${constructorNames} is expensive, but it fits Austria because both teams project strongly on a short lap where two-car qualifying and race points stack quickly.`
      : isBritish
        ? `${constructorNames} is expensive, but it fits Silverstone because both teams project well on high-speed aero load and two-car sprint-weekend scoring.`
      : isBelgium
        ? `${constructorNames} is expensive, but it fits Spa because long straights, high-speed commitment and reliability reward strong two-car scoring.`
      : `${constructorNames} is expensive, but both teams sit near the top of the model's constructor projection for ${gp}.`;
  }
  if (constructorKeys.has("MER")) {
    return isMonaco
      ? `${constructorNames} keeps Mercedes exposure, which is useful at Monaco because constructor qualifying points can be hard to recover elsewhere.`
      : isAustria
        ? `${constructorNames} keeps Mercedes exposure, which the model likes for Austria's straight-line efficiency and traction profile.`
      : isBritish
        ? `${constructorNames} keeps Mercedes exposure, useful at Silverstone if high-speed balance and tyre control translate across sprint and race sessions.`
      : isBelgium
        ? `${constructorNames} keeps Mercedes exposure, useful at Spa if efficient aero and straight-line pace translate across the long lap.`
      : `${constructorNames} keeps Mercedes exposure, which the model rates strongly for ${gp}.`;
  }
  if (constructorKeys.has("FER")) {
    return isMonaco
      ? `${constructorNames} leans into Ferrari's Monaco profile, where track position and clean qualifying tend to matter more than race overtakes.`
      : isAustria
        ? `${constructorNames} keeps Ferrari exposure, useful at Austria if the car converts high-speed balance into clean qualifying and race points.`
      : isBritish
        ? `${constructorNames} keeps Ferrari exposure, useful at Silverstone if its recent high-speed and long-run pace carries into the sprint format.`
      : isBelgium
        ? `${constructorNames} keeps Ferrari exposure, useful at Spa if high-speed stability and sector-two confidence carry into race pace.`
      : `${constructorNames} keeps Ferrari exposure, which the model still rates as useful for ${gp}.`;
  }
  return `${constructorNames} gives the model the best points-per-budget balance for this track and the selected transfer limit.`;
}

function budgetContext(team) {
  const gp = team.drivers[0]?.next_gp ?? "this GP";
  const isMonaco = gp.toLowerCase().includes("monaco");
  const isAustria = gp.toLowerCase().includes("austria") || gp.toLowerCase().includes("spielberg");
  const isBritish = gp.toLowerCase().includes("british") || gp.toLowerCase().includes("silverstone");
  const isBelgium = gp.toLowerCase().includes("belgium") || gp.toLowerCase().includes("spa");
  const budgetLeft = `${formatNumber(team.budgetRemaining, 1)}M`;
  if (team.paidTransfers > 0) {
    const penalty = Math.abs(team.transferPenalty);
    return `${transferSummary(team)} with ${budgetLeft} left. The score shown already subtracts the ${penalty}-point paid-transfer penalty, so the model still prefers this higher-upside lineup.`;
  }
  if (team.activeChip === "limitless") {
    return `${transferSummary(team)} and no budget cap for this GP. The displayed cost shows what this one-week lineup would normally cost.`;
  }
  if (team.budgetRemaining < 0.3) {
    return isMonaco
      ? `${transferSummary(team)} and nearly all budget used. That is acceptable here because Monaco rewards concentrated qualifying strength.`
      : isAustria
        ? `${transferSummary(team)} and nearly all budget used. That is acceptable here if the spend buys stronger traction, straight-line and two-car scoring upside.`
      : isBritish
        ? `${transferSummary(team)} and nearly all budget used. That is acceptable here if the spend buys high-speed pace and sprint-weekend scoring upside.`
      : isBelgium
        ? `${transferSummary(team)} and nearly all budget used. That is acceptable here if the spend buys efficient straight-line speed and high-speed stability for Spa.`
      : `${transferSummary(team)} and nearly all budget used. That is acceptable if the extra spend improves the projected lineup for ${gp}.`;
  }
  return `${transferSummary(team)} with ${budgetLeft} left, so the lineup improves projection without spending paid transfers.`;
}

function priceContext(team) {
  if (els.strategy.value === "budget_growth") {
    const incoming = transferInRows(team);
    const names = incoming.map(growthPathLabel).join(", ");
    return incoming.length
      ? `Budget Growth improved the risk-adjusted full-lineup price outlook with these moves: ${names}. The score checks projected points against each asset's rise threshold before chasing budget.`
      : "Budget Growth found no transfer with a better risk-adjusted rise path, so it kept the current structure.";
  }
  if (team.projectedBudgetDelta > 0.4) {
    return `This lineup has ${formatSignedMoney(team.projectedBudgetDelta)} risk-adjusted price momentum, useful if you want to grow budget for future GPs.`;
  }
  if (team.projectedBudgetDelta < -0.4) {
    return `This lineup has ${formatSignedMoney(team.projectedBudgetDelta)} risk-adjusted price risk, so it may cost future budget if the price model is right.`;
  }
  return "Risk-adjusted price outlook looks fairly stable, so this recommendation is mostly about points and transfer efficiency.";
}

function formatSignedPoints(value) {
  if (Math.abs(value) < 0.05) return "0.0";
  return `${value > 0 ? "+" : ""}${formatNumber(value, 1)}`;
}

function risePathCopy(row) {
  const profile = priceGrowthProfile(row);
  const delta = Math.max(projectedPriceChange(row), profile.expectedDelta, 0);
  if (delta >= 0.05) return `a ${formatSignedMoney(delta)} rise path`;
  return `a ${Math.round(profile.riseProbability * 100)}% rise path`;
}

function fallRiskCopy(row) {
  const profile = priceGrowthProfile(row);
  const delta = Math.min(projectedPriceChange(row), profile.expectedDelta, 0);
  if (delta <= -0.05) return `${formatSignedMoney(delta)} fall risk`;
  return `${Math.round(profile.fallProbability * 100)}% fall risk`;
}

function protectedHoldExplanation(team, type) {
  if (team.activeChip === "limitless") return null;

  const selectedRows = type === "driver" ? team.drivers : team.constructors;
  const currentKeys = new Set(type === "driver" ? team.currentDriverKeys : team.currentConstructorKeys);
  const selectedKeys = new Set(selectedRows.map((row) => row.key));
  const sourceRows = type === "driver" ? state.drivers : state.constructors;
  const keptRows = selectedRows.filter((row) => currentKeys.has(row.key) && strongPriceRiseAsset(row));
  if (!keptRows.length) return null;

  const candidates = [];
  keptRows.forEach((kept) => {
    sourceRows.forEach((candidate) => {
      if (selectedKeys.has(candidate.key) || !highPriceFallRiskAsset(candidate)) return;
      const affordable = team.budgetRemaining + toNumber(kept.price_m) - toNumber(candidate.price_m) >= -0.01;
      const pointGain = toNumber(candidate.expected_fantasy_points) - toNumber(kept.expected_fantasy_points);
      const budgetSwing = Math.max(0, projectedPriceChange(kept)) + Math.abs(Math.min(0, projectedPriceChange(candidate)));
      const minimumPointGain = budgetSwing >= 0.8 ? 6 : 5;
      if (!affordable || pointGain <= 0 || pointGain >= minimumPointGain) return;
      candidates.push({ kept, candidate, pointGain, budgetSwing });
    });
  });

  if (!candidates.length) return null;
  const best = candidates.sort((a, b) => b.budgetSwing - a.budgetSwing || b.pointGain - a.pointGain)[0];
  return `Kept ${best.kept.key} because ${best.candidate.key} adds only ${formatSignedPoints(best.pointGain)} projected pts while swapping ${risePathCopy(best.kept)} for ${fallRiskCopy(best.candidate)}.`;
}

function transferContext(team) {
  const driverHold = protectedHoldExplanation(team, "driver");
  if (driverHold) return driverHold;

  const constructorHold = protectedHoldExplanation(team, "constructor");
  if (constructorHold) return constructorHold;

  if (team.transferCount === 0) {
    return "No transfer cleared the points, price-momentum and free-transfer checks, so the model kept your current structure.";
  }

  const incoming = transferInRows(team);
  const outgoing = transferOutRows(team);
  const incomingRise = incoming.filter(hasBudgetRisePath);
  const incomingRisk = incoming.filter(highPriceFallRiskAsset);
  const outgoingRise = outgoing.filter(strongPriceRiseAsset);

  if (incomingRisk.length && outgoingRise.length) {
    return `${transferSummary(team)} are being used for points, but the model is cautious: ${incomingRisk
      .map((row) => row.key)
      .join(", ")} carry ${incomingRisk.map(fallRiskCopy).join(" / ")} while ${outgoingRise
      .map((row) => row.key)
      .join(", ")} have ${outgoingRise.map(risePathCopy).join(" / ")}.`;
  }

  if (incomingRise.length) {
    return `${transferSummary(team)} bring in ${incomingRise
      .map((row) => `${row.key} (${risePathCopy(row)})`)
      .join(", ")} while staying inside the transfer plan.`;
  }

  return `${transferSummary(team)} clear the projected-points and transfer-penalty checks for this strategy.`;
}

function trackContext(team, recommendation) {
  const gp = team.drivers[0]?.next_gp ?? "this GP";
  const gpKey = gp.toLowerCase();
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
        ["Transfer logic", transferContext(team)],
        ["Budget logic", budgetContext(team)],
      ],
    };
  }

  if (gpKey.includes("barcelona")) {
    return {
      title: "Barcelona-Catalunya context: aero balance and tyre management",
      summary:
        "Barcelona rewards efficient aero, high-speed corner confidence and keeping the tyres alive through long loaded corners, so the optimizer leans into teams with broad pace rather than pure street-track qualifying upside.",
      insights: [
        [
          "Track logic",
          "High-speed corners, traction zones and tyre degradation matter together here, so strong race pace and stable two-car constructor scoring carry extra weight.",
        ],
        ["Constructor logic", constructorContext(team)],
        ["Chip logic", chipContext(team, recommendation)],
        ["Price logic", priceContext(team)],
        ["Transfer logic", transferContext(team)],
        ["Budget logic", budgetContext(team)],
      ],
    };
  }

  if (gpKey.includes("austria") || gpKey.includes("spielberg")) {
    return {
      title: "Austria context: short lap, traction and clean exits",
      summary:
        "The Red Bull Ring is a short, high-speed lap with heavy braking and traction exits, so the optimizer values strong qualifying, straight-line efficiency and reliable two-car scoring.",
      insights: [
        [
          "Track logic",
          "Lap gaps can be tight, but clean exits from the slow corners, braking stability and low-drag pace are still key to converting grid position into race points.",
        ],
        ["Constructor logic", constructorContext(team)],
        ["Chip logic", chipContext(team, recommendation)],
        ["Price logic", priceContext(team)],
        ["Transfer logic", transferContext(team)],
        ["Budget logic", budgetContext(team)],
      ],
    };
  }

  if (gpKey.includes("british") || gpKey.includes("silverstone")) {
    return {
      title: "Silverstone context: high-speed aero and sprint upside",
      summary:
        "Silverstone rewards high-speed corner confidence, aero efficiency and tyre control through long loaded sections, with the sprint format adding extra points on the table.",
      insights: [
        [
          "Track logic",
          "Fast corners, tyre load and changeable British weather make stable race pace valuable, while the sprint weekend increases the reward for strong qualifying and clean execution.",
        ],
        ["Constructor logic", constructorContext(team)],
        ["Chip logic", chipContext(team, recommendation)],
        ["Price logic", priceContext(team)],
        ["Transfer logic", transferContext(team)],
        ["Budget logic", budgetContext(team)],
      ],
    };
  }

  if (gpKey.includes("belgium") || gpKey.includes("spa")) {
    return {
      title: "Spa context: long lap, high-speed load and overtaking",
      summary:
        "Spa rewards efficient straight-line speed, confidence through fast corners and a clean setup compromise across very different sectors, so the optimizer values strong race pace and reliable two-car scoring.",
      insights: [
        [
          "Track logic",
          "Kemmel rewards straight-line efficiency and creates overtaking chances, while Eau Rouge/Raidillon and Pouhon still demand high-speed stability. The strongest setup has to do both.",
        ],
        ["Constructor logic", constructorContext(team)],
        ["Chip logic", chipContext(team, recommendation)],
        ["Price logic", priceContext(team)],
        ["Transfer logic", transferContext(team)],
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
      ["Transfer logic", transferContext(team)],
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
  if (els.priceProbability) els.priceProbability.textContent = teamPriceProbabilityLabel(best);
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
          <span class="alt-sub">${compactBoostLabel(team)}${team.activeChip !== "none" ? ` | ${chipLabel(team.activeChip)}` : ""}</span>
        </td>
        <td>
          <strong>${formatNumber(team.totalCost, 1)}M</strong>
          <span class="alt-sub alt-sub--cost">${budgetLeftLabel(team)} | ${formatSignedMoney(team.projectedBudgetDelta)}</span>
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

function compactBoostLabel(team) {
  const driver = team.bestBoost;
  return driver ? `2x ${driver.key}` : "--";
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
  updateBudgetValidation();
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
  buildComboCaches();
  const sample = state.projections[0];
  updateModelCopy(sample);
  els.status.textContent = `${sample?.next_gp ?? "Next GP"} ${sample?.mode ? `| ${sample.mode}` : ""} model ready. Click Optimize Team to run it.`;
  updatePickerSummaries();
  loadAvailableChips();
  syncChipAvailability();
  updateBudgetValidation();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runOptimization();
});

els.openDriverPicker.addEventListener("click", () => openPicker("driver"));
els.openConstructorPicker.addEventListener("click", () => openPicker("constructor"));
els.budget.addEventListener("input", updateBudgetValidation);
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
