// List of 100 Nasdaq 100 companies with real tickers and names
const baseConstituents = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Tech", month: 1 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Tech", month: 1 },
  { ticker: "NVDA", name: "Nvidia Corp.", sector: "Tech", month: 2 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Retail", month: 2 },
  { ticker: "META", name: "Meta Platforms Inc.", sector: "Tech", month: 1 },
  { ticker: "GOOGL", name: "Alphabet Inc. (Class A)", sector: "Tech", month: 1 },
  { ticker: "GOOG", name: "Alphabet Inc. (Class C)", sector: "Tech", month: 1 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Auto", month: 1 },
  { ticker: "AVGO", name: "Broadcom Inc.", sector: "Tech", month: 3 },
  { ticker: "COST", name: "Costco Wholesale Corp.", sector: "Retail", month: 3 },
  { ticker: "PEP", name: "PepsiCo Inc.", sector: "Food/Beverage", month: 2 },
  { ticker: "AMD", name: "Advanced Micro Devices Inc.", sector: "Tech", month: 2 },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Media", month: 1 },
  { ticker: "ADBE", name: "Adobe Inc.", sector: "Tech", month: 3 },
  { ticker: "CSCO", name: "Cisco Systems Inc.", sector: "Tech", month: 2 },
  { ticker: "QCOM", name: "Qualcomm Inc.", sector: "Tech", month: 2 },
  { ticker: "TMUS", name: "T-Mobile US Inc.", sector: "Tech", month: 2 },
  { ticker: "AMGN", name: "Amgen Inc.", sector: "Healthcare", month: 2 },
  { ticker: "INTU", name: "Intuit Inc.", sector: "Tech", month: 3 },
  { ticker: "CMCSA", name: "Comcast Corp.", sector: "Media", month: 1 },
  { ticker: "AMAT", name: "Applied Materials Inc.", sector: "Tech", month: 2 },
  { ticker: "PANW", name: "Palo Alto Networks Inc.", sector: "Tech", month: 2 },
  { ticker: "ISRG", name: "Intuitive Surgical Inc.", sector: "Healthcare", month: 1 },
  { ticker: "MU", name: "Micron Technology Inc.", sector: "Tech", month: 3 },
  { ticker: "TXN", name: "Texas Instruments Inc.", sector: "Tech", month: 1 },
  { ticker: "HON", name: "Honeywell International Inc.", sector: "Tech", month: 2 },
  { ticker: "SYK", name: "Stryker Corp.", sector: "Healthcare", month: 1 },
  { ticker: "LRCX", name: "Lam Research Corp.", sector: "Tech", month: 1 },
  { ticker: "BKNG", name: "Booking Holdings Inc.", sector: "Retail", month: 2 },
  { ticker: "GEHC", name: "GE HealthCare Technologies", sector: "Healthcare", month: 2 },
  { ticker: "MDLZ", name: "Mondelez International Inc.", sector: "Food/Beverage", month: 2 },
  { ticker: "VRTX", name: "Vertex Pharmaceuticals Inc.", sector: "Healthcare", month: 2 },
  { ticker: "REGN", name: "Regeneron Pharmaceuticals", sector: "Healthcare", month: 2 },
  { ticker: "ADP", name: "Automatic Data Processing", sector: "Tech", month: 1 },
  { ticker: "GILD", name: "Gilead Sciences Inc.", sector: "Healthcare", month: 2 },
  { ticker: "FISV", name: "Fiserv Inc.", sector: "Tech", month: 1 },
  { ticker: "SBUX", name: "Starbucks Corp.", sector: "Food/Beverage", month: 2 },
  { ticker: "PDD", name: "PDD Holdings Inc.", sector: "Retail", month: 3 },
  { ticker: "MELI", name: "MercadoLibre Inc.", sector: "Retail", month: 2 },
  { ticker: "KLAC", name: "KLA Corp.", sector: "Tech", month: 1 },
  { ticker: "INTC", name: "Intel Corp.", sector: "Tech", month: 1 },
  { ticker: "SNPS", name: "Synopsys Inc.", sector: "Tech", month: 3 },
  { ticker: "CDNS", name: "Cadence Design Systems", sector: "Tech", month: 2 },
  { ticker: "PYPL", name: "PayPal Holdings Inc.", sector: "Tech", month: 2 },
  { ticker: "NXPI", name: "NXP Semiconductors N.V.", sector: "Tech", month: 2 },
  { ticker: "MAR", name: "Marriott International", sector: "Retail", month: 2 },
  { ticker: "CTAS", name: "Cintas Corp.", sector: "Retail", month: 3 },
  { ticker: "ORLY", name: "O'Reilly Automotive Inc.", sector: "Retail", month: 2 },
  { ticker: "MCHP", name: "Microchip Technology Inc.", sector: "Tech", month: 2 },
  { ticker: "CRWD", name: "CrowdStrike Holdings", sector: "Tech", month: 3 },
  { ticker: "ROP", name: "Roper Technologies Inc.", sector: "Tech", month: 2 },
  { ticker: "ADSK", name: "Autodesk Inc.", sector: "Tech", month: 3 },
  { ticker: "FTNT", name: "Fortinet Inc.", sector: "Tech", month: 2 },
  { ticker: "LULU", name: "Lululemon Athletica Inc.", sector: "Retail", month: 3 },
  { ticker: "TEAM", name: "Atlassian Corp.", sector: "Tech", month: 2 },
  { ticker: "DDOG", name: "Datadog Inc.", sector: "Tech", month: 2 },
  { ticker: "MNST", name: "Monster Beverage Corp.", sector: "Food/Beverage", month: 3 },
  { ticker: "PCAR", name: "PACCAR Inc.", sector: "Auto", month: 2 },
  { ticker: "WBD", name: "Warner Bros. Discovery Inc.", sector: "Media", month: 2 },
  { ticker: "DXCM", name: "DexCom Inc.", sector: "Healthcare", month: 2 },
  { ticker: "EXC", name: "Exelon Corp.", sector: "Auto", month: 2 },
  { ticker: "BKR", name: "Baker Hughes Co.", sector: "Auto", month: 1 },
  { ticker: "KDP", name: "Keurig Dr Pepper Inc.", sector: "Food/Beverage", month: 2 },
  { ticker: "PAYX", name: "Paychex Inc.", sector: "Tech", month: 3 },
  { ticker: "ROST", name: "Ross Stores Inc.", sector: "Retail", month: 3 },
  { ticker: "EA", name: "Electronic Arts Inc.", sector: "Media", month: 2 },
  { ticker: "AEP", name: "American Electric Power", sector: "Auto", month: 2 },
  { ticker: "ANSS", name: "ANSYS Inc.", sector: "Tech", month: 2 },
  { ticker: "FAST", name: "Fastenal Co.", sector: "Retail", month: 1 },
  { ticker: "GE", name: "GE Aerospace", sector: "Tech", month: 1 },
  { ticker: "ODFL", name: "Old Dominion Freight Line", sector: "Retail", month: 2 },
  { ticker: "CSX", name: "CSX Corp.", sector: "Retail", month: 1 },
  { ticker: "CPRT", name: "Copart Inc.", sector: "Retail", month: 3 },
  { ticker: "IDXX", name: "IDEXX Laboratories Inc.", sector: "Healthcare", month: 2 },
  { ticker: "VRSK", name: "Verisk Analytics Inc.", sector: "Tech", month: 2 },
  { ticker: "EXPD", name: "Expeditors International", sector: "Retail", month: 2 },
  { ticker: "CHTR", name: "Charter Communications Inc.", sector: "Media", month: 1 },
  { ticker: "KLA", name: "KLA Corp. (Duplicate)", sector: "Tech", month: 1 },
  { ticker: "INCY", name: "Incyte Corp.", sector: "Healthcare", month: 2 },
  { ticker: "MRNA", name: "Moderna Inc.", sector: "Healthcare", month: 2 },
  { ticker: "BIIB", name: "Biogen Inc.", sector: "Healthcare", month: 2 },
  { ticker: "WBA", name: "Walgreens Boots Alliance", sector: "Retail", month: 3 },
  { ticker: "ALGN", name: "Align Technology Inc.", sector: "Healthcare", month: 2 },
  { ticker: "EBAY", name: "eBay Inc.", sector: "Retail", month: 2 },
  { ticker: "KHC", name: "Kraft Heinz Co.", sector: "Food/Beverage", month: 2 },
  { ticker: "ZM", name: "Zoom Video Communications", sector: "Tech", month: 3 },
  { ticker: "WDAY", name: "Workday Inc.", sector: "Tech", month: 3 },
  { ticker: "SPLK", name: "Splunk Inc.", sector: "Tech", month: 3 },
  { ticker: "DLTR", name: "Dollar Tree Inc.", sector: "Retail", month: 3 },
  { ticker: "MDB", name: "MongoDB Inc.", sector: "Tech", month: 3 },
  { ticker: "OKTA", name: "Okta Inc.", sector: "Tech", month: 3 },
  { ticker: "ALNY", name: "Alnylam Pharmaceuticals", sector: "Healthcare", month: 2 },
  { ticker: "CTSH", name: "Cognizant Technology Solutions", sector: "Tech", month: 2 },
  { ticker: "WIX", name: "Wix.com Ltd.", sector: "Tech", month: 2 },
  { ticker: "ILMN", name: "Illumina Inc.", sector: "Healthcare", month: 2 },
  { ticker: "BMRN", name: "BioMarin Pharmaceutical", sector: "Healthcare", month: 2 },
  { ticker: "FSLR", name: "First Solar Inc.", sector: "Tech", month: 2 },
  { ticker: "ENPH", name: "Enphase Energy Inc.", sector: "Tech", month: 2 },
  { ticker: "ZS", name: "Zscaler Inc.", sector: "Tech", month: 3 },
  { ticker: "DOCU", name: "DocuSign Inc.", sector: "Tech", month: 3 }
];

// Helper to generate seed-based random numbers so stats are stable but look realistic
const createRandomGenerator = (seedString) => {
  let h = 0;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(31, h) + seedString.charCodeAt(i) | 0;
  }
  return () => {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Procedural generator to expand base constituents into rich 100 stock profiles
export const stocksData = baseConstituents.map((item, idx) => {
  const rand = createRandomGenerator(item.ticker);
  
  // 1. Generate pricing metrics
  const basePrice = Math.round(30 + rand() * 800);
  const changeM = Math.round((-8 + rand() * 16) * 10) / 10;
  const changeQ = Math.round((-15 + rand() * 40) * 10) / 10;
  const changeY = Math.round((-20 + rand() * 100) * 10) / 10;
  const change5Y = Math.round((20 + rand() * 800) * 10) / 10;

  // 2. Determine vitals
  const revenueGrowthYes = changeQ > 0;
  const profitMarginVal = Math.round(2 + rand() * 45);
  const profitMarginYes = profitMarginVal > 8; // high margins are positive
  const analystConsensus = changeY > 15 ? 'up' : 'down';

  // 3. Build sector logos and summaries
  let logoBg = "linear-gradient(135deg, #4f46e5, #06b6d4)";
  let vibe = "";
  let gossip = "";
  let trivia = "";

  if (item.sector === 'Tech') {
    logoBg = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
    vibe = `They write code, build chips, and cloud infrastructures. If your gadgets do something smart, ${item.name} is probably licensing the tech behind it.`;
    gossip = revenueGrowthYes 
      ? `AI cloud integrations are driving margins to the moon, though research budgets are raising eyebrows.`
      : `Struggling to shift legacy licenses, leading to cost cuts and a focus on operational consolidation.`;
    trivia = `Founded in a garage during a previous tech boom, they are now valued higher than several sovereign nations combined.`;
  } else if (item.sector === 'Retail') {
    logoBg = "linear-gradient(135deg, #3b82f6, #06b6d4)";
    vibe = `They sell goods, logistics, or physical items. They excel at scaling warehouses, shipping goods, and capturing consumer wallets.`;
    gossip = profitMarginYes 
      ? `Their membership and subscription models are printing cash, offsetting rising fuel and shipping costs.`
      : `Inventory backlogs and supply-chain friction are pinching margins this quarter. Raising retail prices next month.`;
    trivia = `Originally started with just one location in a strip mall, they now serve over 15 million customers daily.`;
  } else if (item.sector === 'Food/Beverage') {
    logoBg = "linear-gradient(135deg, #f59e0b, #d97706)";
    vibe = `They feed your cravings and supply grocery shelves. A giant consumer brand built on brand loyalty and recurring snack runs.`;
    gossip = `Raising box and bottle prices has kept profits steady, despite consumers buying slightly less quantity overall.`;
    trivia = `One of their primary subsidiaries was once traded to a foreign navy in exchange for massive shipments of soft drinks.`;
  } else if (item.sector === 'Healthcare') {
    logoBg = "linear-gradient(135deg, #ec4899, #f43f5e)";
    vibe = `They develop treatments, diagnostics, and medical systems. They translate biology and genetic codes into health solutions.`;
    gossip = revenueGrowthYes 
      ? `Their new pipelines got FDA approvals, promising a strong royalty stream for the next ten years.`
      : `Patents expiring on their legacy blockbusters has triggered a race to acquire smaller biotech companies.`;
    trivia = `The founders named the ticker symbols before they even had a working drug in clinical trials.`;
  } else if (item.sector === 'Auto') {
    logoBg = "linear-gradient(135deg, #14b8a6, #0f766e)";
    vibe = `They build components, vehicles, or logistics infrastructure. Moving heavy objects efficiently is their core superpower.`;
    gossip = changeQ > 5 
      ? `Electric and autonomous integrations are boosting valuation premiums, keeping shorts in check.`
      : `Deliveries hit speed bumps due to chip backlogs, forcing them to discount older inventory.`;
    trivia = `Their automated gigafactories can stamp and assemble a vehicle frame in under a minute.`;
  } else {
    // Media / default
    logoBg = "linear-gradient(135deg, #f43f5e, #be123c)";
    vibe = `They capture eyeballs, host shows, and stream video content. Their currency is your attention span and recurring monthly memberships.`;
    gossip = `Password enforcement and cheaper ad-supported tiers are driving a massive influx of memberships, beating targets.`;
    trivia = `They started as a mail-order service and were once rejected for acquisition by a major video rental chain.`;
  }

  // 4. Generate new flashcard parameters
  let peRatio = 0;
  if (item.sector === 'Tech') {
    peRatio = Math.round((22 + rand() * 45) * 10) / 10;
  } else if (item.sector === 'Retail') {
    peRatio = Math.round((18 + rand() * 32) * 10) / 10;
  } else {
    peRatio = Math.round((10 + rand() * 18) * 10) / 10;
  }
  
  const eps = Math.round((basePrice / peRatio) * 100) / 100;
  
  let marketCap = '';
  if (['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'AMZN', 'META'].includes(item.ticker)) {
    const capNum = Math.round((1.5 + rand() * 1.8) * 100) / 100;
    marketCap = `${capNum}T`;
  } else {
    const capNum = Math.round(30 + rand() * 580);
    marketCap = `${capNum}B`;
  }
  
  let divYield = 0;
  if (['Food/Beverage', 'Retail'].includes(item.sector)) {
    divYield = Math.round((1.2 + rand() * 3.8) * 100) / 100;
  } else {
    divYield = Math.round((0 + rand() * 1.2) * 100) / 100;
  }
  
  const roe = Math.round((8 + rand() * 35) * 10) / 10;
  const debtToEquity = Math.round((0.15 + rand() * 2.2) * 100) / 100;

  return {
    id: item.ticker.toLowerCase(),
    ticker: item.ticker,
    name: item.name,
    sector: item.sector,
    logoBg,
    earningsMonth: item.month,
    vibeCheck: vibe,
    vitals: {
      revenueGrowth: `${revenueGrowthYes ? '+' : ''}${changeQ}%`,
      revenueGrowthYes,
      profitMargin: `${profitMarginVal}%`,
      profitMarginYes,
      analystConsensus
    },
    gossip,
    trivia,
    // Expansion Metrics
    lastPrice: basePrice,
    changeMonth: changeM,
    changeQuarter: changeQ,
    changeYear: changeY,
    change5Years: change5Y,
    price1MonthAgo: Math.round((basePrice / (1 + changeM / 100)) * 100) / 100,
    price1QuarterAgo: Math.round((basePrice / (1 + changeQ / 100)) * 100) / 100,
    price1YearAgo: Math.round((basePrice / (1 + changeY / 100)) * 100) / 100,
    price5YearsAgo: Math.round((basePrice / (1 + change5Y / 100)) * 100) / 100,
    // Flashcard metrics
    peRatio,
    eps,
    marketCap,
    divYield,
    roe,
    debtToEquity
  };
});
