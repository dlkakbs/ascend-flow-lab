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
  address: "",
};

const RPC_URL = "https://testnet-rpc.elysium.kinetiq.xyz";
const EXPLORER_URL = "https://elysium.kinetiq.xyz/testnet-explorer";
const networkState = {
  block: null,
  gasGwei: null,
  latency: null,
  updatedAt: null,
  samples: [],
  addressSnapshot: null,
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
      maximumFractionDigits: 2,
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
  if (state.address) params.set("address", state.address);
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
    "Allocations are modeled from the 1% token trading fee, not from the full token volume.",
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

  ctx.fillStyle = "#f6e8ef";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(18,18,16,.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y <= height; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  ctx.fillStyle = "#0b0c10";
  ctx.fillRect(0, 0, 24, height);
  ctx.fillStyle = "#feaa8d";
  ctx.fillRect(24, 0, 8, height);

  ctx.fillStyle = "#0b0c10";
  ctx.font = "700 22px Arial";
  ctx.fillText("ASCEND FLOW LAB", 72, 72);
  ctx.textAlign = "right";
  ctx.font = "700 17px monospace";
  ctx.fillText(`${period.label.toUpperCase()} MODEL · UNOFFICIAL`, width - 72, 72);
  ctx.textAlign = "left";

  ctx.font = "38px Georgia";
  ctx.fillText("At a 1% trading fee,", 72, 166);
  const volumeText = formatMoney(values.volume, true);
  ctx.fillStyle = "#8b61d7";
  ctx.font = "italic 74px Georgia";
  ctx.fillText(volumeText, 72, 238);
  const volumeWidth = ctx.measureText(volumeText).width;
  ctx.fillStyle = "#0b0c10";
  ctx.font = "38px Georgia";
  ctx.fillText("in token volume produces:", 90 + volumeWidth, 232);

  const boxes = [
    { x: 72, label: "RECIPIENT", value: values.recipient, color: "#feaa8d" },
    { x: 442, label: "HYPE PURCHASES", value: values.hype, color: "#8b61d7" },
    { x: 812, label: "KNTQ PURCHASES", value: values.kntq, color: "#ee84b5" },
  ];
  boxes.forEach((box) => {
    ctx.strokeStyle = "#0b0c10";
    ctx.strokeRect(box.x, 292, 316, 160);
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, 292, 316, 12);
    ctx.fillStyle = "#6f5d68";
    ctx.font = "700 15px monospace";
    ctx.fillText(box.label, box.x + 20, 346);
    ctx.fillStyle = "#0b0c10";
    ctx.font = "700 44px monospace";
    ctx.fillText(formatMoney(box.value, true), box.x + 20, 414);
  });

  ctx.fillStyle = "#0b0c10";
  ctx.font = "700 16px monospace";
  ctx.fillText(`${recipient.label.toUpperCase()} · ${recipient.rate * 100}% RECIPIENT SHARE`, 72, 520);
  ctx.fillStyle = "#6f5d68";
  ctx.font = "15px Arial";
  ctx.fillText("Proposed model · illustrative USD equivalents · ascendlaunch.gitbook.io/docs", 72, 566);
  ctx.fillStyle = "#ee84b5";
  ctx.fillRect(width - 210, height - 82, 138, 34);
  ctx.fillStyle = "#0b0c10";
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

async function rpcBatch(calls) {
  const startedAt = performance.now();
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(calls.map((call, index) => ({
      jsonrpc: "2.0",
      method: call.method,
      params: call.params || [],
      id: index + 1,
    }))),
  });
  if (!response.ok) throw new Error(`RPC returned HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Unexpected RPC payload");
  const ordered = calls.map((_, index) => payload.find((item) => item.id === index + 1));
  if (ordered.some((item) => !item || item.error)) throw new Error("RPC method failed");
  return { results: ordered.map((item) => item.result), latency: Math.round(performance.now() - startedAt) };
}

function drawBlockTrace() {
  const samples = networkState.samples;
  const path = $("#blockTracePath");
  if (!samples.length) {
    path.setAttribute("d", "");
    return;
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = Math.max(max - min, 1);
  const points = samples.map((sample, index) => {
    const x = samples.length === 1 ? 360 : (index / (samples.length - 1)) * 720;
    const y = 84 - ((sample - min) / range) * 68;
    return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  if (samples.length === 1) points.push("L720 84");
  path.setAttribute("d", points.join(" "));
  $("#traceWindow").textContent = samples.length > 1
    ? `${samples.length} samples · +${(max - min).toLocaleString("en-US")} blocks`
    : "first sample captured";
}

function formatGwei(hexValue) {
  const wei = BigInt(hexValue || "0x0");
  const integer = wei / 1_000_000_000n;
  const decimal = ((wei % 1_000_000_000n) / 1_000_000n).toString().padStart(3, "0");
  return `${integer.toLocaleString("en-US")}.${decimal}`;
}

function formatHype(hexValue) {
  const wei = BigInt(hexValue || "0x0");
  const unit = 1_000_000_000_000_000_000n;
  const integer = wei / unit;
  const decimal = ((wei % unit) / 100_000_000_000_000n).toString().padStart(4, "0");
  return `${integer.toLocaleString("en-US")}.${decimal} HYPE`;
}

async function refreshNetworkPulse() {
  const dots = [$("#networkDot"), $("#consoleNetworkDot")];
  const refreshButton = $("#refreshNetwork");
  refreshButton.disabled = true;
  try {
    const { results, latency } = await rpcBatch([
      { method: "eth_chainId" },
      { method: "eth_blockNumber" },
      { method: "eth_gasPrice" },
      { method: "eth_getBlockByNumber", params: ["latest", false] },
    ]);
    const [chainHex, blockHex, gasHex, latestBlock] = results;
    const chainId = Number.parseInt(chainHex, 16);
    const block = Number.parseInt(blockHex, 16);
    if (chainId !== 99801 || !Number.isFinite(block)) throw new Error("Unexpected chain identity");

    networkState.block = block;
    networkState.gasGwei = formatGwei(gasHex);
    networkState.latency = latency;
    networkState.updatedAt = new Date();
    networkState.samples.push(block);
    networkState.samples = networkState.samples.slice(-28);

    dots.forEach((dot) => dot.classList.add("live"));
    $("#blockStatus").textContent = `Block ${block.toLocaleString("en-US")} · live`;
    $("#gasStatus").textContent = `Gas ${networkState.gasGwei} gwei`;
    $("#consoleNetworkState").textContent = "Verified Elysium handshake";
    $("#latestBlock").textContent = `#${block.toLocaleString("en-US")}`;
    $("#rpcLatency").textContent = `${latency} ms`;
    $("#gasPrice").textContent = networkState.gasGwei;
    $("#blockTransactions").textContent = String(latestBlock?.transactions?.length ?? 0);
    drawBlockTrace();
  } catch (error) {
    dots.forEach((dot) => dot.classList.remove("live"));
    $("#blockStatus").textContent = "Public RPC unavailable";
    $("#gasStatus").textContent = "Gas —";
    $("#consoleNetworkState").textContent = "Handshake unavailable";
    $("#rpcLatency").textContent = "—";
  } finally {
    refreshButton.disabled = false;
  }
}

function classifyAddress(code, balanceHex, nonceHex) {
  const hasCode = typeof code === "string" && !/^0x0*$/i.test(code);
  const balance = BigInt(balanceHex || "0x0");
  const nonce = Number.parseInt(nonceHex || "0x0", 16);
  if (hasCode) return { verdict: "Contract bytecode found", mark: "✓", tone: "contract" };
  if (balance > 0n || nonce > 0) return { verdict: "Active account · no code", mark: "↗", tone: "wallet" };
  return { verdict: "No deployed code found", mark: "—", tone: "empty" };
}

async function inspectAddress(rawAddress) {
  const address = rawAddress.trim();
  const status = $("#probeStatus");
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    status.textContent = "Enter a complete 42-character EVM address.";
    $("#addressInput").setAttribute("aria-invalid", "true");
    return;
  }

  $("#addressInput").removeAttribute("aria-invalid");
  status.textContent = "Reading Elysium testnet…";
  try {
    const { results: blockResults } = await rpcBatch([{ method: "eth_blockNumber" }]);
    const blockHex = blockResults[0];
    const observedBlock = Number.parseInt(blockHex, 16);
    if (!Number.isFinite(observedBlock)) throw new Error("Invalid block number");

    const { results } = await rpcBatch([
      { method: "eth_getCode", params: [address, blockHex] },
      { method: "eth_getBalance", params: [address, blockHex] },
      { method: "eth_getTransactionCount", params: [address, blockHex] },
    ]);
    const [code, balanceHex, nonceHex] = results;
    const classification = classifyAddress(code, balanceHex, nonceHex);
    const byteCount = Math.max(0, (code.length - 2) / 2);
    const balance = formatHype(balanceHex);
    const nonce = Number.parseInt(nonceHex, 16);

    state.address = address;
    networkState.addressSnapshot = { address, observedBlock, byteCount, balance, nonce, ...classification };
    $("#probeEmpty").hidden = true;
    $("#probeResult").hidden = false;
    $("#verdictMark").textContent = classification.mark;
    $("#verdictMark").dataset.tone = classification.tone;
    $("#addressVerdict").textContent = classification.verdict;
    $("#resultAddress").textContent = `${address.slice(0, 8)}…${address.slice(-6)}`;
    $("#resultAddress").title = address;
    $("#resultBytecode").textContent = byteCount ? `${byteCount.toLocaleString("en-US")} bytes` : "None";
    $("#resultBalance").textContent = balance;
    $("#resultNonce").textContent = nonce.toLocaleString("en-US");
    $("#explorerLink").href = `${EXPLORER_URL}/address/${address}`;
    status.textContent = `Read from block #${observedBlock.toLocaleString("en-US")}. This does not prove ownership or authorship.`;
    updateUrl();
  } catch {
    status.textContent = "The public RPC did not return an address result. Try again.";
  }
}

$("#refreshNetwork").addEventListener("click", refreshNetworkPulse);

$("#addressProbeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  inspectAddress($("#addressInput").value);
});

function drawAddressSnapshotCard() {
  const snapshot = networkState.addressSnapshot;
  if (!snapshot) return null;
  const canvas = $("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;

  ctx.fillStyle = "#0b0c10";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#342833";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y <= height; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const sideGradient = ctx.createLinearGradient(0, 0, 190, height);
  sideGradient.addColorStop(0, "#8b61d7");
  sideGradient.addColorStop(0.34, "#bc76d8");
  sideGradient.addColorStop(0.58, "#ee84b5");
  sideGradient.addColorStop(0.78, "#fb9b9e");
  sideGradient.addColorStop(1, "#fed6af");
  ctx.fillStyle = sideGradient;
  ctx.fillRect(0, 0, 190, height);
  ctx.save();
  ctx.translate(76, height - 54);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#0b0c10";
  ctx.font = "700 18px monospace";
  ctx.fillText("ELYSIUM TESTNET · CHAIN 99801 · READ ONLY", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#fff8fb";
  ctx.font = "700 19px Arial";
  ctx.fillText("ASCEND FLOW LAB / ADDRESS SNAPSHOT", 238, 60);
  ctx.textAlign = "right";
  ctx.fillStyle = "#fb9b9e";
  ctx.font = "700 16px monospace";
  ctx.fillText("● LIVE RPC OBSERVATION", width - 58, 60);
  ctx.textAlign = "left";

  ctx.fillStyle = "#fff8fb";
  ctx.font = "68px Georgia";
  ctx.fillText("Address", 238, 162);
  ctx.fillStyle = "#fed6af";
  ctx.font = "italic 78px Georgia";
  ctx.fillText("snapshot.", 492, 162);

  ctx.strokeStyle = "#6f5d68";
  ctx.strokeRect(238, 208, width - 296, 104);
  ctx.fillStyle = "#bba8b3";
  ctx.font = "700 14px monospace";
  ctx.fillText("OBSERVED ADDRESS", 262, 242);
  ctx.fillStyle = "#fff8fb";
  ctx.font = "700 24px monospace";
  ctx.fillText(snapshot.address, 262, 286);

  const stats = [
    ["NETWORK RESULT", snapshot.verdict],
    ["BLOCK USED", `#${snapshot.observedBlock.toLocaleString("en-US")}`],
    ["BYTECODE", snapshot.byteCount ? `${snapshot.byteCount.toLocaleString("en-US")} BYTES` : "NONE"],
  ];
  const boxWidth = (width - 296) / 3;
  stats.forEach(([label, value], index) => {
    const x = 238 + boxWidth * index;
    ctx.strokeStyle = "#6f5d68";
    ctx.strokeRect(x, 344, boxWidth, 142);
    ctx.fillStyle = index === 0 ? "#feaa8d" : index === 1 ? "#8b61d7" : "#ee84b5";
    ctx.fillRect(x, 344, boxWidth, 9);
    ctx.fillStyle = "#bba8b3";
    ctx.font = "700 13px monospace";
    ctx.fillText(label, x + 22, 390);
    ctx.fillStyle = "#fff8fb";
    ctx.font = index === 0 ? "700 22px Arial" : "700 29px monospace";
    const clipped = value.length > 25 ? `${value.slice(0, 23)}…` : value;
    ctx.fillText(clipped, x + 22, 446);
  });

  ctx.fillStyle = "#bba8b3";
  ctx.font = "15px Arial";
  ctx.fillText("Public-RPC snapshot · no ownership or authorship claim · no wallet connection · unofficial", 238, 548);
  ctx.fillStyle = "#fff8fb";
  ctx.font = "700 14px monospace";
  ctx.fillText(`GAS ${networkState.gasGwei || "—"} GWEI`, 238, 586);
  ctx.textAlign = "right";
  ctx.fillText(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC", width - 58, 586);
  ctx.textAlign = "left";

  return canvas;
}

$("#downloadProof").addEventListener("click", () => {
  const canvas = drawAddressSnapshotCard();
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `elysium-address-snapshot-${networkState.addressSnapshot.address.slice(0, 8)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  $("#probeStatus").textContent = "1200×630 address snapshot downloaded.";
});

$("#copyProof").addEventListener("click", async () => {
  const snapshot = networkState.addressSnapshot;
  if (!snapshot) return;
  const text = [
    "Elysium Address Snapshot — Ascend Flow Lab",
    `Network: Elysium testnet (chain 99801)`,
    `Block used: #${snapshot.observedBlock}`,
    `Address: ${snapshot.address}`,
    `Network result: ${snapshot.verdict}`,
    `Bytecode: ${snapshot.byteCount.toLocaleString("en-US")} bytes`,
    `Balance: ${snapshot.balance}`,
    `Nonce: ${snapshot.nonce}`,
    `Observed: ${new Date().toISOString()}`,
    "Read-only RPC snapshot. It does not prove ownership, authorship or Ascend test participation.",
    "Unofficial community tool.",
    location.href,
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    $("#probeStatus").textContent = "Address snapshot copied.";
  } catch {
    $("#probeStatus").textContent = "Clipboard access was unavailable.";
  }
});

function hydrateFromUrl() {
  const params = new URLSearchParams(location.search);
  const hasVolume = params.has("v");
  const volume = hasVolume ? Number(params.get("v")) : Number.NaN;
  const recipient = params.get("role");
  const period = params.get("period");
  const address = params.get("address") || "";

  if (Number.isFinite(volume) && volume >= 0) state.dailyVolume = clamp(volume, 0, 1_000_000_000);
  if (recipient in MODEL.recipients) state.recipient = recipient;
  if (period in MODEL.periods) state.period = period;
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
    state.address = address;
    $("#addressInput").value = address;
  }

  $(`input[name="recipient"][value="${state.recipient}"]`).checked = true;
  $(`input[name="period"][value="${state.period}"]`).checked = true;
}

hydrateFromUrl();
render();
refreshNetworkPulse();
if (state.address) inspectAddress(state.address);
window.setInterval(refreshNetworkPulse, 15_000);
