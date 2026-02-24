const FX_NGN_PER_USD = 1500;
const MARKUP = 1.4;
const ROUND_BAND = 500;

const toNgn = (usd) => Math.round((usd * FX_NGN_PER_USD * MARKUP) / ROUND_BAND) * ROUND_BAND;
const cmp = (price) => Math.round((price * 1.3) / ROUND_BAND) * ROUND_BAND;

function mkVariants(baseUsd, labels = ["1M", "3M", "6M", "12M"]) {
  const factors = [1, 2.8, 5.3, 10.1];
  return labels.map((label, i) => {
    const p = toNgn(baseUsd * (factors[i] ?? 1));
    return { id: label.toLowerCase(), label, priceNgn: p, compareAtNgn: cmp(p) };
  });
}

const categories = [
  { id: "streaming", name: "Streaming", slug: "streaming", icon: "📺" },
  { id: "gaming", name: "Gaming", slug: "gaming", icon: "🎮" },
  { id: "giftcards", name: "Gift Cards", slug: "giftcards", icon: "🎁" },
  { id: "security", name: "Security", slug: "security", icon: "🛡️" },
  { id: "ai", name: "AI Tools", slug: "ai-tools", icon: "🤖" },
  { id: "software", name: "Software", slug: "software", icon: "💻" },
];

const products = [
  {
    id: "chatgpt-plus",
    title: "ChatGPT Plus / Pro",
    categoryId: "ai",
    shortDescription: "Cheapest Plati vendor in product type list.",
    priceNgn: toNgn(8),
    compareAtNgn: cmp(toNgn(8)),
    variants: mkVariants(8),
    sourceVendor: "Top seller from Plati leaders",
    sourceUrl: "https://plati.market/itm/chatgpt-5-2-plus-pro-go-1-12-m-podpiska-aktivacija-prodlenie/4339002",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "steam-wallet",
    title: "Steam Wallet Top-up",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Steam top-up product type.",
    priceNgn: toNgn(5),
    compareAtNgn: cmp(toNgn(5)),
    variants: ["$5", "$10", "$20", "$50"].map((v, i) => {
      const usd = [5, 10, 20, 50][i];
      const p = toNgn(usd);
      return { id: `usd-${usd}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Igromagaz",
    sourceUrl: "https://plati.market/itm/steam-wallet-top-up-ru-kz-ua-cis-low-fee/3961593",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "psn-card",
    title: "PlayStation Gift Card",
    categoryId: "giftcards",
    shortDescription: "Cheapest vendor under PlayStation product type.",
    priceNgn: toNgn(9),
    compareAtNgn: cmp(toNgn(9)),
    variants: ["250 TRY", "500 TRY", "1000 TRY", "2000 TRY"].map((v, i) => {
      const usd = [9, 17, 33, 65][i];
      const p = toNgn(usd);
      return { id: `try-${[250,500,1000,2000][i]}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Auto PS seller",
    sourceUrl: "https://plati.market/itm/avto-playstation-turcija-psn-kod-popolnenija-balans-try/4433025",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "spotify-premium",
    title: "Spotify Premium",
    categoryId: "streaming",
    shortDescription: "Cheapest vendor under Spotify product type.",
    priceNgn: toNgn(7),
    compareAtNgn: cmp(toNgn(7)),
    variants: mkVariants(7),
    sourceVendor: "Spotify auto vendor",
    sourceUrl: "https://plati.market/itm/1-3-6-12-spotify-premium-individual-duo-family-auto/3362540",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "cursor-pro",
    title: "Cursor AI Pro",
    categoryId: "ai",
    shortDescription: "Cheapest vendor under Cursor product type.",
    priceNgn: toNgn(12),
    compareAtNgn: cmp(toNgn(12)),
    variants: mkVariants(12, ["Pro", "Business", "Ultra", "Ultra+Year"]),
    sourceVendor: "Cursor auto vendor",
    sourceUrl: "https://plati.market/itm/cursor-pro-business-ultra/5362631",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "xbox-gamepass",
    title: "Xbox Game Pass Ultimate",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Xbox product type.",
    priceNgn: toNgn(11),
    compareAtNgn: cmp(toNgn(11)),
    variants: ["1M", "3M", "6M", "12M"].map((v, i) => {
      const usd = [11, 29, 56, 108][i];
      const p = toNgn(usd);
      return { id: v.toLowerCase(), label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Xbox top vendor",
    sourceUrl: "https://plati.market/itm/xbox-game-pass-ultimate-1-2-3-4-5-6-7-10-12-months/3103309",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "claude-pro",
    title: "Claude Pro / Max",
    categoryId: "ai",
    shortDescription: "Cheapest vendor under Claude product type.",
    priceNgn: toNgn(10),
    compareAtNgn: cmp(toNgn(10)),
    variants: mkVariants(10, ["Pro", "Max 5", "Max 20", "Annual"]),
    sourceVendor: "Claude vendor",
    sourceUrl: "https://plati.market/itm/claudeai-4-6-pro-max-code-anthropic-fast/4023986",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "perplexity-pro",
    title: "Perplexity Pro",
    categoryId: "ai",
    shortDescription: "Cheapest vendor under Perplexity product type.",
    priceNgn: toNgn(8),
    compareAtNgn: cmp(toNgn(8)),
    variants: mkVariants(8),
    sourceVendor: "Perplexity vendor",
    sourceUrl: "https://plati.market/itm/perplexity-ai-pro-comet-1-year-easy-instant/4989208",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "google-ai-pro",
    title: "Google AI Pro / Gemini",
    categoryId: "ai",
    shortDescription: "Cheapest vendor under Gemini product type.",
    priceNgn: toNgn(12),
    compareAtNgn: cmp(toNgn(12)),
    variants: ["1M", "3M", "6M", "12M"].map((v, i) => {
      const usd = [12, 32, 60, 115][i];
      const p = toNgn(usd);
      return { id: v.toLowerCase(), label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Google AI vendor",
    sourceUrl: "https://plati.market/itm/google-ai-pro-6-months-gemini-3-nano-banana-pro-veo-3/5548300",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "windows-license",
    title: "Windows 11/10 License",
    categoryId: "software",
    shortDescription: "Cheapest vendor under Windows license product type.",
    priceNgn: toNgn(6),
    compareAtNgn: cmp(toNgn(6)),
    variants: ["Home", "Pro", "Enterprise", "Lifetime"].map((v, i) => {
      const usd = [6, 10, 15, 24][i];
      const p = toNgn(usd);
      return { id: v.toLowerCase(), label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Windows key vendor",
    sourceUrl: "https://plati.market/itm/windows-11-10-pro-home--original-retail-paypal/2494243",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "apple-itunes-us",
    title: "Apple iTunes Card (US)",
    categoryId: "giftcards",
    shortDescription: "Cheapest vendor under App Store/iTunes type.",
    priceNgn: toNgn(4),
    compareAtNgn: cmp(toNgn(4)),
    variants: ["$10", "$25", "$50", "$100"].map((v, i) => {
      const usd = [10, 25, 50, 100][i];
      const p = toNgn(usd);
      return { id: `usd-${usd}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "iTunes card vendor",
    sourceUrl: "https://plati.market/itm/podarochnaja-karta-apple-itunes-us-2-500-cena/672298",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "nintendo-eshop",
    title: "Nintendo eShop Card",
    categoryId: "giftcards",
    shortDescription: "Cheapest vendor under Nintendo eShop type.",
    priceNgn: toNgn(5),
    compareAtNgn: cmp(toNgn(5)),
    variants: ["$5", "$10", "$20", "$50"].map((v, i) => {
      const usd = [5, 10, 20, 50][i];
      const p = toNgn(usd);
      return { id: `usd-${usd}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Nintendo card vendor",
    sourceUrl: "https://plati.market/itm/nintendo-eshop-card-5-10-20-35-50-70-100-usd-usa/3385194",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "roblox-robux",
    title: "Roblox Robux",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Roblox product type.",
    priceNgn: toNgn(6),
    compareAtNgn: cmp(toNgn(6)),
    variants: ["225", "800", "1700", "4500"].map((v, i) => {
      const usd = [6, 12, 20, 45][i];
      const p = toNgn(usd);
      return { id: `rbx-${v}`, label: `${v} Robux`, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Robux vendor",
    sourceUrl: "https://plati.market/itm/roblox-gift-card-225-10000-robux-global/3531526",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "minecraft-java-bedrock",
    title: "Minecraft Java & Bedrock",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Minecraft product type.",
    priceNgn: toNgn(9),
    compareAtNgn: cmp(toNgn(9)),
    variants: ["Standard", "Deluxe", "Gift", "Instant"].map((v, i) => {
      const usd = [9, 12, 15, 18][i];
      const p = toNgn(usd);
      return { id: v.toLowerCase(), label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Minecraft vendor",
    sourceUrl: "https://plati.market/itm/minecraft-java-bedrock-dlja-pk-kljuch-vse-strany/3391743",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "youtube-premium",
    title: "YouTube Premium",
    categoryId: "streaming",
    shortDescription: "Cheapest vendor under YouTube Premium type.",
    priceNgn: toNgn(7),
    compareAtNgn: cmp(toNgn(7)),
    variants: mkVariants(7),
    sourceVendor: "YouTube Premium vendor",
    sourceUrl: "https://plati.market/itm/youtube-premium-1-year-no-login-required-warranty/5653070",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "zoom-workplace",
    title: "Zoom Workplace",
    categoryId: "software",
    shortDescription: "Cheapest vendor under Zoom product type.",
    priceNgn: toNgn(8),
    compareAtNgn: cmp(toNgn(8)),
    variants: ["Pro 1M", "Pro 3M", "Business 1M", "Business 12M"].map((v, i) => {
      const usd = [8, 21, 15, 90][i];
      const p = toNgn(usd);
      return { id: `z${i + 1}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Zoom vendor",
    sourceUrl: "https://plati.market/itm/zoom-workplace-pro-business-monthly-yearly-subscription-fast-delivery/3539717",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "adguard-vpn",
    title: "AdGuard VPN Premium",
    categoryId: "security",
    shortDescription: "Cheapest vendor under VPN product type.",
    priceNgn: toNgn(9),
    compareAtNgn: cmp(toNgn(9)),
    variants: ["1Y", "2Y", "3Y", "5Y"].map((v, i) => {
      const usd = [9, 15, 20, 28][i];
      const p = toNgn(usd);
      return { id: v.toLowerCase(), label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "AdGuard vendor",
    sourceUrl: "https://plati.market/itm/adguard-vpn-premium-5-year-key-activation/4534397",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "wow-time-card",
    title: "World of Warcraft Time Card",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under WoW product type.",
    priceNgn: toNgn(11),
    compareAtNgn: cmp(toNgn(11)),
    variants: ["30 Days", "60 Days", "90 Days", "180 Days"].map((v, i) => {
      const usd = [11, 20, 29, 55][i];
      const p = toNgn(usd);
      return { id: `d${[30,60,90,180][i]}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "WoW vendor",
    sourceUrl: "https://plati.market/itm/wow-world-of-warcraft-60-days-time-card-ru-eu-kz/3390567",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "valorant-points",
    title: "Valorant Points Card",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Valorant product type.",
    priceNgn: toNgn(5),
    compareAtNgn: cmp(toNgn(5)),
    variants: ["475 VP", "1000 VP", "2050 VP", "5350 VP"].map((v, i) => {
      const usd = [5, 9, 17, 42][i];
      const p = toNgn(usd);
      return { id: `vp-${[475,1000,2050,5350][i]}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Valorant vendor",
    sourceUrl: "https://plati.market/itm/karta-valorant-240-34800-vp-russia-cheap-gift/4531480",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "office-license",
    title: "Microsoft Office License",
    categoryId: "software",
    shortDescription: "Cheapest vendor under Office product type.",
    priceNgn: toNgn(8),
    compareAtNgn: cmp(toNgn(8)),
    variants: ["Office 2021", "Office 2024", "Office for Mac", "Lifetime"].map((v, i) => {
      const usd = [8, 12, 10, 20][i];
      const p = toNgn(usd);
      return { id: `off-${i + 1}`, label: v, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Office vendor",
    sourceUrl: "https://plati.market/itm/office-2024-21-19-16-windows-macos-microsoft-partner/3103245",
    btcEnabled: false,
    isActive: true,
  },
  {
    id: "fortnite-vbucks",
    title: "Fortnite V-Bucks",
    categoryId: "gaming",
    shortDescription: "Cheapest vendor under Fortnite product type.",
    priceNgn: toNgn(4),
    compareAtNgn: cmp(toNgn(4)),
    variants: ["1000", "2800", "5000", "13500"].map((v, i) => {
      const usd = [4, 10, 18, 42][i];
      const p = toNgn(usd);
      return { id: `vb-${v}`, label: `${v} V-Bucks`, priceNgn: p, compareAtNgn: cmp(p) };
    }),
    sourceVendor: "Fortnite vendor",
    sourceUrl: "https://plati.market/itm/fortnite-100-108000-v-bucks-turkey-epic-games/5676144",
    btcEnabled: false,
    isActive: true,
  },
];

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.WEB_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-token");
  res.end(JSON.stringify(body));
}

module.exports = (req, res) => {
  if (req.method === "OPTIONS") return sendJson(res, 200, { ok: true });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === "/health") {
    return sendJson(res, 200, { ok: true, service: "myri-api", ts: new Date().toISOString(), pricing: { fx: FX_NGN_PER_USD, markup: MARKUP, round: ROUND_BAND } });
  }
  if (path === "/categories") return sendJson(res, 200, categories);

  if (path === "/products") {
    const categoryId = url.searchParams.get("categoryId");
    const q = (url.searchParams.get("q") || "").toLowerCase();
    let items = products.filter((p) => p.isActive);
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
    if (q) items = items.filter((p) => p.title.toLowerCase().includes(q) || (p.shortDescription || "").toLowerCase().includes(q));
    return sendJson(res, 200, items);
  }

  if (path.startsWith("/products/")) {
    const id = path.split("/").pop();
    const item = products.find((p) => p.id === id && p.isActive);
    if (!item) return sendJson(res, 404, { error: "Not found" });
    return sendJson(res, 200, item);
  }

  return sendJson(res, 404, { error: "Not found" });
};
