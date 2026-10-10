# Ascend Flow Lab

An unofficial interactive field guide to Ascend's proposed fee and capital-allocation model on Elysium.

The project is a buildless static site. Open `dist/index.html` directly or serve the `dist` directory with any static file server.

## What it models

- 1% launched-token trading fee
- 25% default deployer or 50% approved creator/takeover recipient share
- Remaining net protocol revenue split equally between HYPE and KNTQ purchases
- Published downstream HYPE and KNTQ allocation percentages
- The documented boundary of Ascend NFT reward weighting

All financial outputs are illustrative USD equivalents. The site links every modeled rule to the official Ascend litepaper and labels the design as proposed and unofficial.

## Local preview

```sh
python3 -m http.server 4173 --directory dist
```

Then visit `http://localhost:4173`.
