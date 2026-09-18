const DATA_ROOT = "data";
const TEAM_STORAGE_KEY = "gp-fantasy-notebook-team-v1";
const ANALYTICS_CONSENT_KEY = "gp_fantasy_predictor_analytics_consent";
const OPTIMIZER_MESSAGE_SOURCE = "gp-fantasy-optimizer";

const teamColors = {
  Mercedes: "#20a69b", McLaren: "#ee781d", Ferrari: "#d52d36", "Red Bull Racing": "#20386f",
  "Racing Bulls": "#224caa", Williams: "#3277cc", Audi: "#b8b7b4", Cadillac: "#77716d",
  Alpine: "#e56f8f", "Aston Martin": "#007768", "Haas F1 Team": "#9d9d9d",
};

const state = {
  projections: [], audits: [], auditRows: [],
  currentDrivers: ["RUS", "LIN", "HUL", "ALB", "PER"],
  currentConstructors: ["MER", "MCL"],
  pickerType: "driver", pickerSelection: new Set(), engineReady: false, optimizationRequest: null,
  recommendedRows: [], recommendation: null, lineupView: "recommended",
};

const els = {
  budget: document.querySelector("#budget-input"),
  transfers: document.querySelector("#transfers-input"),
  strategy: document.querySelector("#strategy-input"),
  chips: [...document.querySelectorAll(".chip-settings input")],
  chipCount: document.querySelector("#chip-count"),
  drivers: document.querySelector("#current-drivers"),
  constructors: document.querySelector("#current-constructors"),
  optimize: document.querySelector("#optimize-button"),
  saveTeam: document.querySelector("#save-team"),
  rows: document.querySelector("#recommended-rows"),
  summary: document.querySelector("#recommendation-summary"),
  viewControls: [...document.querySelectorAll("[data-lineup-view]")],
  contextTitle: document.querySelector("#context-title"),
  contextIntro: document.querySelector("#context-intro"),
  contextList: document.querySelector("#context-list"),
  scheduleHeading: document.querySelector("#schedule-heading"),
  scheduleTimes: [...document.querySelectorAll("[data-session-start]")],
  stageCopy: document.querySelector("#stage-copy"),
  lineupHeading: document.querySelector("#lineup-heading"),
  auditSelect: document.querySelector("#audit-select"),
  driverMae: document.querySelector("#driver-mae"),
  driverMaeDetail: document.querySelector("#driver-mae-detail"),
  constructorMae: document.querySelector("#constructor-mae"),
  constructorMaeDetail: document.querySelector("#constructor-mae-detail"),
  shifts: document.querySelector("#biggest-shifts"),
  openAudit: document.querySelector("#open-audit"),
  auditTeaserCopy: document.querySelector("#audit-teaser-copy"),
  auditButtonLabel: document.querySelector("#audit-button-label"),
  pickerDialog: document.querySelector("#picker-dialog"),
  pickerTitle: document.querySelector("#picker-title"),
  pickerHelp: document.querySelector("#picker-help"),
  pickerOptions: document.querySelector("#picker-options"),
  applyPicker: document.querySelector("#apply-picker"),
  auditDialog: document.querySelector("#audit-dialog"),
  auditFlag: document.querySelector("#audit-flag"),
  auditTitle: document.querySelector("#audit-title"),
  auditNote: document.querySelector("#audit-note"),
  auditDriverRows: document.querySelector("#audit-driver-rows"),
  auditConstructorRows: document.querySelector("#audit-constructor-rows"),
  engine: document.querySelector("#optimizer-engine"),
  cookieBanner: document.querySelector("#cookie-banner"),
  acceptAnalytics: document.querySelector("#accept-analytics"),
  declineAnalytics: document.querySelector("#decline-analytics"),
};

function loadAnalytics() {
  if (!window.GA_MEASUREMENT_ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", window.GA_MEASUREMENT_ID, { anonymize_ip: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${window.GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function initialiseAnalyticsConsent() {
  const consent = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (consent === "accepted") {
    loadAnalytics();
  } else if (consent !== "declined") {
    els.cookieBanner.hidden = false;
  }
}

function parseCsv(text) {
  const rows = [];
  let cell = "";
  let row = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || row.length) rows.push([...row, cell]);
  const [headers, ...values] = rows;
  return values.map((entry) => Object.fromEntries(headers.map((header, index) => [header, entry[index] || ""])));
}

function number(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function format(value, decimals = 1) {
  return number(value).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rowsFor(type) {
  return state.projections.filter((row) => row.entity_type === type && String(row.is_available).toUpperCase() !== "FALSE");
}

function rowForKey(key) {
  return state.projections.find((row) => row.key === key);
}

function selectedRows(type) {
  const keys = type === "driver" ? state.currentDrivers : state.currentConstructors;
  return keys.map(rowForKey).filter(Boolean);
}

function swatch(row) {
  return `<i style="background:${teamColors[row.team] || "#555"}"></i>`;
}

function renderCurrentTeam() {
  const renderList = (type) => selectedRows(type)
    .map((row) => `<li>${swatch(row)}<span>${escapeHtml(row.name)}${type === "driver" ? `<small>${escapeHtml(row.team)}</small>` : ""}</span><b>$${format(row.price_m)}m</b></li>`)
    .join("");
  els.drivers.innerHTML = renderList("driver");
  els.constructors.innerHTML = renderList("constructor");
}

function renderChipCount() {
  const available = els.chips.filter((chip) => chip.checked).length;
  els.chipCount.textContent = `${available} active`;
}

function restoreSavedTeam() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TEAM_STORAGE_KEY) || "null");
    if (!saved) return false;
    const availableKeys = new Set(state.projections.map((row) => row.key));
    const hasValidLineup = Array.isArray(saved.drivers) && saved.drivers.length === 5
      && Array.isArray(saved.constructors) && saved.constructors.length === 2
      && [...saved.drivers, ...saved.constructors].every((key) => availableKeys.has(key));
    if (!hasValidLineup) return false;
    state.currentDrivers = saved.drivers;
    state.currentConstructors = saved.constructors;
    if (Number.isFinite(Number(saved.budget)) && Number(saved.budget) > 0) els.budget.value = saved.budget;
    if (Number.isInteger(Number(saved.transfers)) && Number(saved.transfers) >= 0) els.transfers.value = saved.transfers;
    if ([...els.strategy.options].some((option) => option.value === saved.strategy)) els.strategy.value = saved.strategy;
    if (Array.isArray(saved.chips)) els.chips.forEach((chip) => { chip.checked = saved.chips.includes(chip.value); });
    els.saveTeam.checked = true;
    return true;
  } catch {
    return false;
  }
}

function saveTeam({ announce = true } = {}) {
  const saved = {
    drivers: state.currentDrivers,
    constructors: state.currentConstructors,
    budget: els.budget.value,
    transfers: els.transfers.value,
    strategy: els.strategy.value,
    chips: els.chips.filter((chip) => chip.checked).map((chip) => chip.value),
  };
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(saved));
    if (announce) els.stageCopy.textContent = "Team will stay saved in this browser for the Azerbaijan GP.";
  } catch {
    if (announce) els.stageCopy.textContent = "This browser could not save the team.";
  }
}

function persistTeamIfEnabled() {
  if (els.saveTeam.checked) saveTeam({ announce: false });
}

function auditKey(audit) {
  return `${audit.gp_key}|${audit.mode}|${audit.status}`;
}

function activeAudit() {
  return state.audits.find((audit) => auditKey(audit) === els.auditSelect.value) || state.audits[0];
}

function auditDelta(row) {
  return number(row.actual_points) - number(row.estimated_points);
}

function formatLocalSession(isoDate) {
  const session = new Date(isoDate);
  const dateParts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", weekday: "short" })
    .formatToParts(session)
    .reduce((parts, part) => ({ ...parts, [part.type]: part.value }), {});
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(session);
  return `${dateParts.day}/${dateParts.month} (${dateParts.weekday}) · ${time}`;
}

function renderSchedule() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  els.scheduleHeading.title = `Times shown in ${timeZone.replace(/_/g, " ")}`;
  els.scheduleTimes.forEach((time) => {
    const value = time.dataset.sessionStart;
    time.dateTime = value;
    time.textContent = formatLocalSession(value);
  });
}

function auditRowsFor(audit) {
  return state.auditRows.filter((row) => row.gp_key === audit.gp_key && row.mode === audit.mode);
}

function metric(value, element, detail) {
  element.innerHTML = `${format(value)} <small>pts</small>`;
  detail.textContent = "DNF-adjusted scoring";
}

function renderAudit() {
  const audit = activeAudit();
  if (!audit) return;
  metric(audit.driver_mean_absolute_error, els.driverMae, els.driverMaeDetail);
  metric(audit.constructor_mean_absolute_error, els.constructorMae, els.constructorMaeDetail);
  const shifts = auditRowsFor(audit)
    .sort((left, right) => Math.abs(auditDelta(right)) - Math.abs(auditDelta(left)))
    .slice(0, 4);
  els.shifts.innerHTML = shifts.map((row) => {
    const delta = auditDelta(row);
    return `<li><span>${escapeHtml(row.name)}<small>${escapeHtml(row.team || "Constructor")}</small></span><b class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${format(delta)}</b></li>`;
  }).join("");
}

function populateAuditSelect() {
  const stageOrder = { "Pre-Weekend": 0, "After Practice": 1, "Post-Quali": 2 };
  const audits = [...state.audits].sort((left, right) =>
    right.scored_at.localeCompare(left.scored_at) || stageOrder[left.mode] - stageOrder[right.mode]
  );
  els.auditSelect.innerHTML = audits.map((audit) =>
    `<option value="${escapeHtml(auditKey(audit))}">${escapeHtml(audit.gp_display)} | ${escapeHtml(audit.mode)}</option>`
  ).join("");
  const preferred = audits.find((audit) => audit.gp_key === "Madrid" && audit.mode === "Post-Quali") || audits[0];
  els.auditSelect.value = auditKey(preferred);
  els.auditTeaserCopy.textContent = "Compare Dutch, Italian, and Spanish GP forecasts at every published stage.";
  els.auditButtonLabel.textContent = "Browse forecast reviews";
  renderAudit();
}

function openPicker(type) {
  state.pickerType = type;
  state.pickerSelection = new Set(type === "driver" ? state.currentDrivers : state.currentConstructors);
  const maximum = type === "driver" ? 5 : 2;
  els.pickerTitle.textContent = type === "driver" ? "Choose current drivers" : "Choose current constructors";
  els.pickerHelp.textContent = `Select exactly ${maximum} assets. These are your existing Fantasy picks, not the recommendation.`;
  renderPickerOptions();
  els.pickerDialog.showModal();
}

function renderPickerOptions() {
  els.pickerOptions.innerHTML = rowsFor(state.pickerType)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((row) => {
      const selected = state.pickerSelection.has(row.key);
      return `<button class="picker-option ${selected ? "selected" : ""}" type="button" data-picker-key="${escapeHtml(row.key)}"><i class="team-swatch" style="--team-color:${teamColors[row.team] || "#555"}"></i><span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.team)} | $${format(row.price_m)}m</small></span><b>${selected ? "Selected" : ""}</b></button>`;
    }).join("");
}

function applyPicker() {
  const maximum = state.pickerType === "driver" ? 5 : 2;
  if (state.pickerSelection.size !== maximum) {
    els.pickerHelp.textContent = `Select exactly ${maximum}; you currently have ${state.pickerSelection.size}.`;
    return;
  }
  if (state.pickerType === "driver") state.currentDrivers = [...state.pickerSelection];
  else state.currentConstructors = [...state.pickerSelection];
  renderCurrentTeam();
  renderRaceContext();
  persistTeamIfEnabled();
  els.pickerDialog.close();
  els.stageCopy.textContent = "Current team updated. Run the optimizer to refresh the recommendation.";
}

function sortedAssets(compare) {
  return ["driver", "constructor"].flatMap((type) => rowsFor(type).sort(compare));
}

function rowsForLineupView() {
  if (!state.recommendation) return [];
  if (state.lineupView === "recommended") return state.recommendedRows;
  return sortedAssets((left, right) => number(right.expected_fantasy_points) - number(left.expected_fantasy_points));
}

function renderLineupTable() {
  const rows = rowsForLineupView();
  els.viewControls.forEach((button) => {
    const selected = button.dataset.lineupView === state.lineupView;
    button.disabled = !state.recommendation;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  if (!rows.length) {
    els.rows.innerHTML = '<tr class="lineup-empty"><td colspan="6">Run the optimizer to build a lineup.</td></tr>';
    return;
  }
  els.rows.innerHTML = rows.map((row, index) => {
    const delta = number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m));
    const hasMaterialPriceMove = Math.abs(delta) >= 0.05;
    const trendClass = hasMaterialPriceMove ? (delta > 0 ? "up" : "down") : "neutral";
    const trendLabel = hasMaterialPriceMove ? `${delta > 0 ? "+" : ""}${format(delta)}m` : "--";
    const position = rows.slice(0, index).filter((candidate) => candidate.entity_type === row.entity_type).length + 1;
    const isFirstConstructor = row.entity_type === "constructor" && !rows.slice(0, index).some((candidate) => candidate.entity_type === "constructor");
    const rowClass = [row.entity_type === "constructor" ? "constructor" : "", isFirstConstructor ? "first-constructor" : ""].filter(Boolean).join(" ");
    const teamLabel = row.entity_type === "driver" ? `<small>${escapeHtml(row.team)}</small>` : "";
    return `<tr class="${rowClass}"><td class="position">${position}</td><td class="asset-name"><i style="--team-color:${teamColors[row.team] || "#555"}"></i><span><strong>${escapeHtml(row.name)}</strong>${teamLabel}</span></td><td class="points">${format(row.expected_fantasy_points)}</td><td>$${format(row.price_m)}m</td><td title="Projected points per $1M">${format(row.value_per_million, 2)}</td><td class="${trendClass}">${trendLabel}</td></tr>`;
  }).join("");
}

function chipSummary(chip) {
  return chip ? chip.replace(/^Use\s+/, "").split("|")[0].trim() : "No chip";
}

function nameList(rows) {
  const names = rows.map((row) => row.name);
  if (names.length < 2) return names[0] || "the current lineup";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

function renderContextRows(rows) {
  els.contextList.innerHTML = rows.map(([label, detail]) => {
    const transferDetail = typeof detail === "object";
    const content = transferDetail
      ? `<dd class="transfer-detail"><span class="transfer-out"><b>Out</b>${escapeHtml(detail.out)}</span><span class="transfer-in"><b>In</b>${escapeHtml(detail.in)}</span></dd>`
      : `<dd>${escapeHtml(detail)}</dd>`;
    return `<div><dt>${escapeHtml(label)}</dt>${content}</div>`;
  }).join("");
}

function renderRaceContext() {
  if (!els.contextList) return;
  const trackLogic = "Long flat-out runs reward top speed; heavy braking zones and the Castle sector raise the cost of small mistakes.";
  if (!state.recommendation) {
    els.contextTitle.textContent = "Azerbaijan context.";
    els.contextIntro.textContent = "The Baku baseline is ready. Save a team and run the model to tailor this plan to your transfers, budget, and chips.";
    renderContextRows([
      ["Track logic", trackLogic],
      ["Constructor logic", "Prioritize efficient cars that can convert qualifying pace into track position and defend on the main straight."],
      ["Chip plan", "Keep flexibility through practice. The model will only surface a chip when it clears the transfer and budget trade-off."],
    ]);
    return;
  }

  const rows = state.recommendedRows;
  const current = new Set([...state.currentDrivers, ...state.currentConstructors]);
  const recommended = new Set(rows.map((row) => row.key));
  const incoming = rows.filter((row) => !current.has(row.key));
  const outgoing = state.projections.filter((row) => current.has(row.key) && !recommended.has(row.key));
  const constructors = rows.filter((row) => row.entity_type === "constructor");
  const retainedConstructors = constructors.filter((row) => current.has(row.key));
  const totalCost = rows.reduce((sum, row) => sum + number(row.price_m), 0);
  const priceDelta = rows.reduce((sum, row) => sum + number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m)), 0);
  const chip = chipSummary(state.recommendation.chip);
  const limitless = state.recommendation.chip?.includes("Limitless");
  const budgetLeft = number(els.budget.value) - totalCost;
  const transferDetail = incoming.length
    ? { out: nameList(outgoing), in: nameList(incoming) }
    : "The model retains your current squad, so no transfer is needed.";
  const constructorDetail = retainedConstructors.length === constructors.length
    ? `${nameList(constructors)} keep your existing constructor exposure, which the model rates strongly for Baku.`
    : `${nameList(constructors)} are the model's best constructor fit for Baku's straight-line and qualifying demands.`;
  const chipDetail = chip === "No chip"
    ? "Hold your chips. No available option creates enough projected upside over the standard transfer route."
    : limitless
      ? "Limitless is recommended because it unlocks the highest projected squad without the usual budget ceiling."
      : `${chip} is the recommended edge under your current budget and transfer constraints.`;
  const budgetDetail = limitless
    ? `The standard-price equivalent is $${format(totalCost)}m, with ${priceDelta >= 0 ? "+" : ""}${format(priceDelta)}m projected price momentum across the lineup.`
    : `$${format(Math.max(0, budgetLeft))}m remains after changes, with ${priceDelta >= 0 ? "+" : ""}${format(priceDelta)}m projected price momentum across the lineup.`;

  els.contextTitle.textContent = "Your Azerbaijan plan.";
  els.contextIntro.textContent = `${state.recommendation.points} projected from a lineup tailored to your saved team, budget, and transfer plan.`;
  renderContextRows([
    ["Track logic", trackLogic],
    ["Constructor logic", constructorDetail],
    ["Chip plan", chipDetail],
    ["Transfer plan", transferDetail],
    ["Budget outlook", budgetDetail],
  ]);
}

function renderRecommendationSummary(rows, result, incoming, boost) {
  const totalCost = rows.reduce((sum, row) => sum + number(row.price_m), 0);
  const projectedValue = rows.reduce((sum, row) => sum + number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m)), 0);
  const budgetLeft = number(els.budget.value) - totalCost;
  const limitless = result.chip?.includes("Limitless");
  const transferLabel = `${incoming.length} move${incoming.length === 1 ? "" : "s"}`;
  const transferDetail = result.paidTransfers ? `${result.paidTransfers} paid` : "Free moves cover it";
  const valueDirection = projectedValue >= 0 ? "up" : "down";
  const valueArrow = projectedValue >= 0 ? "&uarr;" : "&darr;";
  els.summary.hidden = false;
  els.summary.innerHTML = `
    <div><span>Projected</span><strong>${escapeHtml(result.points)}</strong><small>Net of penalties</small></div>
    <div><span>Squad cost</span><strong>$${format(totalCost)}m</strong><small>${limitless ? "No budget cap" : `${format(Math.max(0, budgetLeft))}m left`}</small></div>
    <div><span>Transfers</span><strong>${transferLabel}</strong><small>${transferDetail}</small></div>
    <div><span>2x boost</span><strong>${escapeHtml(boost?.name || "--")}</strong><small>Selected driver</small></div>
    <div><span>Chip</span><strong>${escapeHtml(chipSummary(result.chip))}</strong><small>${result.chip ? "Recommended" : "Save for later"}</small></div>
    <div class="projected-value ${valueDirection}"><span>Projected value</span><strong><i aria-hidden="true">${valueArrow}</i> ${format(Math.abs(projectedValue))}m</strong><small>Expected price path</small></div>`;
}

function renderRecommendation(rows, result) {
  const current = new Set([...state.currentDrivers, ...state.currentConstructors]);
  const incoming = rows.filter((row) => !current.has(row.key));
  const boost = result.boost || rows.filter((row) => row.entity_type === "driver").sort((a, b) => number(b.expected_fantasy_points) - number(a.expected_fantasy_points))[0];
  state.recommendedRows = rows;
  state.recommendation = result;
  state.lineupView = "recommended";
  renderRecommendationSummary(rows, result, incoming, boost);
  renderLineupTable();
  renderRaceContext();
}

function waitFor(condition, timeout = 12000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) return resolve();
      if (Date.now() - started > timeout) return reject(new Error("The optimizer engine did not finish loading."));
      window.setTimeout(check, 100);
    };
    check();
  });
}

function prepareOptimizerEngine() {
  state.engineReady = false;
  els.optimize.disabled = true;
  els.optimize.innerHTML = "Preparing optimizer <span>...</span>";
  const engineUrl = new URL("optimizer-engine.html", window.location.href);
  engineUrl.searchParams.set("bridge", Date.now().toString());
  els.engine.src = engineUrl.toString();
}

function requestOptimization() {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const input = {
    budget: els.budget.value,
    transfers: els.transfers.value,
    drivers: state.currentDrivers,
    constructors: state.currentConstructors,
    strategy: els.strategy.value,
    chips: els.chips.filter((chip) => chip.checked).map((chip) => chip.value),
  };
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      if (state.optimizationRequest?.requestId !== requestId) return;
      state.optimizationRequest = null;
      reject(new Error("The optimizer did not return a result. Please retry."));
    }, 30000);
    state.optimizationRequest = { requestId, resolve, reject, timeout };
    els.engine.contentWindow.postMessage({ source: OPTIMIZER_MESSAGE_SOURCE, type: "optimise", requestId, input }, window.location.origin);
  });
}

async function runOptimizer() {
  if (!state.engineReady) {
    els.stageCopy.textContent = "Preparing the optimizer. It will be ready shortly.";
    prepareOptimizerEngine();
    return;
  }
  els.optimize.disabled = true;
  els.optimize.innerHTML = "Optimizing <span>...</span>";
  els.stageCopy.textContent = "Calculating with the live Pre-Weekend model.";
  try {
    const result = await requestOptimization();
    const recommended = result.names.map((name) => state.projections.find((row) => row.name === name)).filter(Boolean);
    if (recommended.length !== 7) throw new Error("Could not read the full recommendation from the optimizer.");
    const boost = recommended.find((row) => row.name === result.boostName);
    renderRecommendation(recommended, {
      points: `${result.points} pts`,
      cost: result.cost,
      paidTransfers: Math.max(0, Math.round(Math.abs(number(result.transferText)) / 10)),
      boost,
      chip: result.chip,
    });
    els.stageCopy.textContent = "Pre-weekend recommendation updated from the live optimizer.";
  } catch (error) {
    els.stageCopy.textContent = error.message;
  } finally {
    els.optimize.disabled = false;
    els.optimize.innerHTML = "Optimize Team <span>→</span>";
  }
}

function renderAuditDialog() {
  const audit = activeAudit();
  const rows = auditRowsFor(audit);
  const auditFlags = {
    Netherlands: ["netherlands", "Netherlands"],
    Italy: ["italy", "Italy"],
    Madrid: ["spain", "Spain"],
  };
  const [flagClass, flagLabel] = auditFlags[audit.gp_key] || ["spain", "Spain"];
  els.auditFlag.className = `audit-flag flag-${flagClass}`;
  els.auditFlag.setAttribute("aria-label", `${flagLabel} flag`);
  els.auditTitle.textContent = `${audit.gp_display} | ${audit.mode}`;
  els.auditNote.textContent = "Locked forecast compared with official F1 Fantasy scoring. DNF-affected assets remain marked in the source audit.";
  const tableRows = (type) => rows.filter((row) => row.entity_type === type).sort((left, right) => Math.abs(auditDelta(left)) - Math.abs(auditDelta(right)) || left.name.localeCompare(right.name))
    .map((row) => {
      const delta = auditDelta(row);
      return `<tr><td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.team || "")}</small></td><td>${format(row.estimated_points)}</td><td>${format(row.actual_points)}</td><td class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${format(delta)}</td></tr>`;
    }).join("");
  els.auditDriverRows.innerHTML = tableRows("driver");
  els.auditConstructorRows.innerHTML = tableRows("constructor");
  if (!els.auditDialog.open) els.auditDialog.showModal();
}

async function initialise() {
  const [projectionResponse, auditResponse, auditRowsResponse] = await Promise.all([
    fetch(`${DATA_ROOT}/fantasy_projections.csv`, { cache: "no-store" }),
    fetch(`${DATA_ROOT}/fantasy_forecast_tracker.csv`, { cache: "no-store" }),
    fetch(`${DATA_ROOT}/fantasy_forecast_asset_audit.csv`, { cache: "no-store" }),
  ]);
  if (!projectionResponse.ok || !auditResponse.ok || !auditRowsResponse.ok) throw new Error("Could not load the Fantasy data files.");
  state.projections = parseCsv(await projectionResponse.text());
  state.audits = parseCsv(await auditResponse.text());
  state.auditRows = parseCsv(await auditRowsResponse.text());
  const restoredTeam = restoreSavedTeam();
  renderChipCount();
  renderCurrentTeam();
  renderLineupTable();
  renderRaceContext();
  renderSchedule();
  populateAuditSelect();
  const sample = state.projections[0];
  els.lineupHeading.textContent = "Recommended Lineup";
  els.stageCopy.textContent = restoredTeam
    ? "Saved team restored. Run the optimizer to refresh the recommendation."
    : `Live ${sample.mode} model loaded. Choose your team and run the optimizer.`;
}

document.querySelectorAll("[data-picker]").forEach((button) => button.addEventListener("click", () => openPicker(button.dataset.picker)));
els.pickerOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-picker-key]");
  if (!option) return;
  const key = option.dataset.pickerKey;
  const maximum = state.pickerType === "driver" ? 5 : 2;
  if (state.pickerSelection.has(key)) state.pickerSelection.delete(key);
  else if (state.pickerSelection.size < maximum) state.pickerSelection.add(key);
  renderPickerOptions();
});
els.applyPicker.addEventListener("click", applyPicker);
els.optimize.addEventListener("click", runOptimizer);
els.viewControls.forEach((button) => button.addEventListener("click", () => {
  state.lineupView = button.dataset.lineupView;
  renderLineupTable();
}));
els.saveTeam.addEventListener("change", () => {
  if (els.saveTeam.checked) {
    saveTeam();
    return;
  }
  window.localStorage.removeItem(TEAM_STORAGE_KEY);
  els.stageCopy.textContent = "Team saving is off for this browser.";
});
[els.budget, els.transfers, els.strategy, ...els.chips].forEach((input) => input.addEventListener("change", () => {
  if (input.matches(".chip-settings input")) renderChipCount();
  persistTeamIfEnabled();
  renderRaceContext();
}));
els.auditSelect.addEventListener("change", () => {
  renderAudit();
  if (els.auditDialog.open) renderAuditDialog();
});
els.openAudit.addEventListener("click", renderAuditDialog);
els.acceptAnalytics.addEventListener("click", () => {
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
  els.cookieBanner.hidden = true;
  loadAnalytics();
});
els.declineAnalytics.addEventListener("click", () => {
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, "declined");
  els.cookieBanner.hidden = true;
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.source !== OPTIMIZER_MESSAGE_SOURCE) return;
  if (event.data.type === "ready") {
    state.engineReady = true;
    els.optimize.disabled = false;
    els.optimize.innerHTML = "Optimize Team <span>→</span>";
    return;
  }
  if (event.data.type === "result" && state.optimizationRequest?.requestId === event.data.requestId) {
    const request = state.optimizationRequest;
    state.optimizationRequest = null;
    window.clearTimeout(request.timeout);
    request.resolve(event.data);
    return;
  }
  if (event.data.type === "error") {
    if (state.optimizationRequest?.requestId === event.data.requestId) {
      const request = state.optimizationRequest;
      state.optimizationRequest = null;
      window.clearTimeout(request.timeout);
      request.reject(new Error(event.data.message));
      return;
    }
    state.engineReady = false;
    els.optimize.disabled = false;
    els.optimize.innerHTML = "Retry optimizer <span>→</span>";
    els.stageCopy.textContent = "The optimizer could not start. Retry to continue.";
  }
});
prepareOptimizerEngine();
initialiseAnalyticsConsent();

initialise().catch((error) => {
  els.stageCopy.textContent = error.message;
});
