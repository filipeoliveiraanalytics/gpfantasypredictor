const DATA_PATH = "data/fantasy_projections.csv";
const CONSENT_KEY = "gp_fantasy_predictor_analytics_consent";

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

const state = {
  projections: [],
  drivers: [],
  constructors: [],
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
  boostDriver: document.querySelector("#boost-driver"),
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
  if (strategy === "value") return 0.7 * team.netExpectedPoints + 12 * team.valuePerMillion;
  if (strategy === "current_friendly") return team.netExpectedPoints - 1.25 * team.transferCount;
  return team.netExpectedPoints;
}

function teamColor(team) {
  return TEAM_COLORS[team] || "#f0c84b";
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
  const paidTransfers = Math.max(0, transferCount - inputs.freeTransfers);
  const transferPenalty = paidTransfers * -10;
  const bestBoost = [...driverCombo].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points))[0];
  const boostBase = toNumber(bestBoost?.expected_fantasy_points);
  const boostExtraPoints = boostBase;
  const netExpectedPoints = expectedPoints + transferPenalty + boostExtraPoints;

  return {
    drivers: driverCombo,
    constructors: constructorCombo,
    driverKeys,
    constructorKeys,
    totalCost,
    budgetRemaining: inputs.budget - totalCost,
    expectedPoints,
    netExpectedPoints,
    valuePerMillion: expectedPoints / totalCost,
    avgRiskScore,
    transferCount,
    paidTransfers,
    transferPenalty,
    boostExtraPoints,
    driversIn,
    driversOut,
    constructorsIn,
    constructorsOut,
    bestBoost,
  };
}

function optimize() {
  const inputs = {
    budget: toNumber(els.budget.value),
    freeTransfers: Math.max(0, Math.floor(toNumber(els.freeTransfers.value))),
    currentDrivers: parseKeys(els.drivers.value),
    currentConstructors: parseKeys(els.constructors.value),
    strategy: els.strategy.value,
  };

  const driverCombos = combinations(state.drivers, 5);
  const constructorCombos = combinations(state.constructors, 2);
  const teams = [];

  for (const driverCombo of driverCombos) {
    const driverCost = driverCombo.reduce((sum, row) => sum + toNumber(row.price_m), 0);
    if (driverCost > inputs.budget) continue;

    for (const constructorCombo of constructorCombos) {
      const team = summarizeTeam(driverCombo, constructorCombo, inputs);
      if (team.totalCost > inputs.budget) continue;
      team.strategyScore = strategyScore(team, inputs.strategy);
      teams.push(team);
    }
  }

  teams.sort((a, b) => b.strategyScore - a.strategyScore || b.netExpectedPoints - a.netExpectedPoints);
  const topTeams = teams.slice(0, 10);
  render(topTeams);

  if (topTeams[0]) {
    trackEvent("optimize_team", {
      strategy: inputs.strategy,
      free_transfers: inputs.freeTransfers,
      budget: inputs.budget,
      recommended_boost: topTeams[0].bestBoost?.key ?? "",
      transfer_count: topTeams[0].transferCount,
      paid_transfers: topTeams[0].paidTransfers,
    });
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
  return `<span class="chip" style="--team-color:${color}"><strong>${row.key}</strong> ${row.name}</span>`;
}

function formatNumber(value, decimals = 1) {
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function render(teams) {
  const best = teams[0];
  if (!best) {
    els.status.textContent = "No valid team found for this budget.";
    els.alternatives.innerHTML = "";
    els.alternativeCards.innerHTML = "";
    return;
  }

  els.status.textContent = `${best.drivers[0]?.next_gp ?? "Next GP"} | ${best.drivers[0]?.mode ?? "Projection"}`;
  els.netPoints.textContent = formatNumber(best.netExpectedPoints, 1);
  els.teamCost.textContent = `${formatNumber(best.totalCost, 1)}M`;
  els.boostDriver.textContent = boostLabel(best);
  els.driverList.innerHTML = best.drivers.map(chip).join("");
  els.constructorList.innerHTML = best.constructors.map(chip).join("");
  els.transfersIn.textContent = [...best.driversIn, ...best.constructorsIn].join(", ") || "None";
  els.transfersOut.textContent = [...best.driversOut, ...best.constructorsOut].join(", ") || "None";
  els.transferPenalty.textContent = `${best.transferPenalty.toFixed(0)} pts`;

  els.alternatives.innerHTML = teams
    .map(
      (team, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${team.driverKeys.join(", ")}</td>
        <td>${team.constructorKeys.join(", ")}</td>
        <td>${formatNumber(team.totalCost, 1)}M</td>
        <td>${formatNumber(team.netExpectedPoints, 1)}</td>
        <td>${team.transferCount} (${team.paidTransfers} paid)</td>
      </tr>`
    )
    .join("");

  els.alternativeCards.innerHTML = teams
    .map(
      (team, index) => `
      <article class="alternative-card">
        <header>
          <span>Lineup #${index + 1}</span>
          <strong>${formatNumber(team.netExpectedPoints, 1)} pts</strong>
        </header>
        <dl>
          <div>
            <dt>Drivers</dt>
            <dd>${team.driverKeys.join(", ")}</dd>
          </div>
          <div>
            <dt>Constructors</dt>
            <dd>${team.constructorKeys.join(", ")}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>${formatNumber(team.totalCost, 1)}M</dd>
          </div>
          <div>
            <dt>Transfers</dt>
            <dd>${team.transferCount} (${team.paidTransfers} paid)</dd>
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
      <span class="option-key">${row.key}</span>
      <span>
        <strong>${row.name}</strong>
        <small>${row.team} | ${formatNumber(toNumber(row.price_m), 1)}M</small>
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

async function init() {
  const response = await fetch(DATA_PATH);
  if (!response.ok) throw new Error(`Could not load ${DATA_PATH}`);
  state.projections = parseCsv(await response.text());
  state.drivers = state.projections.filter((row) => row.entity_type === "driver");
  state.constructors = state.projections.filter((row) => row.entity_type === "constructor");
  const sample = state.projections[0];
  els.status.textContent = `${sample?.next_gp ?? "Next GP"} ${sample?.mode ? `| ${sample.mode}` : ""} model ready.`;
  updatePickerSummaries();
  runOptimization();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runOptimization();
});

els.openDriverPicker.addEventListener("click", () => openPicker("driver"));
els.openConstructorPicker.addEventListener("click", () => openPicker("constructor"));
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
