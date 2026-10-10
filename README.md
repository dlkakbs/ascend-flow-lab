# Ascend Flow Lab

Ascend Flow Lab is an independent, read-only workspace for exploring the Elysium public testnet and reviewing Ascend's published economic proposal.

**Live:** [ascend-flow-lab.vercel.app](https://ascend-flow-lab.vercel.app)

The interface connects directly to public Elysium endpoints. It never asks for a wallet connection, signature or transaction.

## Modules

| Module | Status | What it does | Public source |
| --- | --- | --- | --- |
| Pulse | Live | Shows chain status, latest block, gas, latency, index totals and recent blocks | Elysium RPC + explorer API |
| Radar | Live | Lists recently indexed verified contracts | Elysium explorer API |
| Inspect | Live | Reads bytecode, native HYPE balance and outgoing nonce at one observed block | Elysium RPC |
| Builder Proof | Live | Turns the latest address observation into copyable text or a 1200×630 card | Local export of RPC data |
| Project Lens | Live | Shows indexed ERC-20 metrics and holder concentration when that index is available | Elysium explorer API |
| Atlas | Soon | Planned curated directory for source-linked projects and contracts | Requires a verification workflow |
| Ascend Model | Reference | Models the fee routes described in Ascend's published proposal | Ascend documentation |
| Roadmap | Live | Separates shipped functions from planned work | Project status |

Public index endpoints can be slow or temporarily unavailable. When a source does not respond, the interface says so and does not substitute estimated data.

## Data boundaries

- **Network:** Elysium testnet, chain ID `99801`.
- **RPC:** `https://testnet-rpc.elysium.kinetiq.xyz`
- **Explorer API:** `https://testnet-api.elysium.kinetiq.xyz/api/v2`
- **Explorer:** `https://elysium.kinetiq.xyz/testnet-explorer`
- **Mode:** read only; no wallet connection and no transaction submission.

Address snapshots describe only public chain state. They do not prove ownership, contract authorship, builder status, Ascend test participation or whitelist eligibility.

Project Lens displays raw explorer observations. It does not assign an “Ascended” score or infer whether a project qualifies for Ascend support. Ascend's exact qualification thresholds are not published.

## Ascend model

The reference model follows the parameters documented by Ascend, including the proposed 1% trading fee, recipient alternatives, HYPE/KNTQ purchase routes and NFT reward weighting. Users can change the assumed volume, recipient arrangement and time period, compare scenarios and export the result.

The output is an illustrative USD-equivalent allocation—not a forecast or token-quantity estimate. Ascend describes the mechanism as a proposal under development. Undisclosed parameters such as exact NFT boosts, eligibility thresholds and final implementation controls remain explicitly marked as unknown.

## Roadmap

Current work focuses on reliable public data rather than inferred project labels. Planned additions include longer activity windows, contract-to-deployer relationship views, local comparison sets and a curated ecosystem Atlas backed by verified project submissions and official contract links.

## Run locally

No package installation or build step is required.

```sh
python3 -m http.server 4173 --directory dist
```

Then open [http://localhost:4173](http://localhost:4173).

## Project structure

```text
dist/
├── index.html   # Accessible module structure and source ledger
├── styles.css   # Visual system and responsive layouts
├── app.js       # Live data, inspection, modeling and export logic
└── favicon.svg  # Site mark
```

The production deployment serves `dist/` through Vercel.

## Primary references

- [What is Elysium?](https://elysium.kinetiq.xyz/docs/what-is-elysium)
- [Building on Elysium](https://elysium.kinetiq.xyz/docs/building-on-elysium)
- [Elysium testnet explorer](https://elysium.kinetiq.xyz/testnet-explorer)
- [Elysium explorer API](https://testnet-api.elysium.kinetiq.xyz/api/v2/stats)
- [Ascend documentation](https://ascendlaunch.gitbook.io/docs)
- [Trading Fee Breakdown](https://ascendlaunch.gitbook.io/docs/trading-fee-breakdown)
- [Revenue & Capital Allocation](https://ascendlaunch.gitbook.io/docs/revenue-and-capital-allocation)
- [Ascend NFTs](https://ascendlaunch.gitbook.io/docs/ascend-nfts)

## Disclaimer

Ascend Flow Lab is an independent community project and is not affiliated with Ascend, Kinetiq or Elysium. It is not an audit, investment recommendation, forecast or statement of final protocol behavior.
