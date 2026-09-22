/*
 * STACK SHOP FRONTEND
 * Backend base URL: http://localhost:4000
 *
 * Routes used:
 * POST   /user/signup
 * POST   /user/signin
 * GET    /product
 * POST   /product/add
 * DELETE /product/remove
 * PUT    /product/update
 * POST   /cart/add
 * GET    /cart/add/:id
 * DELETE /cart/remove
 * PUT    /cart/update
 */

const API_BASE = "http://localhost:4000";

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("stack_cart") || "[]"),
  user: JSON.parse(localStorage.getItem("stack_user") || "null"),
  token: localStorage.getItem("stack_token") || "",
  page: "shop",
  search: ""
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindEvents();

  if (state.token || state.user) {
    showStore();
    loadProducts();
  } else {
    showAuth();
  }

  updateCartUI();
}

function bindEvents() {
  $$(".auth-tab").forEach(btn => {
    btn.addEventListener("click", () => switchAuth(btn.dataset.authTab));
  });

  $("#signin-form").addEventListener("submit", signIn);
  $("#signup-form").addEventListener("submit", signUp);
  $("#logout-btn").addEventListener("click", logout);

  document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      event.preventDefault();
      navigate(pageButton.dataset.page);
    }

    const addButton = event.target.closest("[data-add-cart]");
    if (addButton) addToCart(addButton.dataset.addCart);

    const removeButton = event.target.closest("[data-remove-cart]");
    if (removeButton) removeFromCart(removeButton.dataset.removeCart);

    const qtyButton = event.target.closest("[data-change-qty]");
    if (qtyButton) {
      changeQuantity(qtyButton.dataset.changeQty, Number(qtyButton.dataset.delta));
    }
  });

  $("#product-search").addEventListener("input", (event) => {
    state.search = event.target.value.toLowerCase().trim();
    renderProducts();
  });

  $("#open-add-product").addEventListener("click", () => $("#product-modal").classList.remove("hidden"));
  $("#close-product-modal").addEventListener("click", closeProductModal);
  $("#product-modal").addEventListener("click", (event) => {
    if (event.target.id === "product-modal") closeProductModal();
  });
  $("#product-form").addEventListener("submit", addProduct);
  $("#checkout-btn").addEventListener("click", () => {
    toast("No checkout endpoint was supplied by the backend yet.");
  });
}

/* ---------- Authentication ---------- */

function switchAuth(type) {
  $$(".auth-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.authTab === type));
  $("#signin-form").classList.toggle("hidden", type !== "signin");
  $("#signup-form").classList.toggle("hidden", type !== "signup");
}

async function signUp(event) {
  event.preventDefault();

  const body = {
    email: $("#signup-email").value.trim(),
    name: $("#signup-name").value.trim(),
    password: $("#signup-password").value
  };

  try {
    const data = await apiFetch("/user/signup", {
      method: "POST",
      body: JSON.stringify(body)
    });

    toast(data.message || "Account created. Check your email for the OTP.");
    $("#signup-form").reset();
    switchAuth("signin");
  } catch (error) {
    toast(error.message, true);
  }
}

async function signIn(event) {
  event.preventDefault();

  const body = {
    email: $("#signin-email").value.trim(),
    password: $("#signin-password").value
  };

  try {
    const data = await apiFetch("/user/signin", {
      method: "POST",
      body: JSON.stringify(body)
    });

    // Supports common backend response names: token / accessToken / jwt.
    const token = data.token || data.accessToken || data.jwt || "";

    state.token = token;
    state.user = data.user || {
      name: body.email.split("@")[0],
      email: body.email
    };

    if (token) localStorage.setItem("stack_token", token);
    localStorage.setItem("stack_user", JSON.stringify(state.user));

    toast(data.message || "Signed in successfully.");
    $("#signin-form").reset();
    showStore();
    await loadProducts();
  } catch (error) {
    toast(error.message, true);
  }
}

function logout() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("stack_token");
  localStorage.removeItem("stack_user");
  showAuth();
  toast("You have been logged out.");
}

function showAuth() {
  $("#auth-view").classList.remove("hidden");
  $("#store-view").classList.add("hidden");
}

function showStore() {
  $("#auth-view").classList.add("hidden");
  $("#store-view").classList.remove("hidden");
  $("#user-name").textContent = state.user?.name || state.user?.email || "";
}

/* ---------- API helper ---------- */

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // If your Express middleware checks JWT, this sends it automatically.
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }

  return data;
}

/* ---------- Navigation ---------- */

function navigate(page) {
  state.page = page;

  $("#shop-page").classList.toggle("hidden", page !== "shop");
  $("#cart-page").classList.toggle("hidden", page !== "cart");

  $$(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));

  if (page === "cart") renderCart();
}

/* ---------- Products ---------- */

async function loadProducts() {
  $("#product-grid").innerHTML = `<div class="loading">Loading products...</div>`;

  try {
    const data = await apiFetch("/product");

    // Accept either a raw array or common wrapper shapes.
    state.products = Array.isArray(data)
      ? data
      : (data.products || data.data || []);

    renderProducts();
  } catch (error) {
    $("#product-grid").innerHTML = `
      <div class="empty-state">
        <strong>Could not load products.</strong>
        <p>${escapeHTML(error.message)}</p>
        <button class="outline-btn" onclick="loadProducts()">Try again</button>
      </div>
    `;
  }
}

function renderProducts() {
  const filtered = state.products.filter(product => {
    const searchable = [
      product.title,
      product.name,
      product.category,
      product.description
    ].join(" ").toLowerCase();

    return searchable.includes(state.search);
  });

  $("#product-count").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;

  if (!filtered.length) {
    $("#product-grid").innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  $("#product-grid").innerHTML = filtered.map(productCard).join("");
}

function productCard(product) {
  const id = getProductId(product);
  const title = product.title || product.name || "Untitled product";
  const image = product.image || product.imageUrl || product.img || "";
  const quantity = Number(product.quantity ?? product.stock ?? 0);
  const price = Number(product.price || 0);

  return `
    <article class="product-card">
      <div class="product-visual">
        ${image
          ? `<img src="${escapeAttribute(image)}" alt="${escapeAttribute(title)}" loading="lazy">`
          : `<span class="product-placeholder">${escapeHTML(title.charAt(0).toUpperCase())}</span>`
        }
      </div>
      <span class="product-category">${escapeHTML(product.category || "Product")}</span>
      <h4 title="${escapeAttribute(title)}">${escapeHTML(title)}</h4>
      <p class="product-description">${escapeHTML(product.description || "No description available.")}</p>
      <div class="product-bottom">
        <span class="price">${formatPrice(price)}</span>
        <button class="add-cart"
          data-add-cart="${escapeAttribute(id)}"
          aria-label="Add ${escapeAttribute(title)} to cart"
          ${quantity <= 0 ? "disabled" : ""}>+</button>
      </div>
    </article>
  `;
}

async function addProduct(event) {
  event.preventDefault();

  const body = {
    title: $("#product-title").value.trim(),
    price: Number($("#product-price").value),
    description: $("#product-description").value.trim(),
    category: $("#product-category").value.trim(),
    quantity: Number($("#product-quantity").value)
  };

  try {
    const data = await apiFetch("/product/add", {
      method: "POST",
      body: JSON.stringify(body)
    });

    toast(data.message || "Product added.");
    $("#product-form").reset();
    closeProductModal();
    await loadProducts();
  } catch (error) {
    toast(error.message, true);
  }
}

/* ---------- Cart ---------- */

/*
 * The supplied backend does not expose GET /cart.
 * Therefore the frontend keeps cart product IDs + quantities in localStorage.
 * Add/remove/update actions are also sent to the exact backend routes.
 *
 * The GET /cart/add/:id endpoint is available if you later want to replace
 * the local cache with server-side cart retrieval.
 */
async function addToCart(productId) {
  const product = state.products.find(item => getProductId(item) === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.productId === productId);

  try {
    await apiFetch("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId })
    });

    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        productId,
        quantity: 1,
        product
      });
    }

    saveCart();
    updateCartUI();
    toast(`${product.title || product.name || "Product"} added to cart.`);
  } catch (error) {
    toast(error.message, true);
  }
}

async function removeFromCart(productId) {
  try {
    await apiFetch("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({ productId })
    });

    state.cart = state.cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartUI();
    renderCart();
    toast("Item removed from cart.");
  } catch (error) {
    toast(error.message, true);
  }
}

async function changeQuantity(productId, delta) {
  const item = state.cart.find(cartItem => cartItem.productId === productId);
  if (!item) return;

  const newQuantity = item.quantity + delta;
  if (newQuantity < 1) {
    await removeFromCart(productId);
    return;
  }

  try {
    await apiFetch("/cart/update", {
      method: "PUT",
      body: JSON.stringify({
        productId,
        quantity: newQuantity
      })
    });

    item.quantity = newQuantity;
    saveCart();
    updateCartUI();
    renderCart();
  } catch (error) {
    toast(error.message, true);
  }
}

function renderCart() {
  const container = $("#cart-items");

  if (!state.cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Your cart is empty.</strong>
        <p>Add products from the catalog to see them here.</p>
        <button class="outline-btn" data-page="shop">Browse products</button>
      </div>
    `;
    updateSummary();
    return;
  }

  container.innerHTML = state.cart.map(item => {
    const product = item.product || {};
    const title = product.title || product.name || "Product";
    const image = product.image || product.imageUrl || product.img || "";
    const price = Number(product.price || 0);

    return `
      <article class="cart-item">
        <div class="cart-thumb">
          ${image
            ? `<img src="${escapeAttribute(image)}" alt="${escapeAttribute(title)}">`
            : `<span class="product-placeholder">${escapeHTML(title.charAt(0).toUpperCase())}</span>`
          }
        </div>
        <div>
          <h4>${escapeHTML(title)}</h4>
          <p>${formatPrice(price)} each</p>
          <div class="qty">
            <button data-change-qty="${escapeAttribute(item.productId)}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <strong>${item.quantity}</strong>
            <button data-change-qty="${escapeAttribute(item.productId)}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn" data-remove-cart="${escapeAttribute(item.productId)}">Remove</button>
        </div>
        <div class="item-total">${formatPrice(price * item.quantity)}</div>
      </article>
    `;
  }).join("");

  updateSummary();
}

function updateCartUI() {
  const count = state.cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  $$(".cart-count").forEach(element => element.textContent = count);
  if (state.page === "cart") renderCart();
}

function updateSummary() {
  const count = state.cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const total = state.cart.reduce((sum, item) => {
    return sum + Number(item.product?.price || 0) * Number(item.quantity || 0);
  }, 0);

  $("#summary-items").textContent = count;
  $("#summary-total").textContent = formatPrice(total);
}

function saveCart() {
  localStorage.setItem("stack_cart", JSON.stringify(state.cart));
}

/* ---------- Helpers ---------- */

function getProductId(product) {
  return String(product._id || product.id || product.productId || "");
}

function formatPrice(value) {
  // Change this to your backend's currency if needed.
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function closeProductModal() {
  $("#product-modal").classList.add("hidden");
}

function toast(message, isError = false) {
  const element = document.createElement("div");
  element.className = `toast${isError ? " error" : ""}`;
  element.textContent = message || "Something happened.";
  $("#toast-container").appendChild(element);

  setTimeout(() => element.remove(), 3500);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}
