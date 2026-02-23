#!/usr/bin/env node

const path = require('path');
const { runPipeline } = require('./src/pipeline');

function parseArgs(argv) {
  const args = { config: undefined, out: undefined };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--config') args.config = argv[i + 1];
    if (token === '--out') args.out = argv[i + 1];
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const result = runPipeline({
    configPath: args.config ? path.resolve(args.config) : undefined,
    outputDir: args.out ? path.resolve(args.out) : undefined,
  });

  console.log('Myri Product Radar V1 run completed.');
  console.log(`Output directory: ${result.outRoot}`);
  console.log(`JSON report: ${result.jsonPath}`);
  console.log(`Markdown report: ${result.mdPath}`);
  console.log(`Telegram summary: ${result.tgPath}`);
  console.log('Top 3:');
  result.top10.slice(0, 3).forEach((p) => {
    console.log(`- #${p.rank} ${p.name} (${p.weightedScore}/100)`);
  });
}

main();
