# Myri Product Radar V1

Automated product opportunity radar focused on **Nigeria (NG)**.

## What it does

1. Ingests trend/product signals from configurable sources (`mock` and `apiStub` supported in V1)
2. Scores each product with weighted model:
   - Trend velocity: **30**
   - Margin potential: **25**
   - Supplier reliability: **20**
   - Delivery fit: **15**
   - Repeat potential: **10**
3. Produces ranked **Top 10** with score breakdown
4. Generates daily reports:
   - `product-radar-report.json`
   - `product-radar-report.md`
5. Generates Telegram-ready summary:
   - `telegram-summary.txt`
6. Preserves source-provided direct supplier/product URLs (`productUrl`) and includes fallback candidate links (`fallbackProductUrls`)

## Run manually

From repo root:

```bash
npm run radar:run
```

Optional args:

```bash
node modules/product-radar/cli.js --config modules/product-radar/config/sources.example.json --out modules/product-radar/reports/custom-run
```

## Output location

Default output:

`modules/product-radar/reports/YYYY-MM-DD/`

## Configure data sources

Edit:

`modules/product-radar/config/sources.example.json`

### Source types

- `mock`: static sample data (works now)
- `apiStub`: placeholder data while waiting for real API integration

## Add real API keys later

V1 is stub-ready. For each `apiStub` source:

1. Set the env var listed in `envKey` (example: `TIKTOK_SHOP_API_KEY`)
2. Replace stub ingestion logic in `src/pipeline.js` (`ingestFromSource`) with live API fetch
3. Keep output shape identical:
   - `name`, `category`, `trendVelocity`, `marginPotential`, `supplierReliability`, `deliveryFit`, `repeatPotential`

This keeps scoring/reporting unchanged while upgrading sources incrementally.
