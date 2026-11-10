const MIN_OTHERS = 1; // kailangan kahit 1 ibang produkto para may ihambing
const CHEAPER_RATIO = 0.9; // 10% pababa sa average = mas mura
const PRICIER_RATIO = 1.1; // 10% pataas sa average = mas mahal

function groupKey(p) {
  return `${(p.category || '').toLowerCase()}|${(p.unit || '').toLowerCase()}`;
}

function normalize(text) {
  return (text || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function buildPriceBenchmarks(products) {
  const groups = {};

  for (const p of products) {
    const price = Number(p.price);
    if (!(price > 0)) continue;

    const key = groupKey(p);
    if (!groups[key]) groups[key] = { sum: 0, count: 0 };
    groups[key].sum += price;
    groups[key].count += 1;
  }

  return groups;
}

export function comparePrice(product, benchmarks) {
  const price = Number(product.price);
  const group = benchmarks[groupKey(product)];

  if (!(price > 0) || !group || group.count - 1 < MIN_OTHERS) {
    return { status: 'none' };
  }

  // Average ng ibang produkto, hindi kasama ang sarili
  const avg = (group.sum - price) / (group.count - 1);
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