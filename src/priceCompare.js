const MIN_OTHERS = 1; // kailangan kahit 1 listing mula sa ibang farmer para may ihambing
const CHEAPER_RATIO = 0.9; // 10% pababa sa average = mas mura
const PRICIER_RATIO = 1.1; // 10% pataas sa average = mas mahal

function normalize(text) {
  return (text || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Parehong pangalan at unit lang ang pinagsasama
function groupKey(p) {
  return `${normalize(p.product_name)}|${normalize(p.unit)}`;
}

// Kinikilala ang farmer para hindi maikumpara ang sariling listing
function farmerKey(p) {
  return p.farmer_id != null ? `id:${p.farmer_id}` : `name:${normalize(p.farmer_name)}`;
}

export function buildPriceBenchmarks(products) {
  const groups = {};

  for (const p of products) {
    const price = Number(p.price);
    if (!(price > 0)) continue;

    const key = groupKey(p);
    if (!groups[key]) groups[key] = [];
    groups[key].push({ farmer: farmerKey(p), price });
  }

  return groups;
}

export function comparePrice(product, benchmarks) {
  const price = Number(product.price);
  if (!(price > 0)) return { status: 'none' };

  const entries = benchmarks[groupKey(product)] || [];
  const me = farmerKey(product);

  // Mga listing lang ng ibang farmer ang isasama
  const others = entries.filter((e) => e.farmer !== me);
  if (others.length < MIN_OTHERS) {
    return { status: 'none' };
  }

  const avg = others.reduce((sum, e) => sum + e.price, 0) / others.length;
  const ratio = price / avg;

  if (ratio <= CHEAPER_RATIO) {
    return { status: 'cheaper', avg, pct: Math.round((1 - ratio) * 100) };
  }
  if (ratio >= PRICIER_RATIO) {
    return { status: 'pricier', avg, pct: Math.round((ratio - 1) * 100) };
  }
  return { status: 'fair', avg };
}

// Hanapin ang parehong produkto (pangalan at unit) mula sa ibang farmer, mula pinakamura
export function findSameProducts(product, products) {
  const name = normalize(product.product_name);
  const unit = normalize(product.unit);

  return products
    .filter((p) => normalize(p.product_name) === name && normalize(p.unit) === unit)
    .sort((a, b) => Number(a.price) - Number(b.price));
}