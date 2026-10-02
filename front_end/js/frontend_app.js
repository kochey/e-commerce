/*
 * STACK SHOP FRONTEND
 *
 * Backend:
 * https://e-commerce-k3j3.onrender.com
 *
 * Routes:
 *
 * POST   /user/signup
 * POST   /user/signin
 *
 * GET    /product
 * POST   /product/add
 * DELETE /product/remove
 * PUT    /product/update
 *
 * POST   /cart/add
 * GET    /cart/add/:id
 * DELETE /cart/remove
 * PUT    /cart/update
 */

const API_BASE = "https://e-commerce-k3j3.onrender.com";


/* ================= STATE ================= */

const state = {

  products: [],

  cart: JSON.parse(
    localStorage.getItem("stack_cart") || "[]"
  ),

  user: JSON.parse(
    localStorage.getItem("stack_user") || "null"
  ),

  token: localStorage.getItem("stack_token") || "",

  page: "shop",

  search: ""

};


/* ================= HELPERS ================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


document.addEventListener(
  "DOMContentLoaded",
  init
);


/* ================= INIT ================= */

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


/* ================= EVENTS ================= */

function bindEvents() {

  /* Auth tabs */

  $$(".auth-tab").forEach(button => {

    button.addEventListener(
      "click",
      () => switchAuth(button.dataset.authTab)
    );

  });


  /* Forms */

  $("#signin-form")
    .addEventListener("submit", signIn);

  $("#signup-form")
    .addEventListener("submit", signUp);


  /* Logout */

  $("#logout-btn")
    .addEventListener("click", logout);


  /* Navigation + cart */

  document.addEventListener("click", event => {

    const pageButton =
      event.target.closest("[data-page]");

    if (pageButton) {

      event.preventDefault();

      navigate(pageButton.dataset.page);

    }


    const addButton =
      event.target.closest("[data-add-cart]");

    if (addButton) {

      addToCart(
        addButton.dataset.addCart
      );

    }


    const removeButton =
      event.target.closest("[data-remove-cart]");

    if (removeButton) {

      removeFromCart(
        removeButton.dataset.removeCart
      );

    }


    const qtyButton =
      event.target.closest("[data-change-qty]");

    if (qtyButton) {

      changeQuantity(
        qtyButton.dataset.changeQty,
        Number(qtyButton.dataset.delta)
      );

    }

  });


  /* Search */

  $("#product-search")
    .addEventListener("input", event => {

      state.search =
        event.target.value
          .toLowerCase()
          .trim();

      renderProducts();

    });


  /* Add product modal */

  $("#open-add-product")
    .addEventListener("click", () => {

      $("#product-modal")
        .classList
        .remove("hidden");

    });


  $("#close-product-modal")
    .addEventListener(
      "click",
      closeProductModal
    );


  $("#product-modal")
    .addEventListener("click", event => {

      if (
        event.target.id === "product-modal"
      ) {

        closeProductModal();

      }

    });


  /* Add product */

  $("#product-form")
    .addEventListener(
      "submit",
      addProduct
    );


  /* Image preview */

  $("#product-img")
    .addEventListener(
      "input",
      previewImage
    );


  /* Checkout */

  $("#checkout-btn")
    .addEventListener("click", () => {

      toast(
        "No checkout endpoint was supplied by the backend yet."
      );

    });

}


/* ================= AUTHENTICATION ================= */

function switchAuth(type) {

  $$(".auth-tab").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.authTab === type
    );

  });


  $("#signin-form")
    .classList
    .toggle(
      "hidden",
      type !== "signin"
    );


  $("#signup-form")
    .classList
    .toggle(
      "hidden",
      type !== "signup"
    );

}


/* SIGN UP */

async function signUp(event) {

  event.preventDefault();


  const body = {

    email:
      $("#signup-email")
        .value
        .trim(),

    name:
      $("#signup-name")
        .value
        .trim(),

    password:
      $("#signup-password")
        .value

  };


  try {

    const data =
      await apiFetch(
        "/user/signup",
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );


    toast(
      data.message ||
      "Account created."
    );


    $("#signup-form").reset();

    switchAuth("signin");


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* SIGN IN */

async function signIn(event) {

  event.preventDefault();


  const body = {

    email:
      $("#signin-email")
        .value
        .trim(),

    password:
      $("#signin-password")
        .value

  };


  try {

    const data =
      await apiFetch(
        "/user/signin",
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );


    const token =
      data.token ||
      data.accessToken ||
      data.jwt ||
      "";


    state.token = token;


    state.user =
      data.user || {

        name:
          body.email.split("@")[0],

        email:
          body.email

      };


    if (token) {

      localStorage.setItem(
        "stack_token",
        token
      );

    }


    localStorage.setItem(
      "stack_user",
      JSON.stringify(state.user)
    );


    toast(
      data.message ||
      "Signed in successfully."
    );


    $("#signin-form").reset();


    showStore();

    await loadProducts();


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* LOGOUT */

function logout() {

  state.token = "";

  state.user = null;


  localStorage.removeItem(
    "stack_token"
  );

  localStorage.removeItem(
    "stack_user"
  );


  showAuth();

  toast(
    "You have been logged out."
  );

}


function showAuth() {

  $("#auth-view")
    .classList
    .remove("hidden");

  $("#store-view")
    .classList
    .add("hidden");

}


function showStore() {

  $("#auth-view")
    .classList
    .add("hidden");

  $("#store-view")
    .classList
    .remove("hidden");


  $("#user-name").textContent =
    state.user?.name ||
    state.user?.email ||
    "";

}


/* ================= API ================= */

async function apiFetch(
  path,
  options = {}
) {

  const headers = {

    "Content-Type":
      "application/json",

    ...(options.headers || {})

  };


  if (state.token) {

    headers.Authorization =
      `Bearer ${state.token}`;

  }


  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers
      }
    );


  const raw =
    await response.text();


  let data = {};


  try {

    data =
      raw
        ? JSON.parse(raw)
        : {};

  } catch {

    data = {
      message: raw
    };

  }


  if (!response.ok) {

    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );

  }


  return data;

}


/* ================= NAVIGATION ================= */

function navigate(page) {

  state.page = page;


  $("#shop-page")
    .classList
    .toggle(
      "hidden",
      page !== "shop"
    );


  $("#cart-page")
    .classList
    .toggle(
      "hidden",
      page !== "cart"
    );


  $$(".nav-link").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === page
    );

  });


  if (page === "cart") {

    renderCart();

  }

}


/* ================= PRODUCTS ================= */

async function loadProducts() {

  $("#product-grid").innerHTML =
    `<div class="loading">
      Loading products...
    </div>`;


  try {

    const data =
      await apiFetch("/product");


    state.products =
      Array.isArray(data)
        ? data
        : (
            data.products ||
            data.data ||
            []
          );


    renderProducts();


  } catch (error) {

    $("#product-grid").innerHTML = `

      <div class="empty-state">

        <strong>
          Could not load products.
        </strong>

        <p>
          ${escapeHTML(error.message)}
        </p>

        <button
          class="outline-btn"
          onclick="loadProducts()"
        >
          Try again
        </button>

      </div>

    `;

  }

}


/* RENDER PRODUCTS */

function renderProducts() {

  const filtered =
    state.products.filter(product => {

      const searchable = [

        product.title,

        product.name,

        product.category,

        product.description

      ]
        .join(" ")
        .toLowerCase();


      return searchable.includes(
        state.search
      );

    });


  $("#product-count").textContent =

    `${filtered.length} product${
      filtered.length === 1
        ? ""
        : "s"
    }`;


  if (!filtered.length) {

    $("#product-grid").innerHTML = `

      <div class="empty-state">
        No products found.
      </div>

    `;

    return;

  }


  $("#product-grid").innerHTML =
    filtered
      .map(productCard)
      .join("");

}


/* PRODUCT CARD */

function productCard(product) {

  const id =
    getProductId(product);


  const title =
    product.title ||
    product.name ||
    "Untitled product";


  /*
   * IMPORTANT:
   *
   * Your MongoDB product model uses:
   *
   * img: String
   *
   * So product.img is used here.
   */

  const image =
    product.img ||
    product.image ||
    product.imageUrl ||
    "";


  const quantity =
    Number(
      product.quantity ??
      product.stock ??
      0
    );


  const price =
    Number(
      product.price || 0
    );


  return `

    <article class="product-card">

      <div class="product-visual">

        ${
          image

          ?

          `
          <img
            src="${escapeAttribute(image)}"
            alt="${escapeAttribute(title)}"
            loading="lazy"
          >
          `

          :

          `
          <span class="product-placeholder">
            ${escapeHTML(
              title
                .charAt(0)
                .toUpperCase()
            )}
          </span>
          `
        }

      </div>


      <span class="product-category">
        ${escapeHTML(
          product.category ||
          "Product"
        )}
      </span>


      <h4
        title="${escapeAttribute(title)}"
      >
        ${escapeHTML(title)}
      </h4>


      <p class="product-description">
        ${escapeHTML(
          product.description ||
          "No description available."
        )}
      </p>


      <div class="product-bottom">

        <span class="price">
          ${formatPrice(price)}
        </span>


        <button
          class="add-cart"
          data-add-cart="${escapeAttribute(id)}"
          aria-label="Add ${escapeAttribute(title)} to cart"
          ${quantity <= 0 ? "disabled" : ""}
        >
          +
        </button>

      </div>

    </article>

  `;

}


/* ================= ADD PRODUCT ================= */

async function addProduct(event) {

  event.preventDefault();


  const body = {

    title:
      $("#product-title")
        .value
        .trim(),

    price:
      Number(
        $("#product-price").value
      ),

    description:
      $("#product-description")
        .value
        .trim(),

    category:
      $("#product-category")
        .value
        .trim(),

    quantity:
      Number(
        $("#product-quantity")
          .value
      ),

    /*
     * THIS SENDS THE IMAGE URL
     * TO YOUR BACKEND.
     */

    img:
      $("#product-img")
        .value
        .trim()

  };


  try {

    const data =
      await apiFetch(
        "/product/add",
        {
          method: "POST",

          body:
            JSON.stringify(body)

        }
      );


    toast(
      data.message ||
      "Product added."
    );


    $("#product-form").reset();


    $("#image-preview").innerHTML =
      "<span>Image preview</span>";


    closeProductModal();


    await loadProducts();


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* ================= IMAGE PREVIEW ================= */

function previewImage(event) {

  const url =
    event.target.value.trim();


  const preview =
    $("#image-preview");


  if (!url) {

    preview.innerHTML =
      "<span>Image preview</span>";

    return;

  }


  preview.innerHTML = `

    <img
      src="${escapeAttribute(url)}"
      alt="Product preview"
      onerror="this.style.display='none'; this.parentElement.innerHTML='<span>Invalid image URL</span>'"
    >

  `;

}


/* ================= CART ================= */

async function addToCart(productId) {

  const product =
    state.products.find(
      item =>
        getProductId(item) === productId
    );


  if (!product) return;


  const existing =
    state.cart.find(
      item =>
        item.productId === productId
    );


  try {

    await apiFetch(
      "/cart/add",
      {
        method: "POST",

        body:
          JSON.stringify({
            productId
          })

      }
    );


    if (existing) {

      existing.quantity += 1;

    } else {

      state.cart.push({

        productId,

        quantity: 1,

        /*
         * Save the complete product,
         * including img.
         */

        product

      });

    }


    saveCart();

    updateCartUI();


    toast(
      `${product.title || product.name || "Product"} added to cart.`
    );


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* REMOVE */

async function removeFromCart(
  productId
) {

  try {

    await apiFetch(
      "/cart/remove",
      {
        method: "DELETE",

        body:
          JSON.stringify({
            productId
          })

      }
    );


    state.cart =
      state.cart.filter(
        item =>
          item.productId !== productId
      );


    saveCart();

    updateCartUI();

    renderCart();


    toast(
      "Item removed from cart."
    );


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* CHANGE QUANTITY */

async function changeQuantity(
  productId,
  delta
) {

  const item =
    state.cart.find(
      cartItem =>
        cartItem.productId === productId
    );


  if (!item) return;


  const newQuantity =
    item.quantity + delta;


  if (newQuantity < 1) {

    await removeFromCart(
      productId
    );

    return;

  }


  try {

    await apiFetch(
      "/cart/update",
      {
        method: "PUT",

        body:
          JSON.stringify({

            productId,

            quantity:
              newQuantity

          })

      }
    );


    item.quantity =
      newQuantity;


    saveCart();

    updateCartUI();

    renderCart();


  } catch (error) {

    toast(
      error.message,
      true
    );

  }

}


/* ================= RENDER CART ================= */

function renderCart() {

  const container =
    $("#cart-items");


  if (!state.cart.length) {

    container.innerHTML = `

      <div class="empty-state">

        <strong>
          Your cart is empty.
        </strong>

        <p>
          Add products from the catalog to see them here.
        </p>

        <button
          class="outline-btn"
          data-page="shop"
        >
          Browse products
        </button>

      </div>

    `;


    updateSummary();

    return;

  }


  container.innerHTML =
    state.cart
      .map(item => {

        const product =
          item.product || {};


        const title =
          product.title ||
          product.name ||
          "Product";


        /*
         * IMAGE COMES FROM product.img
         */

        const image =
          product.img ||
          product.image ||
          product.imageUrl ||
          "";


        const price =
          Number(
            product.price || 0
          );


        return `

          <article class="cart-item">

            <div class="cart-thumb">

              ${
                image

                ?

                `
                <img
                  src="${escapeAttribute(image)}"
                  alt="${escapeAttribute(title)}"
                >
                `

                :

                `
                <span class="product-placeholder">
                  ${escapeHTML(
                    title
                      .charAt(0)
                      .toUpperCase()
                  )}
                </span>
                `
              }

            </div>


            <div>

              <h4>
                ${escapeHTML(title)}
              </h4>


              <p>
                ${formatPrice(price)} each
              </p>


              <div class="qty">

                <button
                  data-change-qty="${escapeAttribute(item.productId)}"
                  data-delta="-1"
                >
                  −
                </button>


                <strong>
                  ${item.quantity}
                </strong>


                <button
                  data-change-qty="${escapeAttribute(item.productId)}"
                  data-delta="1"
                >
                  +
                </button>

              </div>


              <button
                class="remove-btn"
                data-remove-cart="${escapeAttribute(item.productId)}"
              >
                Remove
              </button>

            </div>


            <div class="item-total">

              ${formatPrice(
                price * item.quantity
              )}

            </div>

          </article>

        `;

      })
      .join("");


  updateSummary();

}


/* ================= CART UI ================= */

function updateCartUI() {

  const count =
    state.cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );


  $$(".cart-count").forEach(
    element =>
      element.textContent = count
  );


  if (state.page === "cart") {

    renderCart();

  }

}


function updateSummary() {

  const count =
    state.cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );


  const total =
    state.cart.reduce(
      (sum, item) => {

        return (
          sum +
          Number(
            item.product?.price || 0
          ) *
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );


  $("#summary-items")
    .textContent = count;


  $("#summary-total")
    .textContent =
      formatPrice(total);

}


function saveCart() {

  localStorage.setItem(
    "stack_cart",
    JSON.stringify(state.cart)
  );

}


/* ================= HELPERS ================= */

function getProductId(product) {

  return String(

    product._id ||
    product.id ||
    product.productId ||
    ""

  );

}


function formatPrice(value) {

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2
    }
  ).format(
    Number(value) || 0
  );

}


function closeProductModal() {

  $("#product-modal")
    .classList
    .add("hidden");

}


function toast(
  message,
  isError = false
) {

  const element =
    document.createElement("div");


  element.className =
    `toast${isError ? " error" : ""}`;


  element.textContent =
    message ||
    "Something happened.";


  $("#toast-container")
    .appendChild(element);


  setTimeout(
    () => element.remove(),
    3500
  );

}


function escapeHTML(value) {

  return String(value ?? "")

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}