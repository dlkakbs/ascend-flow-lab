# Ascend Flow Lab

Ascend Flow Lab is an independent, read-only interface for exploring the Elysium public testnet and understanding Ascend's proposed fee and capital-allocation model.

**Live site:** [ascend-flow-lab.vercel.app](https://ascend-flow-lab.vercel.app)

The project combines live network telemetry, a block-specific address inspector and an interactive economics model in a dependency-free static website. It does not connect to a wallet, request signatures or submit transactions.

## Features

### Live Elysium telemetry

- Confirms the Elysium testnet chain ID and reads the latest block directly from the public RPC.
- Displays gas price, latest-block transaction count and browser-to-RPC latency.
- Builds a short local trace of observed block progression.
- Requires no wallet connection or account access.

### Block-specific address inspection

- Reads bytecode, HYPE balance and transaction count for an Elysium testnet address.
- Pins all address queries to the same observed block for a consistent snapshot.
- Produces a shareable text summary and 1200×630 image card.
- Does not claim or prove address ownership, contract authorship, builder status or Ascend test participation.

### Ascend economics model

The interactive model follows the parameters described in Ascend's published proposal:

- A 1% trading fee on launched-token volume.
- A 25% fee share for the default deployer arrangement.
- A 50% fee share for an Ascend-approved creator or takeover operator.
- A 50/50 split of remaining net protocol revenue between HYPE and KNTQ purchases.
- The published downstream allocations for purchased HYPE and KNTQ.
- The proposed NFT weighting mechanism for the direct HYPE reward pool.

Users can change the assumed daily volume, recipient arrangement and time period, compare both recipient scenarios, and export the current model as text or an image.

## Scope and accuracy

All financial results are illustrative USD-equivalent allocations, not forecasts or token-quantity estimates. Execution costs, price movement, network fees and separate swap fees are excluded.

Ascend's mechanism is presented as a **proposal under development**. Parameters that have not been published—such as NFT boost rates, tier quantities, eligibility thresholds and final implementation controls—are explicitly marked as undisclosed. The source ledger in the interface links each modeled rule to the relevant official documentation.

Elysium testnet telemetry is read from:

```text
https://testnet-rpc.elysium.kinetiq.xyz
```

The Ascend application currently has gated access. Ascend Flow Lab does not connect to that application and does not generate testnet activity.

## Technology

- Semantic HTML
- Responsive CSS
- Vanilla JavaScript
- JSON-RPC requests made directly in the browser
- No framework, package installation or build step

The deployable site is contained entirely in `dist/`.

## Run locally

From the repository root:

```sh
python3 -m http.server 4173 --directory dist
```

Open [http://localhost:4173](http://localhost:4173) in a browser.

You can also open `dist/index.html` directly, although serving the directory more closely matches the production environment.

## Project structure

```text
dist/
├── index.html   # Page structure and source ledger
├── styles.css   # Layout, visual system and responsive rules
├── app.js       # RPC telemetry, model calculations and exports
└── favicon.svg  # Site icon
```

## Deployment

The production site is deployed on Vercel:

[https://ascend-flow-lab.vercel.app](https://ascend-flow-lab.vercel.app)

Because the project is static, any host that can serve the `dist/` directory can run it.

## Primary references

- [Elysium: What is Elysium?](https://elysium.kinetiq.xyz/docs/what-is-elysium)
- [Elysium: Building on Elysium](https://elysium.kinetiq.xyz/docs/building-on-elysium)
- [Ascend documentation](https://ascendlaunch.gitbook.io/docs)
- [Ascend trading fee breakdown](https://ascendlaunch.gitbook.io/docs/trading-fee-breakdown)
- [Ascend revenue and capital allocation](https://ascendlaunch.gitbook.io/docs/revenue-and-capital-allocation)
- [Ascend NFTs](https://ascendlaunch.gitbook.io/docs/ascend-nfts)

## Disclaimer

Ascend Flow Lab is an independent community project and is not affiliated with Ascend, Kinetiq or Elysium. It is not an audit, investment recommendation, forecast or statement of final protocol behavior.
