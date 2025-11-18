// ================================
// STORE APP NAMESPACE (GLOBAL)
// ================================
window.StoreApp = window.StoreApp || {};
const StoreApp = window.StoreApp;

// ================================
// CONSTANTS
// ================================
StoreApp.constants = {
  MAX_QTY_PER_ITEM: 5,
  MAX_UNIQUE_ITEMS: 10,
  MIN_QTY: 1,
  STRIPE_CHECKOUT_LINK: "https://buy.stripe.com/test_default_checkout_link"
};

// ================================
// UTILS
// ================================
StoreApp.showToast = function(message, type = "main-toast") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  container.appendChild(toast);
  toast.addEventListener("animationend", () => toast.remove());
};

StoreApp.log = (...args) => { if(StoreApp.debug) console.log(...args); };

// ================================
// CART STORAGE
// ================================
StoreApp.loadCart = () => {
  try { return JSON.parse(localStorage.getItem("store_cart_v1")) || []; } 
  catch { return []; }
};

StoreApp.saveCart = (cart) => {
  try { localStorage.setItem("store_cart_v1", JSON.stringify(cart || [])); } 
  catch {}
};

StoreApp.cart = StoreApp.cart || StoreApp.loadCart();

// ================================
// SCROLL MODULE
// ================================
(function ScrollModule() {
  const header = document.querySelector(".header");
  const navLinks = document.querySelectorAll(".nav-links a");
  const colors = {
    default: "#000",
    activeDefault: "#d8ebff",
    hover: "#f0f7ff",
    scrolled: "#000",
    activeScrolled: "#555",
    scrolledHover: "#007bff"
  };
  let ticking = false;

  function updateHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 0);
  }

  function updateNavLinks() {
    if (!navLinks.length) return;
    const isScrolled = window.scrollY > 0;
    navLinks.forEach(link => {
      const isActive = link.classList.contains("active");
      link.style.color = isScrolled ? (isActive ? colors.activeScrolled : colors.scrolled)
                                     : (isActive ? colors.activeDefault : colors.default);
      link.onmouseenter = () => link.style.color = isScrolled ? colors.scrolledHover : colors.hover;
      link.onmouseleave = () => link.style.color = isScrolled ? (isActive ? colors.activeScrolled : colors.scrolled)
                                                               : (isActive ? colors.activeDefault : colors.default);
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => { updateHeader(); updateNavLinks(); ticking = false; });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("DOMContentLoaded", () => { updateHeader(); updateNavLinks(); });
})();

// ================================
// CART MODULE
// ================================
(function CartModule() {
  const cartContainer = document.getElementById("cartContents");
  const cartIcon = document.querySelector(".cart-icon");
  const sidebar = document.getElementById("shoppingSidebar");
  const SIDEBAR_OPEN_CLASS = "open";

  function computeTotals(cart) {
    let unique = 0, qty = 0;
    if (!Array.isArray(cart)) return { unique: 0, qty: 0 };
    unique = cart.length;
    cart.forEach(i => qty += Number(i.quantity) || 0);
    return { unique, qty };
  }
  StoreApp.computeTotals = computeTotals;

  function updateCartBadge() {
    if (!cartIcon) return;
    let badge = cartIcon.querySelector(".cart-badge");
    if (!badge) { badge = document.createElement("span"); badge.className = "cart-badge"; cartIcon.appendChild(badge); }
    const unique = Math.min(StoreApp.cart?.length || 0, StoreApp.constants.MAX_UNIQUE_ITEMS);
    if (unique <= 0) { badge.style.opacity = "0"; badge.textContent = ""; return; }
    badge.textContent = String(unique); badge.style.opacity = "1";
  }

  function confirmRemove(index) {
    const item = StoreApp.cart[index]; if (!item) return;
    if (!window.confirm(`Remove "${item.name}" from your bag?`)) return;
    StoreApp.cart.splice(index, 1);
    StoreApp.saveCart(StoreApp.cart);
    renderCart();
    StoreApp.showToast("✅ Item removed successfully!", "success-toast");
  }

  function appendOrUpdateCheckoutButton(container) {
    if (!container) return;
    let btn = document.getElementById("checkoutBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "checkoutBtn"; btn.className = "checkout-btn"; btn.textContent = "Checkout";
      btn.addEventListener("click", () => {
        if (window.confirm("You will be redirected to Stripe checkout. Continue?")) 
          window.location.href = StoreApp.constants.STRIPE_CHECKOUT_LINK;
      });
    }
    container.appendChild(btn);
    btn.disabled = !(StoreApp.cart && StoreApp.cart.length > 0);
  }

  function renderCart() {
    if (!cartContainer) return;
    cartContainer.innerHTML = "";
    if (!StoreApp.cart.length) {
      const p = document.createElement("p"); p.className = "sidebar-paragraph"; p.textContent = "Your bag is currently empty."; 
      cartContainer.appendChild(p);
    } else {
      StoreApp.cart.forEach((item, idx) => {
        const cartItem = document.createElement("div"); cartItem.className = "cart-item"; cartItem.dataset.index = idx;
        // left
        const left = document.createElement("div"); left.className = "cart-item-left";
        const img = document.createElement("img"); img.className = "cart-item-img"; img.src = item.img; img.alt = item.name; left.appendChild(img);
        // info + price
        const leftMid = document.createElement("div"); leftMid.className = "cart-item-left-mid";
        leftMid.style.display = "flex"; leftMid.style.flexDirection = "column"; leftMid.style.justifyContent = "space-between";
        const info = document.createElement("div"); info.className = "cart-item-info"; info.innerHTML = `<p class="cart-item-name">${item.name}</p><p class="cart-item-variant">${item.option}</p>`;
        const price = document.createElement("div"); price.className = "cart-item-price"; price.textContent = item.price;
        leftMid.appendChild(info); leftMid.appendChild(price);
        // qty controls
        const rightMid = document.createElement("div"); rightMid.className = "cart-item-right-mid"; rightMid.style.display = "flex"; rightMid.style.alignItems = "center"; rightMid.style.justifyContent = "flex-end";
        const decBtn = document.createElement("button"); decBtn.className = "qty-btn minus"; decBtn.textContent = "−";
        const qtySpan = document.createElement("span"); qtySpan.className = "cart-item-qty"; qtySpan.textContent = item.quantity;
        const incBtn = document.createElement("button"); incBtn.className = "qty-btn plus"; incBtn.textContent = "+";
        decBtn.addEventListener("click", () => { if(item.quantity > 1) { item.quantity--; StoreApp.saveCart(StoreApp.cart); renderCart(); } else confirmRemove(idx); });
        incBtn.addEventListener("click", () => { if(item.quantity < StoreApp.constants.MAX_QTY_PER_ITEM) { item.quantity++; StoreApp.saveCart(StoreApp.cart); renderCart(); } else StoreApp.showToast(`⚠ Max per item: ${StoreApp.constants.MAX_QTY_PER_ITEM}`); });
        rightMid.append(decBtn, qtySpan, incBtn);
        // remove button
        const right = document.createElement("div"); right.className = "cart-item-right"; right.style.display="flex"; right.style.alignItems="center"; right.style.justifyContent="flex-end";
        const removeBtn = document.createElement("button"); removeBtn.type="button"; removeBtn.className="remove-btn"; removeBtn.innerHTML="🗑"; removeBtn.addEventListener("click", () => confirmRemove(idx));
        right.appendChild(removeBtn);
        // append all
        cartItem.append(left, leftMid, rightMid, right);
        cartContainer.appendChild(cartItem);
      });
    }
    appendOrUpdateCheckoutButton(cartContainer);
    updateCartBadge();
  }

  StoreApp.renderCart = renderCart;

  // Sidebar open/close
  document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = sidebar?.querySelector(".shopping-sidebar .close");
    if (closeBtn && !closeBtn.__storeapp_bound) { closeBtn.addEventListener("click", () => sidebar.classList.remove(SIDEBAR_OPEN_CLASS)); closeBtn.__storeapp_bound = true; }
    cartIcon?.addEventListener("click", () => sidebar?.classList.toggle(SIDEBAR_OPEN_CLASS));
    document.addEventListener("click", e => { if(sidebar?.classList.contains(SIDEBAR_OPEN_CLASS) && !sidebar.contains(e.target) && !cartIcon.contains(e.target)) sidebar.classList.remove(SIDEBAR_OPEN_CLASS); });
    document.addEventListener("keyup", e => { if(e.key === "Escape") sidebar?.classList.remove(SIDEBAR_OPEN_CLASS); });
    StoreApp.renderCart();
  });
})();

// ================================
// ITEM PAGE MODULE
// ================================
(function ItemPageModule() {
  const qtyEl = document.getElementById("quantity");
  const plusBtn = document.getElementById("increaseQty");
  const minusBtn = document.getElementById("decreaseQty");
  const addBtn = document.getElementById("addToCartBtn");
  const selectEl = document.getElementById("picks");
  const priceEl = document.querySelector(".product-info .price");
  const MIN_QTY = StoreApp.constants.MIN_QTY;
  const MAX_QTY = StoreApp.constants.MAX_QTY_PER_ITEM;
  const MAX_UNIQUE = StoreApp.constants.MAX_UNIQUE_ITEMS;

  function readQty() { const n = parseInt(qtyEl?.textContent || "1", 10); return isNaN(n) || n < MIN_QTY ? MIN_QTY : n; }
  function writeQty(n) { if(qtyEl) qtyEl.textContent = n; }
  function resetQty() { writeQty(MIN_QTY); }

  plusBtn?.addEventListener("click", e => { e.preventDefault(); if(readQty() < MAX_QTY) writeQty(readQty()+1); else StoreApp.showToast(`⚠ Max per item: ${MAX_QTY}`); });
  minusBtn?.addEventListener("click", e => { e.preventDefault(); if(readQty() > MIN_QTY) writeQty(readQty()-1); else StoreApp.showToast(`⚠ Min per item: ${MIN_QTY}`); });

  addBtn?.addEventListener("click", e => {
    e.preventDefault();
    const qty = readQty();
    const selected = selectEl?.selectedOptions[0];
    const optionVal = selected?.value || "option1";
    const price = selected?.dataset.price || priceEl?.textContent || "$0";
    const img = selected?.dataset.img || document.querySelector(".pic-main")?.src || "";
    const productName = document.querySelector(".product-info h2")?.textContent || "Product";

    const cart = StoreApp.cart || [];
    const existing = cart.find(i => i.option === optionVal);
    if(existing) { 
      const newQty = existing.quantity + qty; 
      if(newQty > MAX_QTY) return StoreApp.showToast(`⚠ Max per item: ${MAX_QTY}`);
      existing.quantity = newQty;
    } else {
      if(cart.length >= MAX_UNIQUE) return StoreApp.showToast(`⚠ Max unique items: ${MAX_UNIQUE}`);
      if(qty > MAX_QTY) return StoreApp.showToast(`⚠ Max per item: ${MAX_QTY}`);
      cart.push({ id: Date.now()+"-"+Math.random().toString(16).slice(2), name: productName, price, option: optionVal, quantity: qty, img });
    }

    StoreApp.cart = cart;
    StoreApp.saveCart(cart);
    StoreApp.renderCart();
    StoreApp.showToast(`✅ Added to bag: ${productName}`, "success-toast");
  });

  document.addEventListener("DOMContentLoaded", resetQty);
  window.addEventListener("pageshow", resetQty);
})();
