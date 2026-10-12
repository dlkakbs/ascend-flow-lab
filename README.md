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
| Builder Snapshot | Live | Turns the latest address observation into copyable text or a 1200×630 card | Local export of RPC data |
| Project Lens | Live | Shows indexed ERC-20 metrics and holder concentration when that index is available | Elysium explorer API |
| Elysium Atlas | Soon | Planned directory for verified projects across Elysium, not only Ascend launches | Requires verified project identities and official contract links |
| Ascend Activity | Soon | Planned view of Ascend activity that can be verified from public onchain evidence | Scope depends on future implementation disclosures |
| Ascend Model | Reference | Models the fee routes described in Ascend's published proposal | Ascend documentation |
| Roadmap | Live | Separates shipped functions from planned work | Project status |

Public index endpoints can be slow or temporarily unavailable. When a source does not respond, the interface says so and does not substitute estimated data.

RPC telemetry refreshes about every 15 seconds, and explorer totals refresh every 60 seconds. Contract Radar updates on page load or when refreshed manually. Protocol documentation is reviewed manually and carries a separate review date in the interface.

## Data boundaries

- **Network:** Elysium testnet, chain ID `99801`.
- **RPC:** `https://testnet-rpc.elysium.kinetiq.xyz`
- **Explorer API:** `https://testnet-api.elysium.kinetiq.xyz/api/v2`
- **Explorer:** `https://elysium.kinetiq.xyz/testnet-explorer`
- **Mode:** read only; no wallet connection and no transaction submission.

Address snapshots describe only public chain state. They do not prove ownership, contract authorship, builder status, Ascend test participation or whitelist eligibility.

Project Lens displays raw testnet explorer observations. Testnet price, volume and market-cap fields may be sparse, experimental or manipulated; they are not proof of project quality. The module does not assign an “Ascended” score or infer whether a project qualifies for Ascend support. Ascend's exact qualification thresholds are not published.

The live modules observe the wider Elysium testnet. They do not currently identify Ascend-specific activity. Ascend says contract addresses and deployment status will be addressed in future implementation disclosures; it does not currently promise a public API, event index or complete public telemetry. Ascend Activity will remain marked **Soon**, and its eventual coverage will be limited to activity that those disclosures make verifiable onchain. General Elysium transactions will not be relabeled as Ascend transactions.

Elysium Atlas is a separate planned layer: it is intended to cover verified projects across the Elysium ecosystem, whether or not they launched through Ascend.

## Ascend model

The reference model follows the parameters documented by Ascend, including the proposed 1% trading fee, recipient alternatives, HYPE/KNTQ purchase routes and NFT reward weighting. Users can change the assumed volume, recipient arrangement and time period, compare scenarios and export the result.

The output is an illustrative USD-equivalent allocation—not a forecast or token-quantity estimate. Ascend describes the mechanism as a proposal under development. Undisclosed parameters such as exact NFT boosts, eligibility thresholds and final implementation controls remain explicitly marked as unknown.

## Roadmap

Current work focuses on reliable public data rather than inferred project labels. Planned additions include longer activity windows, contract-to-deployer relationship views and local comparison sets. Two distinct verified layers are planned: an Elysium-wide Atlas backed by project submissions and official contract links, and an Ascend Activity view whose scope depends on future implementation disclosures and observable onchain data.

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
- [Recurring Ecosystem Support](https://ascendlaunch.gitbook.io/docs/recurring-ecosystem-support)
- [Trading Profiles & Referrals](https://ascendlaunch.gitbook.io/docs/trading-profiles-and-referrals)
- [Ascend NFTs](https://ascendlaunch.gitbook.io/docs/ascend-nfts)
- [Implementation Controls & Risk](https://ascendlaunch.gitbook.io/docs/implementation-controls-and-risk)

## Disclaimer

Ascend Flow Lab is an independent community project and is not affiliated with Ascend, Kinetiq or Elysium. It is not an audit, investment recommendation, forecast or statement of final protocol behavior.
