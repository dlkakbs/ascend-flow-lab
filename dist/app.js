const MODEL = Object.freeze({
  tradingFee: 0.01,
  recipients: {
    deployer: { rate: 0.25, label: "Default deployer", payoutLabel: "Deployer payout" },
    approved: { rate: 0.5, label: "Approved creator / takeover", payoutLabel: "Approved recipient payout" },
  },
  periods: {
    day: { multiplier: 1, label: "daily", code: "/ DAY" },
    month: { multiplier: 30, label: "30-day", code: "/ 30D" },
    year: { multiplier: 365, label: "annual", code: "/ 365D" },
  },
});

const state = {
  dailyVolume: 1_000_000,
  recipient: "deployer",
  period: "day",
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const volumeInput = $("#volumeInput");
const volumeRange = $("#volumeRange");
const copyStatus = $("#copyStatus");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value, compact = false) {
  const safe = Number.isFinite(value) ? value : 0;
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: safe >= 1_000_000 ? 2 : 1,
    }).format(safe);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: safe < 100 ? 2 : 0,
  }).format(safe);
}

function calculate(recipientKey = state.recipient) {
  const period = MODEL.periods[state.period];
  const recipientConfig = MODEL.recipients[recipientKey];
  const volume = state.dailyVolume * period.multiplier;
  const grossFee = volume * MODEL.tradingFee;
  const recipient = grossFee * recipientConfig.rate;
  const net = grossFee - recipient;
  const hype = net * 0.5;
  const kntq = net * 0.5;

  return {
    volume,
    grossFee,
    recipient,
    recipientRate: recipientConfig.rate,
    net,
    hype,
    kntq,
    hypeStaking: hype * 0.4,
    hypeEcosystem: hype * 0.3,
    hypeTreasury: hype * 0.2,
    hypeRewards: hype * 0.1,
    kntqBurn: kntq * 0.6,
    kntqLiquidity: kntq * 0.2,
    kntqPoints: kntq * 0.2,
  };
}

function setText(selector, value) {
  $$(selector).forEach((element) => {
    if (element.textContent !== value) {
      element.textContent = value;
      element.classList.remove("flash");
      void element.offsetWidth;
      element.classList.add("flash");
    }
  });
}

function updateUrl() {
  const params = new URLSearchParams();
  params.set("v", String(Math.round(state.dailyVolume)));
  params.set("role", state.recipient);
  params.set("period", state.period);
  history.replaceState(null, "", `${location.pathname}?${params.toString()}${location.hash}`);
}

function buildFlowTable(values) {
  const rows = [
    ["Token trading fees", "1% of modeled token volume", values.grossFee],
    [MODEL.recipients[state.recipient].payoutLabel, `${values.recipientRate * 100}% of trading fees`, values.recipient],
    ["Protocol-owned HYPE staking", "40% of purchased HYPE", values.hypeStaking],
    ["Ecosystem-token buybacks", "30% of purchased HYPE", values.hypeEcosystem],
    ["Treasury & operations", "20% of purchased HYPE", values.hypeTreasury],
    ["Direct staker rewards", "10% of purchased HYPE", values.hypeRewards],
    ["KNTQ burn", "60% of purchased KNTQ", values.kntqBurn],
    ["KNTQ / kHYPE liquidity", "20% of purchased KNTQ", values.kntqLiquidity],
    ["Ascend points program", "20% of purchased KNTQ", values.kntqPoints],
  ];

  $("#flowTableBody").innerHTML = rows
    .map(([destination, basis, value]) => `<tr><td>${destination}</td><td>${basis}</td><td>${formatMoney(value)}</td></tr>`)
    .join("");
}

function render() {
  const values = calculate();
  const defaultValues = calculate("deployer");
  const approvedValues = calculate("approved");
  const recipientConfig = MODEL.recipients[state.recipient];
  const periodConfig = MODEL.periods[state.period];

  Object.entries(values).forEach(([key, value]) => {
    if (key === "recipientRate") {
      setText(`[data-value="${key}"]`, `${value * 100}%`);
    } else {
      setText(`[data-value="${key}"]`, formatMoney(value));
    }
  });

  $("#recipientLabel").textContent = recipientConfig.payoutLabel;
  $("#recipientMeter").style.width = `${recipientConfig.rate * 100}%`;
  $("#netMeter").style.width = `${(1 - recipientConfig.rate) * 100}%`;
  $("#scenarioTitle").textContent = `${recipientConfig.label} · ${periodConfig.label} view`;
  $("#periodCode").textContent = periodConfig.code;
  $("#runId").textContent = `${state.recipient === "deployer" ? "D" : "A"}${periodConfig.multiplier}-${Math.round(state.dailyVolume / 1000)}`;

  const comparison = {
    defaultRecipient: defaultValues.recipient,
    defaultHype: defaultValues.hype,
    defaultKntq: defaultValues.kntq,
    approvedRecipient: approvedValues.recipient,
    approvedHype: approvedValues.hype,
    approvedKntq: approvedValues.kntq,
  };
  Object.entries(comparison).forEach(([key, value]) => setText(`[data-compare="${key}"]`, formatMoney(value)));

  setText('[data-card="volume"]', formatMoney(values.volume, true));
  setText('[data-card="recipient"]', formatMoney(values.recipient, true));
  setText('[data-card="hype"]', formatMoney(values.hype, true));
  setText('[data-card="kntq"]', formatMoney(values.kntq, true));
  $("#cardScenario").textContent = `${recipientConfig.label.toUpperCase()} · ${recipientConfig.rate * 100}%`;
  $("#cardPeriod").textContent = `${periodConfig.label.toUpperCase()} MODEL`;

  volumeInput.value = String(Math.round(state.dailyVolume));
  volumeRange.value = String(clamp(state.dailyVolume, Number(volumeRange.min), Number(volumeRange.max)));
  $$('[data-volume]').forEach((button) => button.classList.toggle("active", Number(button.dataset.volume) === state.dailyVolume));
  buildFlowTable(values);
  updateUrl();
}

function updateVolume(rawValue) {
  const value = clamp(Number(rawValue) || 0, 0, 1_000_000_000);
  state.dailyVolume = value;
  render();
}

volumeInput.addEventListener("input", (event) => updateVolume(event.target.value));
volumeRange.addEventListener("input", (event) => updateVolume(event.target.value));

$$('[data-volume]').forEach((button) => {
  button.addEventListener("click", () => updateVolume(button.dataset.volume));
});

$$('input[name="recipient"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    state.recipient = event.target.value;
    render();
  });
});

$$('input[name="period"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    state.period = event.target.value;
    render();
  });
});

$("#resetButton").addEventListener("click", () => {
  state.dailyVolume = 1_000_000;
  state.recipient = "deployer";
  state.period = "day";
  $('input[name="recipient"][value="deployer"]').checked = true;
  $('input[name="period"][value="day"]').checked = true;
  render();
});

function snapshotText() {
  const values = calculate();
  const recipient = MODEL.recipients[state.recipient];
  const period = MODEL.periods[state.period];
  return [
    `Ascend Flow Lab — ${period.label} model`,
    `Token volume: ${formatMoney(values.volume)}`,
    `Trading fees (1%): ${formatMoney(values.grossFee)}`,
    `${recipient.label} (${recipient.rate * 100}% of fees): ${formatMoney(values.recipient)}`,
    `HYPE purchases: ${formatMoney(values.hype)}`,
    `KNTQ purchases: ${formatMoney(values.kntq)}`,
    `KNTQ burn allocation: ${formatMoney(values.kntqBurn)}`,
    `Direct HYPE staker reward pool: ${formatMoney(values.hypeRewards)}`,
    "Unofficial illustration of Ascend's proposed model. Not a forecast.",
    "Source: https://ascendlaunch.gitbook.io/docs/revenue-and-capital-allocation",
  ].join("\n");
}

$("#copySnapshot").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(snapshotText());
    copyStatus.textContent = "Snapshot copied to clipboard.";
  } catch {
    copyStatus.textContent = "Clipboard access was unavailable. Select and copy the model manually.";
  }
  window.setTimeout(() => { copyStatus.textContent = ""; }, 3500);
});

function drawShareCard() {
  const canvas = $("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const values = calculate();
  const recipient = MODEL.recipients[state.recipient];
  const period = MODEL.periods[state.period];
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#efede5";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(18,18,16,.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y <= height; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  ctx.fillStyle = "#121210";
  ctx.fillRect(0, 0, 24, height);
  ctx.fillStyle = "#f05a2b";
  ctx.fillRect(24, 0, 8, height);

  ctx.fillStyle = "#121210";
  ctx.font = "700 22px Arial";
  ctx.fillText("ASCEND FLOW LAB", 72, 72);
  ctx.textAlign = "right";
  ctx.font = "700 17px monospace";
  ctx.fillText(`${period.label.toUpperCase()} MODEL · UNOFFICIAL`, width - 72, 72);
  ctx.textAlign = "left";

  ctx.font = "44px Georgia";
  ctx.fillText("Every", 72, 172);
  ctx.fillStyle = "#2354d8";
  ctx.font = "italic 74px Georgia";
  ctx.fillText(formatMoney(values.volume, true), 188, 174);
  ctx.fillStyle = "#121210";
  ctx.font = "44px Georgia";
  ctx.fillText("in token volume routes:", 72, 232);

  const boxes = [
    { x: 72, label: "RECIPIENT", value: values.recipient, color: "#f05a2b" },
    { x: 442, label: "HYPE PURCHASES", value: values.hype, color: "#2354d8" },
    { x: 812, label: "KNTQ PURCHASES", value: values.kntq, color: "#121210" },
  ];
  boxes.forEach((box) => {
    ctx.strokeStyle = "#121210";
    ctx.strokeRect(box.x, 292, 316, 160);
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, 292, 316, 12);
    ctx.fillStyle = "#67645d";
    ctx.font = "700 15px monospace";
    ctx.fillText(box.label, box.x + 20, 346);
    ctx.fillStyle = "#121210";
    ctx.font = "700 44px monospace";
    ctx.fillText(formatMoney(box.value, true), box.x + 20, 414);
  });

  ctx.fillStyle = "#121210";
  ctx.font = "700 16px monospace";
  ctx.fillText(`${recipient.label.toUpperCase()} · ${recipient.rate * 100}% RECIPIENT SHARE`, 72, 520);
  ctx.fillStyle = "#67645d";
  ctx.font = "15px Arial";
  ctx.fillText("Proposed model · illustrative USD equivalents · ascendlaunch.gitbook.io/docs", 72, 566);
  ctx.fillStyle = "#d6ff43";
  ctx.fillRect(width - 210, height - 82, 138, 34);
  ctx.fillStyle = "#121210";
  ctx.font = "700 14px monospace";
  ctx.fillText("FOLLOW THE FEE", width - 195, height - 60);

  return canvas;
}

$("#downloadCard").addEventListener("click", () => {
  const canvas = drawShareCard();
  const link = document.createElement("a");
  link.download = `ascend-flow-${state.recipient}-${state.period}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  copyStatus.textContent = "X card downloaded.";
  window.setTimeout(() => { copyStatus.textContent = ""; }, 3000);
});

async function refreshNetworkPulse() {
  const dot = $("#networkDot");
  const status = $("#blockStatus");
  try {
    const response = await fetch("https://testnet-rpc.elysium.kinetiq.xyz", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 },
        { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 2 },
      ]),
    });
    if (!response.ok) throw new Error("RPC response failed");
    const payload = await response.json();
    const chain = payload.find((item) => item.id === 1)?.result;
    const block = payload.find((item) => item.id === 2)?.result;
    if (Number.parseInt(chain, 16) !== 99801 || !block) throw new Error("Unexpected chain");
    dot.classList.add("live");
    status.textContent = `Block ${Number.parseInt(block, 16).toLocaleString("en-US")} · live`;
  } catch {
    dot.classList.remove("live");
    status.textContent = "Public RPC unavailable";
  }
}

function hydrateFromUrl() {
  const params = new URLSearchParams(location.search);
  const hasVolume = params.has("v");
  const volume = hasVolume ? Number(params.get("v")) : Number.NaN;
  const recipient = params.get("role");
  const period = params.get("period");

  if (Number.isFinite(volume) && volume >= 0) state.dailyVolume = clamp(volume, 0, 1_000_000_000);
  if (recipient in MODEL.recipients) state.recipient = recipient;
  if (period in MODEL.periods) state.period = period;

  $(`input[name="recipient"][value="${state.recipient}"]`).checked = true;
  $(`input[name="period"][value="${state.period}"]`).checked = true;
}

hydrateFromUrl();
render();
refreshNetworkPulse();
window.setInterval(refreshNetworkPulse, 20_000);
