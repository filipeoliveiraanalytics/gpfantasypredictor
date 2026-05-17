const DATA_PATH = "data/fantasy_projections.csv";

const state = {
  projections: [],
  drivers: [],
  constructors: [],
};

const els = {
  form: document.querySelector("#optimizer-form"),
  status: document.querySelector("#data-status"),
  budget: document.querySelector("#budget"),
  freeTransfers: document.querySelector("#free-transfers"),
  drivers: document.querySelector("#drivers"),
  constructors: document.querySelector("#constructors"),
  strategy: document.querySelector("#strategy"),
  netPoints: document.querySelector("#net-points"),
  teamCost: document.querySelector("#team-cost"),
  boostDriver: document.querySelector("#boost-driver"),
  driverList: document.querySelector("#driver-list"),
  constructorList: document.querySelector("#constructor-list"),
  transfersIn: document.querySelector("#transfers-in"),
  transfersOut: document.querySelector("#transfers-out"),
  transferPenalty: document.querySelector("#transfer-penalty"),
  alternatives: document.querySelector("#alternatives"),
};

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
  if (strategy === "safe") return team.netExpectedPoints - 0.15 * team.avgRiskScore;
  if (strategy === "value") return 0.7 * team.netExpectedPoints + 12 * team.valuePerMillion;
  if (strategy === "current_friendly") return team.netExpectedPoints - 1.25 * team.transferCount;
  return team.netExpectedPoints;
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
  const netExpectedPoints = expectedPoints + transferPenalty;
  const bestBoost = [...driverCombo].sort((a, b) => toNumber(b.expected_fantasy_points) - toNumber(a.expected_fantasy_points))[0];

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
  render(teams.slice(0, 10));
}

function chip(row) {
  return `<span class="chip"><strong>${row.key}</strong> ${row.name}</span>`;
}

function formatNumber(value, decimals = 1) {
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function render(teams) {
  const best = teams[0];
  if (!best) {
    els.status.textContent = "No valid team found for this budget.";
    return;
  }

  els.status.textContent = `${best.drivers[0]?.next_gp ?? "Next GP"} | ${best.drivers[0]?.mode ?? "Projection"}`;
  els.netPoints.textContent = formatNumber(best.netExpectedPoints, 1);
  els.teamCost.textContent = `${formatNumber(best.totalCost, 1)}M`;
  els.boostDriver.textContent = best.bestBoost.key;
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
}

async function init() {
  const response = await fetch(DATA_PATH);
  if (!response.ok) throw new Error(`Could not load ${DATA_PATH}`);
  state.projections = parseCsv(await response.text());
  state.drivers = state.projections.filter((row) => row.entity_type === "driver");
  state.constructors = state.projections.filter((row) => row.entity_type === "constructor");
  els.status.textContent = "Model data loaded.";
  optimize();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  optimize();
});

init().catch((error) => {
  els.status.textContent = error.message;
});
