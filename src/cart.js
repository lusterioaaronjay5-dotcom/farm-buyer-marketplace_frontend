const KEY = 'cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find((i) => i.product_id === product.product_id);

  if (existing) {
    existing.quantity += quantity;
    // I-update ang larawan kung wala pa ito sa lumang cart item
    if (!existing.image_path && product.image_path) {
      existing.image_path = product.image_path;
    }
  } else {
    items.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: Number(product.price),
      unit: product.unit,
      farmer_name: product.farmer_name,
      image_path: product.image_path || '',
      quantity,
    });
  }

  saveCart(items);
}

export function updateQuantity(productId, quantity) {
  const items = getCart().map((i) =>
    i.product_id === productId ? { ...i, quantity } : i
  );
  saveCart(items);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.product_id !== productId));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}