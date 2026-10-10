# Ascend Flow Lab

An unofficial, read-only Elysium testnet instrument and interactive field guide to Ascend's proposed fee and capital-allocation model.

The project is a buildless static site. Open `dist/index.html` directly or serve the `dist` directory with any static file server.

## What it models

- 1% launched-token trading fee
- 25% default deployer or 50% approved creator/takeover recipient share
- Remaining net protocol revenue split equally between HYPE and KNTQ purchases
- Published downstream HYPE and KNTQ allocation percentages
- The documented boundary of Ascend NFT reward weighting

All financial outputs are illustrative USD equivalents. The site links every modeled rule to the official Ascend litepaper and labels the design as proposed and unofficial.

## Live Elysium telemetry

- Verifies chain ID, latest block, gas price, transaction count and browser-to-RPC latency
- Builds a local block-progression trace from live observations
- Inspects any testnet address with `eth_getCode`, `eth_getBalance` and `eth_getTransactionCount`
- Generates a shareable, block-specific address snapshot without connecting a wallet or requesting a signature

Network data comes directly from `https://testnet-rpc.elysium.kinetiq.xyz`. The interface performs no writes, never requests wallet access and does not create onchain activity. An address snapshot confirms only the state returned for that address at the recorded block; it does not prove ownership, authorship, or Ascend test participation. The site does not connect to Ascend's gated application.

## Local preview

```sh
python3 -m http.server 4173 --directory dist
```

Then visit `http://localhost:4173`.
