const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'products');
fs.mkdirSync(dir, { recursive: true });

const items = [
  ['chatgpt-plus','ChatGPT Plus'],['steam-wallet','Steam Wallet'],['psn-card','PlayStation Card'],
  ['spotify-premium','Spotify Premium'],['cursor-pro','Cursor Pro'],['xbox-gamepass','Xbox Game Pass'],
  ['claude-pro','Claude Pro'],['perplexity-pro','Perplexity Pro'],['google-ai-pro','Google AI Pro'],
  ['windows-license','Windows License'],['apple-itunes-us','Apple iTunes'],['nintendo-eshop','Nintendo eShop'],
  ['roblox-robux','Roblox Robux'],['minecraft-java-bedrock','Minecraft'],['youtube-premium','YouTube Premium'],
  ['zoom-workplace','Zoom Workplace'],['adguard-vpn','AdGuard VPN'],['wow-time-card','WoW Time Card'],
  ['valorant-points','Valorant Points'],['office-license','Office License']
];

for (const [id, title] of items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0ea5a4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="60" y="420" font-size="78" font-family="Inter,Arial,sans-serif" fill="white" font-weight="700">${title}</text><text x="60" y="500" font-size="34" font-family="Inter,Arial,sans-serif" fill="#bae6fd">MYRI MARKET</text></svg>`;
  fs.writeFileSync(path.join(dir, `${id}.svg`), svg);
}
console.log('generated', items.length);
