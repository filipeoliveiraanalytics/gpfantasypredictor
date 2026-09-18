const DATA_ROOT = "data";
const TEAM_STORAGE_KEY = "gp-fantasy-notebook-team-v1";
const ANALYTICS_CONSENT_KEY = "gp_fantasy_predictor_analytics_consent";
const SITE_VISIT_KEY = "gp_fantasy_predictor_visited_v1";
const SITE_RATING_KEY = "gp_fantasy_predictor_site_rating_v1";
const SITE_RATING_DISMISSED_KEY = "gp_fantasy_predictor_site_rating_dismissed_v1";

const teamColors = {
  Mercedes: "#20a69b", McLaren: "#ee781d", Ferrari: "#d52d36", "Red Bull Racing": "#20386f",
  "Racing Bulls": "#224caa", Williams: "#3277cc", Audi: "#b8b7b4", Cadillac: "#77716d",
  Alpine: "#e56f8f", "Aston Martin": "#007768", "Haas F1 Team": "#9d9d9d",
};

const state = {
  projections: [], audits: [], auditRows: [],
  dataReady: false,
  currentDrivers: [],
  currentConstructors: [],
  pickerType: "driver", pickerSelection: new Set(),
  recommendedRows: [], recommendation: null, lineupView: "recommended",
  ratingEligible: false, ratingTimer: null, selectedSiteRating: null,
};

const els = {
  budget: document.querySelector("#budget-input"),
  transfers: document.querySelector("#transfers-input"),
  budgetWarning: document.querySelector("#budget-warning"),
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
  cookieBanner: document.querySelector("#cookie-banner"),
  analyticsPreference: document.querySelector("#analytics-preference"),
  confirmAnalytics: document.querySelector("#confirm-analytics"),
  ratingPrompt: document.querySelector("#rating-prompt"),
  closeRatingPrompt: document.querySelector("#close-rating-prompt"),
  ratingButtons: [...document.querySelectorAll("[data-site-rating]")],
  ratingFeedback: document.querySelector("#site-rating-feedback"),
  submitSiteRating: document.querySelector("#submit-site-rating"),
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

function trackEvent(name, parameters = {}) {
  if (!window.gtag) return;
  window.gtag("event", name, parameters);
}

function budgetRange(value) {
  const budget = number(value);
  if (budget < 75) return "under_75m";
  if (budget < 100) return "75_to_99m";
  if (budget < 115) return "100_to_114m";
  return "115m_plus";
}

function initialiseAnalyticsConsent() {
  const consent = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (consent === "accepted") {
    loadAnalytics();
  } else if (consent !== "declined") {
    els.cookieBanner.hidden = false;
    document.body.classList.add("has-cookie-dialog");
  }
}

function confirmAnalyticsConsent() {
  const accepted = els.analyticsPreference.checked;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, accepted ? "accepted" : "declined");
  els.cookieBanner.hidden = true;
  document.body.classList.remove("has-cookie-dialog");
  if (accepted) {
    loadAnalytics();
    trackEvent("analytics_consent", { choice: "accepted" });
    scheduleRatingPrompt();
  }
}

function initialiseRatingPrompt() {
  const returningVisitor = window.localStorage.getItem(SITE_VISIT_KEY) === "true"
    || window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
  const alreadyResponded = window.localStorage.getItem(SITE_RATING_KEY)
    || window.localStorage.getItem(SITE_RATING_DISMISSED_KEY);
  window.localStorage.setItem(SITE_VISIT_KEY, "true");
  state.ratingEligible = returningVisitor && !alreadyResponded;
  scheduleRatingPrompt();
}

function scheduleRatingPrompt() {
  if (!state.dataReady || !state.ratingEligible || window.localStorage.getItem(ANALYTICS_CONSENT_KEY) !== "accepted") return;
  if (state.ratingTimer || !els.ratingPrompt.hidden) return;
  state.ratingTimer = window.setTimeout(() => {
    state.ratingTimer = null;
    if (!els.pickerDialog.open && !els.auditDialog.open && els.cookieBanner.hidden) {
      els.ratingPrompt.hidden = false;
      trackEvent("site_rating_prompted");
    }
  }, 4500);
}

function dismissRatingPrompt() {
  if (state.ratingTimer) window.clearTimeout(state.ratingTimer);
  state.ratingTimer = null;
  state.ratingEligible = false;
  els.ratingPrompt.hidden = true;
  window.localStorage.setItem(SITE_RATING_DISMISSED_KEY, "true");
  trackEvent("site_rating_dismissed");
}

function selectSiteRating(rating) {
  state.selectedSiteRating = rating;
  els.ratingButtons.forEach((button) => {
    const selected = Number(button.dataset.siteRating) === rating;
    button.setAttribute("aria-pressed", String(selected));
  });
  els.submitSiteRating.disabled = false;
}

function submitSiteRating() {
  const rating = state.selectedSiteRating;
  if (!rating) return;
  if (state.ratingTimer) window.clearTimeout(state.ratingTimer);
  state.ratingTimer = null;
  state.ratingEligible = false;
  els.ratingPrompt.hidden = true;
  window.localStorage.setItem(SITE_RATING_KEY, String(rating));
  trackEvent("site_rating_submitted", { rating });
  const feedback = els.ratingFeedback.value.trim();
  if (feedback) {
    trackEvent("site_feedback_email_opened", { rating });
    const subject = "GP Fantasy Predictor feedback";
    const body = `Rating: ${rating}/5\n\nFeedback:\n${feedback}`;
    window.location.href = `mailto:filipe@filipeoliveiraanalytics.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

function hasCompleteTeam() {
  return state.currentDrivers.length === 5 && state.currentConstructors.length === 2;
}

function updateBudgetWarning() {
  if (!els.budgetWarning) return;
  const budget = number(els.budget.value);
  const rows = [...selectedRows("driver"), ...selectedRows("constructor")];
  if (!hasCompleteTeam() || rows.length !== 7 || budget <= 0) {
    els.budgetWarning.hidden = true;
    els.budgetWarning.textContent = "";
    return;
  }

  const cost = rows.reduce((total, row) => total + number(row.price_m), 0);
  const overBudget = cost - budget;
  if (overBudget <= 0.01) {
    els.budgetWarning.hidden = true;
    els.budgetWarning.textContent = "";
    return;
  }

  els.budgetWarning.hidden = false;
  els.budgetWarning.textContent = `Current team costs $${format(cost)}m, $${format(overBudget)}m over budget.`;
}

function swatch(row) {
  return `<i style="background:${teamColors[row.team] || "#555"}"></i>`;
}

function priceGuidance(row) {
  const projected = number(row.expected_fantasy_points, Number.NaN);
  const goodThreshold = number(row.price_points_needed_good, Number.NaN);
  const greatThreshold = number(row.price_points_needed_great, Number.NaN);
  const priceChange = number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m));
  if (![projected, goodThreshold, greatThreshold].every(Number.isFinite)) {
    return "Price guidance will be available with the next model update.";
  }

  if (projected < goodThreshold) {
    return `Needs ${Math.ceil(goodThreshold - projected)} more projected pts to move out of a price-fall path.`;
  }
  if (projected < greatThreshold) {
    const change = priceChange > 0 ? `+$${format(priceChange)}m` : "a positive";
    return `On ${change} price path. Needs ${Math.ceil(greatThreshold - projected)} more projected pts for the top rise tier.`;
  }
  const change = priceChange > 0 ? `+$${format(priceChange)}m` : "positive";
  return `On a ${change} price path with a ${Math.floor(projected - greatThreshold)}-pt cushion above the top rise tier.`;
}

function renderCurrentTeam() {
  const renderList = (type) => {
    const rows = selectedRows(type);
    if (!rows.length) {
      const count = type === "driver" ? "5 drivers" : "2 constructors";
      return `<li class="team-empty">Choose ${count}</li>`;
    }
    return rows
      .map((row) => {
        const guidance = priceGuidance(row);
        return `<li class="has-price-guidance" role="button" tabindex="0" aria-expanded="false" data-price-guidance="${escapeHtml(guidance)}" aria-label="${escapeHtml(`${row.name}. ${guidance}`)}">${swatch(row)}<span>${escapeHtml(row.name)}${type === "driver" ? `<small>${escapeHtml(row.team)}</small>` : ""}</span><b>$${format(row.price_m)}m</b></li>`;
      })
      .join("");
  };
  els.drivers.innerHTML = renderList("driver");
  els.constructors.innerHTML = renderList("constructor");
  updateBudgetWarning();
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
  trackEvent("team_picker_opened", { asset_type: type });
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
  trackEvent("team_selection_applied", { asset_type: state.pickerType, selection_size: maximum });
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
  const transferDetail = limitless
    ? "Limitless removes transfer penalties"
    : result.paidTransfers ? `${result.paidTransfers} paid` : "Free moves cover it";
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

function combinations(items, size) {
  const result = [];
  const selected = [];
  const visit = (start) => {
    if (selected.length === size) {
      result.push([...selected]);
      return;
    }
    for (let index = start; index <= items.length - (size - selected.length); index += 1) {
      selected.push(items[index]);
      visit(index + 1);
      selected.pop();
    }
  };
  visit(0);
  return result;
}

function optimizerAssetScore(row) {
  const points = number(row.expected_fantasy_points);
  const value = number(row.value_per_million);
  const pricePath = number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m));
  return points + value * 3 + pricePath * 4;
}

function optimizerDriverPool() {
  const drivers = rowsFor("driver");
  const current = selectedRows("driver");
  const cheapest = [...drivers].sort((left, right) => number(left.price_m) - number(right.price_m)).slice(0, 5);
  const strongest = [...drivers].sort((left, right) => optimizerAssetScore(right) - optimizerAssetScore(left)).slice(0, 9);
  return [...new Map([...current, ...cheapest, ...strongest].map((row) => [row.key, row])).values()];
}

function scoreLineup(drivers, constructors, { ignoreBudget = false, unlimitedTransfers = false } = {}) {
  const rows = [...drivers, ...constructors];
  const cost = rows.reduce((total, row) => total + number(row.price_m), 0);
  const budget = number(els.budget.value);
  if (!ignoreBudget && cost > budget + 0.001) return null;

  const current = new Set([...state.currentDrivers, ...state.currentConstructors]);
  const incoming = rows.filter((row) => !current.has(row.key));
  const transferCount = incoming.length;
  const freeTransfers = Math.max(0, Math.floor(number(els.transfers.value)));
  const paidTransfers = unlimitedTransfers ? 0 : Math.max(0, transferCount - freeTransfers);
  const expected = rows.reduce((total, row) => total + number(row.expected_fantasy_points), 0);
  const boost = [...drivers].sort((left, right) => number(right.expected_fantasy_points) - number(left.expected_fantasy_points))[0];
  const netPoints = expected + number(boost?.expected_fantasy_points) - paidTransfers * 10;
  const pricePath = rows.reduce((total, row) => total + number(row.risk_adjusted_price_delta_m, number(row.projected_price_delta_m)), 0);
  const strategy = els.strategy.value;
  const strategyScore = strategy === "budget_growth"
    ? netPoints + pricePath * 14
    : strategy === "current_friendly"
      ? netPoints - transferCount * 1.5
      : netPoints;
  return { rows, cost, incoming, transferCount, paidTransfers, boost, netPoints, strategyScore };
}

function findBestLineup(options = {}) {
  const currentFriendly = els.strategy.value === "current_friendly" && !options.unlimitedTransfers && !options.allowPaidTransfers;
  const freeTransfers = Math.max(0, Math.floor(number(els.transfers.value)));
  let best = null;
  const driverCombos = combinations(optimizerDriverPool(), 5);
  const constructorCombos = combinations(rowsFor("constructor"), 2);

  driverCombos.forEach((drivers) => {
    constructorCombos.forEach((constructors) => {
      const lineup = scoreLineup(drivers, constructors, options);
      if (!lineup || (currentFriendly && lineup.transferCount > freeTransfers)) return;
      if (!best || lineup.strategyScore > best.strategyScore) best = lineup;
    });
  });
  return best;
}

function directRecommendation() {
  let base = findBestLineup();
  if (!base && els.strategy.value === "current_friendly") {
    base = findBestLineup({ allowPaidTransfers: true });
  }
  if (!base) throw new Error("No valid lineup fits the current budget. Edit your team or budget and try again.");
  return { ...base, chip: "" };
}

function runOptimizer() {
  if (!hasCompleteTeam()) {
    els.stageCopy.textContent = "Choose 5 drivers and 2 constructors before optimizing.";
    trackEvent("optimizer_validation_failed", { reason: "incomplete_team" });
    return;
  }
  if (number(els.budget.value) <= 0 || els.transfers.value === "") {
    els.stageCopy.textContent = "Enter your budget and free transfers before optimizing.";
    trackEvent("optimizer_validation_failed", { reason: "missing_team_settings" });
    return;
  }
  els.optimize.disabled = true;
  els.optimize.innerHTML = "Optimizing <span>...</span>";
  els.stageCopy.textContent = "Calculating with the live Pre-Weekend model.";
  trackEvent("optimizer_run", {
    strategy: els.strategy.value,
    budget_range: budgetRange(els.budget.value),
    free_transfers: Math.max(0, Math.floor(number(els.transfers.value))),
    available_chip_count: els.chips.filter((chip) => chip.checked).length,
  });

  window.setTimeout(() => {
    try {
      const result = directRecommendation();
      renderRecommendation(result.rows, {
        points: `${format(result.netPoints)} pts`,
        paidTransfers: result.paidTransfers,
        boost: result.boost,
        chip: result.chip,
      });
      els.stageCopy.textContent = "Pre-weekend recommendation updated from the live optimizer.";
      trackEvent("optimizer_result", {
        strategy: els.strategy.value,
        transfer_count: result.transferCount,
        paid_transfers: result.paidTransfers,
        recommended_chip: result.chip || "hold",
      });
    } catch (error) {
      els.stageCopy.textContent = error.message;
      trackEvent("optimizer_error", { reason: "no_valid_lineup" });
    } finally {
      els.optimize.disabled = false;
      els.optimize.innerHTML = "Optimize Team <span>→</span>";
    }
  }, 0);
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
      const teamDetail = type === "driver" && row.team ? `<small>${escapeHtml(row.team)}</small>` : "";
      return `<tr><td><strong>${escapeHtml(row.name)}</strong>${teamDetail}</td><td>${format(row.estimated_points)}</td><td>${format(row.actual_points)}</td><td class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${format(delta)}</td></tr>`;
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
  state.dataReady = true;
  initialiseRatingPrompt();
  els.optimize.disabled = false;
  els.optimize.innerHTML = "Optimize Team <span>→</span>";
  els.lineupHeading.textContent = "Recommended Lineup";
  els.stageCopy.textContent = restoredTeam
    ? "Saved team restored. Run the optimizer to refresh the recommendation."
    : `Live ${sample.mode} model loaded. Enter your team details to build a recommendation.`;
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
  trackEvent("lineup_view_changed", { view: state.lineupView });
}));
els.saveTeam.addEventListener("change", () => {
  if (els.saveTeam.checked) {
    if (!hasCompleteTeam() || number(els.budget.value) <= 0 || els.transfers.value === "") {
      els.saveTeam.checked = false;
      els.stageCopy.textContent = "Enter your budget, transfers, and full team before saving.";
      trackEvent("team_save_blocked", { reason: "incomplete_setup" });
      return;
    }
    saveTeam();
    trackEvent("team_save_changed", { enabled: true });
    return;
  }
  window.localStorage.removeItem(TEAM_STORAGE_KEY);
  els.stageCopy.textContent = "Team saving is off for this browser.";
  trackEvent("team_save_changed", { enabled: false });
});
[els.budget, els.transfers, els.strategy, ...els.chips].forEach((input) => input.addEventListener("change", () => {
  if (input.matches(".chip-settings input")) {
    renderChipCount();
    trackEvent("chip_availability_changed", { chip: input.value, enabled: input.checked });
  }
  if (input === els.strategy) trackEvent("strategy_changed", { strategy: els.strategy.value });
  if (input === els.budget) trackEvent("budget_changed", { budget_range: budgetRange(els.budget.value) });
  if (input === els.transfers) trackEvent("transfers_changed", { free_transfers: Math.max(0, Math.floor(number(els.transfers.value))) });
  updateBudgetWarning();
  persistTeamIfEnabled();
  renderRaceContext();
}));
els.auditSelect.addEventListener("change", () => {
  renderAudit();
  if (els.auditDialog.open) renderAuditDialog();
  const audit = activeAudit();
  trackEvent("audit_selection_changed", { grand_prix: audit?.gp_key || "", stage: audit?.mode || "" });
});
els.openAudit.addEventListener("click", () => {
  renderAuditDialog();
  const audit = activeAudit();
  trackEvent("audit_opened", { grand_prix: audit?.gp_key || "", stage: audit?.mode || "" });
});
els.confirmAnalytics.addEventListener("click", confirmAnalyticsConsent);
els.closeRatingPrompt.addEventListener("click", dismissRatingPrompt);
els.ratingButtons.forEach((button) => button.addEventListener("click", () => selectSiteRating(Number(button.dataset.siteRating))));
els.submitSiteRating.addEventListener("click", submitSiteRating);
[els.drivers, els.constructors].forEach((list) => {
  const toggleGuidance = (event) => {
    const row = event.target.closest(".has-price-guidance");
    if (!row) return;
    const shown = row.classList.toggle("show-price-guidance");
    row.setAttribute("aria-expanded", String(shown));
  };
  list.addEventListener("click", toggleGuidance);
  list.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleGuidance(event);
  });
});
document.querySelectorAll("[data-analytics-link]").forEach((link) => link.addEventListener("click", () => {
  trackEvent("outbound_link_clicked", { destination: link.dataset.analyticsLink });
}));

initialiseAnalyticsConsent();

initialise().catch((error) => {
  els.stageCopy.textContent = error.message;
});
