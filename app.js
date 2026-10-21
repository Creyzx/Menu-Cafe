"use strict";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor kasir format internasional, tanpa tanda +.
const STORAGE_KEYS = {
  cart: "cafe-sore-cart-v1",
  table: "cafe-sore-table-v1",
  service: "cafe-sore-service-v1"
};

const menuItems = [
  { id: "toast-berry", name: "Berry French Toast", category: "Makanan", description: "Roti panggang, berries, dan sirup maple.", price: 32000, available: true, emoji: "🍞", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=700&q=80" },
  { id: "pasta-creamy", name: "Creamy Mushroom Pasta", category: "Makanan", description: "Pasta creamy dengan jamur yang gurih.", price: 42000, available: true, emoji: "🍝", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80" },
  { id: "chicken-rice", name: "Sunny Chicken Rice", category: "Makanan", description: "Ayam crispy, nasi hangat, saus spesial.", price: 38000, available: true, emoji: "🍗", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80" },
  { id: "matcha-cloud", name: "Matcha Cloud", category: "Minuman", description: "Matcha creamy dengan foam lembut.", price: 28000, available: true, emoji: "🍵", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80" },
  { id: "strawberry-milk", name: "Strawberry Milk", category: "Minuman", description: "Susu segar dan strawberry yang manis.", price: 25000, available: true, emoji: "🥛", image: "https://images.unsplash.com/photo-1553787499-6f913324f86b?auto=format&fit=crop&w=700&q=80" },
  { id: "lemon-tea", name: "Peachy Lemon Tea", category: "Minuman", description: "Teh lemon peach, segar banget!", price: 22000, available: false, emoji: "🍋", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=80" },
  { id: "waffle", name: "Choco Waffle Bites", category: "Camilan", description: "Waffle mini dengan cokelat lumer.", price: 26000, available: true, emoji: "🧇", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=700&q=80" },
  { id: "fries", name: "Crispy Fries", category: "Camilan", description: "Kentang renyah, taburan bumbu rahasia.", price: 20000, available: true, emoji: "🍟", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80" }
];

const state = {
  category: "Semua",
  query: "",
  cart: loadCart(),
  serviceCharge: localStorage.getItem(STORAGE_KEYS.service) === "true"
};

const elements = {
  grid: document.querySelector("#menuGrid"),
  emptyState: document.querySelector("#emptyState"),
  menuCount: document.querySelector("#menuCount"),
  search: document.querySelector("#menuSearch"),
  cartItems: document.querySelector("#cartItems"),
  cartEmpty: document.querySelector("#cartEmpty"),
  cartCount: document.querySelector("#cartCount"),
  mobileCartCount: document.querySelector("#mobileCartCount"),
  subtotal: document.querySelector("#subtotal"),
  serviceRow: document.querySelector("#serviceRow"),
  serviceAmount: document.querySelector("#serviceAmount"),
  serviceCheckbox: document.querySelector("#serviceCharge"),
  total: document.querySelector("#total"),
  mobileCartTotal: document.querySelector("#mobileCartTotal"),
  tableName: document.querySelector("#tableName"),
  whatsappOrder: document.querySelector("#whatsappOrder"),
  showSummary: document.querySelector("#showSummary"),
  summaryDialog: document.querySelector("#summaryDialog"),
  summaryContent: document.querySelector("#summaryContent"),
  toast: document.querySelector("#toast"),
  cartPanel: document.querySelector("#cartPanel"),
  openCart: document.querySelector("#openCart")
};

function loadCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "{}");
    if (!storedCart || typeof storedCart !== "object" || Array.isArray(storedCart)) return {};
    return Object.fromEntries(
      Object.entries(storedCart)
        .filter(([id, quantity]) => menuItems.some((item) => item.id === id) && Number.isInteger(quantity) && quantity > 0)
    );
  } catch (error) {
    console.warn("Data keranjang lokal tidak dapat dibaca; keranjang dimulai ulang.", error);
    return {};
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount).replace(/\u00a0/g, " ");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function filteredMenu() {
  const query = state.query.trim().toLocaleLowerCase("id-ID");
  return menuItems.filter((item) => {
    const categoryMatches = state.category === "Semua" || item.category === state.category;
    const queryMatches = !query || `${item.name} ${item.description} ${item.category}`.toLocaleLowerCase("id-ID").includes(query);
    return categoryMatches && queryMatches;
  });
}

function renderMenu() {
  const visibleItems = filteredMenu();
  elements.menuCount.textContent = `${visibleItems.length} menu`;
  elements.emptyState.hidden = visibleItems.length > 0;
  elements.grid.innerHTML = visibleItems.map((item) => `
    <article class="menu-card">
      <div class="card-image-wrap">
        <img class="card-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" data-fallback="./assets/menu-placeholder.svg">
        <span class="category-tag">${escapeHTML(item.category)}</span>
        <span class="availability ${item.available ? "" : "sold-out"}">${item.available ? "Tersedia" : "Habis"}</span>
      </div>
      <div class="card-copy">
        <div class="card-title-row"><h3 class="card-title">${escapeHTML(item.name)}</h3></div>
        <p class="card-description">${escapeHTML(item.description)}</p>
        <div class="card-bottom">
          <span class="card-price">${formatCurrency(item.price)}</span>
          <button class="add-button" type="button" data-add="${escapeHTML(item.id)}" ${item.available ? "" : "disabled"}>${item.available ? "+ Tambah" : "Habis"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ item: menuItems.find((menuItem) => menuItem.id === id), quantity }))
    .filter((entry) => entry.item);
}

function getTotals() {
  const subtotal = cartEntries().reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const service = state.serviceCharge ? Math.round(subtotal * 0.05) : 0;
  return { subtotal, service, total: subtotal + service };
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
}

function renderCart() {
  const entries = cartEntries();
  const quantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totals = getTotals();
  elements.cartCount.textContent = quantity;
  elements.mobileCartCount.textContent = quantity;
  elements.cartItems.hidden = entries.length === 0;
  elements.cartEmpty.hidden = entries.length > 0;
  elements.cartItems.innerHTML = entries.map(({ item, quantity: count }) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${escapeHTML(item.name)}</div>
        <div class="cart-item-price">${formatCurrency(item.price * count)}</div>
      </div>
      <div class="quantity-control" aria-label="${escapeHTML(item.name)}: jumlah ${count}">
        <button type="button" data-quantity="${escapeHTML(item.id)}" data-change="-1" aria-label="Kurangi ${escapeHTML(item.name)}">−</button>
        <span>${count}</span>
        <button type="button" data-quantity="${escapeHTML(item.id)}" data-change="1" aria-label="Tambah ${escapeHTML(item.name)}">+</button>
      </div>
    </div>
  `).join("");
  elements.subtotal.textContent = formatCurrency(totals.subtotal);
  elements.serviceAmount.textContent = formatCurrency(totals.service);
  elements.serviceRow.hidden = !state.serviceCharge;
  elements.total.textContent = formatCurrency(totals.total);
  elements.mobileCartTotal.textContent = formatCurrency(totals.total);
  elements.serviceCheckbox.checked = state.serviceCharge;
  elements.whatsappOrder.disabled = entries.length === 0;
  elements.showSummary.disabled = entries.length === 0;
}

function updateCart(id, change) {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  if (!item || !item.available) return;
  const nextQuantity = (state.cart[id] || 0) + change;
  if (nextQuantity > 0) state.cart[id] = nextQuantity;
  else delete state.cart[id];
  persistCart();
  renderCart();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
}

function orderDetails() {
  const table = elements.tableName.value.trim();
  const entries = cartEntries();
  const totals = getTotals();
  const lines = entries.map(({ item, quantity }) => `• ${item.name} x${quantity} — ${formatCurrency(item.price * quantity)}`);
  return { table, entries, totals, lines };
}

function buildWhatsAppMessage() {
  const { table, totals, lines } = orderDetails();
  return [
    "Halo Cafe Sore! Saya ingin memesan:",
    "",
    `Nama / meja: ${table || "-"}`,
    ...lines,
    "",
    `Subtotal: ${formatCurrency(totals.subtotal)}`,
    ...(state.serviceCharge ? [`Service charge (5%): ${formatCurrency(totals.service)}`] : []),
    `TOTAL ESTIMASI: ${formatCurrency(totals.total)}`,
    "",
    "Terima kasih!"
  ].join("\n");
}

function sendWhatsAppOrder() {
  if (!cartEntries().length) return;
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER === "6281234567890") {
    showToast("Atur nomor WhatsApp kasir di app.js sebelum mengirim pesanan.");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function showOrderSummary() {
  const { table, entries, totals } = orderDetails();
  if (!entries.length) return;
  const rows = entries.map(({ item, quantity }) => `
    <div class="summary-row"><span>${escapeHTML(item.name)} × ${quantity}</span><strong>${formatCurrency(item.price * quantity)}</strong></div>
  `).join("");
  elements.summaryContent.innerHTML = `
    <div class="summary-row"><span>Nama / meja</span><strong>${escapeHTML(table || "-")}</strong></div>
    ${rows}
    <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(totals.subtotal)}</strong></div>
    ${state.serviceCharge ? `<div class="summary-row"><span>Service charge (5%)</span><strong>${formatCurrency(totals.service)}</strong></div>` : ""}
    <div class="summary-row summary-grand"><span>Total estimasi</span><strong>${formatCurrency(totals.total)}</strong></div>
  `;
  elements.summaryDialog.showModal();
}

function setCartOpen(open) {
  document.body.classList.toggle("cart-open", open);
  elements.openCart.setAttribute("aria-expanded", String(open));
  elements.cartPanel.setAttribute("aria-hidden", String(!open && window.matchMedia("(max-width: 700px)").matches));
  if (open) document.querySelector("#closeCart").focus();
  else elements.openCart.focus();
}

document.querySelector(".category-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderMenu();
});

elements.search.addEventListener("input", () => {
  state.query = elements.search.value;
  renderMenu();
});

elements.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  updateCart(button.dataset.add, 1);
  const item = menuItems.find((menuItem) => menuItem.id === button.dataset.add);
  showToast(`${item.name} ditambahkan ke keranjang`);
});

elements.cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (button) updateCart(button.dataset.quantity, Number(button.dataset.change));
});

elements.serviceCheckbox.addEventListener("change", () => {
  state.serviceCharge = elements.serviceCheckbox.checked;
  localStorage.setItem(STORAGE_KEYS.service, String(state.serviceCharge));
  renderCart();
});

elements.tableName.value = localStorage.getItem(STORAGE_KEYS.table) || "";
elements.tableName.addEventListener("input", () => localStorage.setItem(STORAGE_KEYS.table, elements.tableName.value));
elements.whatsappOrder.addEventListener("click", sendWhatsAppOrder);
elements.showSummary.addEventListener("click", showOrderSummary);
elements.openCart.addEventListener("click", () => setCartOpen(true));
document.querySelector("#closeCart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cartBackdrop").addEventListener("click", () => setCartOpen(false));
document.querySelector("#closeSummary").addEventListener("click", () => elements.summaryDialog.close());
document.querySelector("#dismissSummary").addEventListener("click", () => elements.summaryDialog.close());

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
  if (event.key === "Escape" && document.body.classList.contains("cart-open")) setCartOpen(false);
});

document.querySelectorAll("#menuGrid").forEach((grid) => {
  grid.addEventListener("error", (event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.dataset.fallback && !image.dataset.fallbackApplied) {
      image.dataset.fallbackApplied = "true";
      image.src = image.dataset.fallback;
    }
  }, true);
});

renderMenu();
renderCart();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch((error) => console.error("Service Worker gagal didaftarkan:", error));
  });
}
