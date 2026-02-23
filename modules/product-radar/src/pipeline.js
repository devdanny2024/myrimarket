const fs = require('fs');
const path = require('path');

const WEIGHTS = {
  trendVelocity: 30,
  marginPotential: 25,
  supplierReliability: 20,
  deliveryFit: 15,
  repeatPotential: 10,
};

function loadConfig(configPath) {
  const resolved = configPath
    ? path.resolve(configPath)
    : path.resolve(__dirname, '..', 'config', 'sources.example.json');

  const raw = fs.readFileSync(resolved, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed.country || parsed.country.toUpperCase() !== 'NG') {
    throw new Error('Myri Product Radar V1 currently supports Nigeria only. Set country to "NG".');
  }

  return parsed;
}

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function scoreProduct(product) {
  const breakdown = {
    trendVelocity: clampScore(product.trendVelocity),
    marginPotential: clampScore(product.marginPotential),
    supplierReliability: clampScore(product.supplierReliability),
    deliveryFit: clampScore(product.deliveryFit),
    repeatPotential: clampScore(product.repeatPotential),
  };

  const weightedScore = Number((
    (breakdown.trendVelocity * WEIGHTS.trendVelocity +
      breakdown.marginPotential * WEIGHTS.marginPotential +
      breakdown.supplierReliability * WEIGHTS.supplierReliability +
      breakdown.deliveryFit * WEIGHTS.deliveryFit +
      breakdown.repeatPotential * WEIGHTS.repeatPotential) / 100
  ).toFixed(2));

  return {
    ...product,
    scoreBreakdown: breakdown,
    weightedScore,
  };
}

function uniqueByName(products) {
  const seen = new Set();
  return products.filter((p) => {
    const key = String(p.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ingestFromSource(source) {
  if (!source.enabled) return [];

  if (source.type === 'mock') {
    return (source.products || []).map((p) => ({
      ...p,
      source: source.name,
      sourceType: source.type,
      sourceStatus: 'live-mock',
      country: 'NG',
    }));
  }

  if (source.type === 'apiStub') {
    return (source.stubProducts || []).map((p) => ({
      ...p,
      source: source.name,
      sourceType: source.type,
      sourceStatus: 'stubbed-awaiting-api-key',
      country: 'NG',
      notes: [
        ...(p.notes || []),
        `Source ${source.name} is stubbed. Configure ${source.envKey || 'API_KEY'} to enable live ingestion.`,
      ],
    }));
  }

  return [];
}

function runPipeline({ configPath, outputDir }) {
  const config = loadConfig(configPath);
  const allSignals = config.sources.flatMap(ingestFromSource);
  const scored = uniqueByName(allSignals).map(scoreProduct);
  const ranked = scored.sort((a, b) => b.weightedScore - a.weightedScore);
  const top10 = ranked.slice(0, 10).map((item, index) => ({ ...item, rank: index + 1 }));

  const now = new Date();
  const runDate = now.toISOString().slice(0, 10);
  const runTimestamp = now.toISOString();

  const outRoot = outputDir
    ? path.resolve(outputDir)
    : path.resolve(__dirname, '..', 'reports', runDate);

  fs.mkdirSync(outRoot, { recursive: true });

  const jsonReport = {
    report: 'Myri Product Radar V1',
    country: 'NG',
    runDate,
    runTimestamp,
    weights: WEIGHTS,
    signalsIngested: allSignals.length,
    uniqueCandidates: scored.length,
    topProducts: top10,
  };

  const markdownReport = buildMarkdown(jsonReport);
  const telegramSummary = buildTelegramSummary(jsonReport);

  const jsonPath = path.join(outRoot, 'product-radar-report.json');
  const mdPath = path.join(outRoot, 'product-radar-report.md');
  const tgPath = path.join(outRoot, 'telegram-summary.txt');

  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');
  fs.writeFileSync(mdPath, markdownReport, 'utf8');
  fs.writeFileSync(tgPath, telegramSummary, 'utf8');

  return {
    outRoot,
    jsonPath,
    mdPath,
    tgPath,
    top10,
  };
}

function buildMarkdown(report) {
  const header = `# Myri Product Radar V1 (${report.country})\n\n- Run Date: ${report.runDate}\n- Run Timestamp: ${report.runTimestamp}\n- Signals Ingested: ${report.signalsIngested}\n- Unique Candidates: ${report.uniqueCandidates}\n\n## Weight Model\n\n- Trend Velocity: ${WEIGHTS.trendVelocity}\n- Margin Potential: ${WEIGHTS.marginPotential}\n- Supplier Reliability: ${WEIGHTS.supplierReliability}\n- Delivery Fit: ${WEIGHTS.deliveryFit}\n- Repeat Potential: ${WEIGHTS.repeatPotential}\n\n## Top 10 Products\n`;

  const lines = report.topProducts.map((p) => {
    const b = p.scoreBreakdown;
    return `\n### #${p.rank} ${p.name} — ${p.weightedScore}/100\n- Category: ${p.category || 'N/A'}\n- Source: ${p.source} (${p.sourceStatus})\n- Trend Velocity: ${b.trendVelocity}\n- Margin Potential: ${b.marginPotential}\n- Supplier Reliability: ${b.supplierReliability}\n- Delivery Fit: ${b.deliveryFit}\n- Repeat Potential: ${b.repeatPotential}`;
  });

  return `${header}\n${lines.join('\n')}`;
}

function buildTelegramSummary(report) {
  const top5 = report.topProducts.slice(0, 5);
  const body = top5
    .map((p) => `${p.rank}) ${p.name} — ${p.weightedScore}/100`)
    .join('\n');

  return `Myri Product Radar (NG) - ${report.runDate}\nTop 5 opportunities today:\n${body}\n\nTotal candidates: ${report.uniqueCandidates} | Signals: ${report.signalsIngested}`;
}

module.exports = {
  runPipeline,
  WEIGHTS,
};
