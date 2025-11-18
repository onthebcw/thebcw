// app.js - frontend cart & checkout (for GitHub Pages)
(() => {
  const API_BASE = window.API_BASE || "";
  const PUBLISHABLE_KEY = window.STRIPE_PUBLISHABLE_KEY || "";

  /* -------------------------
     Manual product catalog
     Edit this array to add/remove products.
     Each product must have: id, title, price (decimal), image, printfulVariantId
     The printfulVariantId is used by the backend to create the Printful order.
  ------------------------- */
  const PRODUCTS = [
    { id: "p1", title: "Classic Tee — Black", price: 22.00, image: "https://via.placeholder.com/400x300?text=Product+1", printfulVariantId: 4012 },
    { id: "p2", title: "Classic Tee — White", price: 22.00, image: "https://via.placeholder.com/400x300?text=Product+2", printfulVariantId: 4013 },
    { id: "p3", title: "Hoodie — Gray", price: 42.00, image: "https://via.placeholder.com/400x300?text=Product+3", printfulVariantId: 5021 },
    { id: "p4", title: "Cap — Navy", price: 18.00, image: "https://via.placeholder.com/400x300?text=Product+4", printfulVariantId: 6001 },
    { id: "p5", title: "Tote Bag", price: 16.00, image: "https://via.placeholder.com/400x300?text=Product+5", printfulVariantId: 7201 },
    { id: "p6", title: "Sticker Pack", price: 6.00, image: "https://via.placeholder.com/400x300?text=Product+6", printfulVariantId: 8201 },
    { id: "p7", title: "Poster 11x17", price: 12.00, image: "https://via.placeholder.com/400x300?text=Product+7", printfulVariantId: 9101 },
    { id: "p8", title: "Mug", price: 14.00, image: "https://via.placeholder.com/400x300?text=Product+8", printfulVariantId: 10101 }
  ];

  /* -------------------------
     Utilities & DOM refs
  ------------------------- */
  const productGrid = document.getElementById("productGrid");
  const cartBadge = document.getElementById("cartBadge");
  const openCart = document.getElementById("openCart");
  const closeCart = document.getElementById("closeCart");
  const cartSidebar = document.getElementById("cartSidebar");
  const cartContents = document.getElementById("cartContents");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const toastContainer = document.getElementById("toastContainer");

  // cart stored like [{id, qty}]
  let cart = JSON.parse(localStorage.getItem("kucheki_cart_v1") || "[]");

  /* -------------------------
     Render products
  ------------------------- */
  function renderProducts() {
    productGrid.innerHTML = PRODUCTS.map(p => `
      <article class="product-card" data-id="${p.id}">
        <img src="${p.image}" alt="${p.title}">
        <div class="product-title">${p.title}</div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn add-btn" data-id="${p.id}">Add</button>
          <button class="btn secondary view-btn" data-id="${p.id}">View</button>
        </div>
      </article>
    `).join("");
  }

  /* -------------------------
     Cart helpers
  ------------------------- */
  function saveCart() { localStorage.setItem("kucheki_cart_v1", JSON.stringify(cart)); }
  function findProduct(id) { return PRODUCTS.find(p => p.id === id); }
  function cartItemCount() { return cart.reduce((s,i) => s + i.qty, 0); }
  function cartUniqueCount() { return cart.length; }
  function cartTotal() {
    return cart.reduce((sum, item) => {
      const p = findProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function updateUI() {
    cartBadge.textContent = cartUniqueCount();
    cartBadge.style.opacity = cart.length ? "1" : "0";
    renderCartContents();
    cartTotalEl.textContent = "$" + cartTotal().toFixed(2);
    checkoutBtn.disabled = cart.length === 0;
    saveCart();
  }

  function renderCartContents() {
    if (!cart.length) {
      cartContents.innerHTML = `<p>Your bag is empty.</p>`;
      return;
    }
    cartContents.innerHTML = cart.map(ci => {
      const p = findProduct(ci.id);
      return `
        <div class="cart-item" data-id="${ci.id}">
          <img src="${p.image}" alt="${p.title}">
          <div style="flex:1">
            <div style="font-weight:700">${p.title}</div>
            <div style="color:#666">$${p.price.toFixed(2)} × ${ci.qty}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <div class="qty-controls">
              <button class="btn secondary dec" data-id="${ci.id}">−</button>
              <div style="min-width:26px;text-align:center">${ci.qty}</div>
              <button class="btn secondary inc" data-id="${ci.id}">+</button>
            </div>
            <button class="btn secondary remove" data-id="${ci.id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");
  }

  /* -------------------------
     Actions
  ------------------------- */
  productGrid.addEventListener("click", (e) => {
    const add = e.target.closest(".add-btn");
    const view = e.target.closest(".view-btn");
    if (add) {
      const id = add.dataset.id;
      addToCart(id, 1);
    } else if (view) {
      showToast("Preview not implemented — click Add to add to cart.");
    }
  });

  cartContents.addEventListener("click", (e) => {
    const dec = e.target.closest(".dec");
    const inc = e.target.closest(".inc");
    const rem = e.target.closest(".remove");
    const id = (dec||inc||rem)?.dataset?.id;
    if (!id) return;
    if (dec) changeQty(id, -1);
    if (inc) changeQty(id, +1);
    if (rem) removeFromCart(id);
  });

  openCart.addEventListener("click", () => { cartSidebar.classList.add("open"); cartSidebar.setAttribute("aria-hidden","false"); });
  closeCart.addEventListener("click", () => { cartSidebar.classList.remove("open"); cartSidebar.setAttribute("aria-hidden","true"); });

  function addToCart(id, qtyToAdd) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) cart.push({ id, qty: qtyToAdd });
    else cart[idx].qty = Math.min(5, cart[idx].qty + qtyToAdd); // max 5 per item
    showToast("Added to bag");
    updateUI();
  }

  function changeQty(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].qty = Math.max(1, Math.min(5, cart[idx].qty + delta));
    updateUI();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateUI();
  }

  /* -------------------------
     Checkout flow
     Creates a Stripe Checkout session via backend and redirects user
  ------------------------- */
  checkoutBtn.addEventListener("click", async () => {
    if (!API_BASE) return showToast("Backend URL not configured. Edit window.API_BASE in index.html.");
    // Build payload: include product info + printfulVariantId
    const lineItems = cart.map(ci => {
      const p = findProduct(ci.id);
      return {
        productId: ci.id,
        name: p.title,
        unit_price: Math.round(p.price * 100), // cents
        quantity: ci.qty,
        printfulVariantId: p.printfulVariantId
      };
    });

    try {
      checkoutBtn.disabled = true;
      showToast("Creating checkout...", "info");
      const res = await fetch(API_BASE + "/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ items: lineItems, success_url: location.origin + "/?checkout=success", cancel_url: location.origin + "/?checkout=cancel" })
      });
      const body = await res.json();
      if (res.ok && body.url) {
        // redirect to Stripe Checkout
        window.location.href = body.url;
      } else {
        console.error(body);
        showToast("Failed to create checkout.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error creating checkout.", "error");
    } finally {
      checkoutBtn.disabled = false;
    }
  });

  /* -------------------------
     Toasts
  ------------------------- */
  function showToast(msg, type="success") {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(()=> t.remove(), 3000);
  }

  /* -------------------------
     Init render
  ------------------------- */
  renderProducts();
  updateUI();
})();
