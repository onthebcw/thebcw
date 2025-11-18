// ================================
// STORE APP NAMESPACE (GLOBAL)
// ================================
window.StoreApp = window.StoreApp || {};
const StoreApp = window.StoreApp;

// ================================
// SCROLL MODULE
// ================================
(function ScrollModule() {
    "use strict";

    function updateHeaderOnScroll() {
        const header = document.querySelector(".header");
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 0);
    }

    function updateNavLinksOnScroll() {
        const navLinks = document.querySelectorAll(".nav-links a");
        if (!navLinks.length) return;

        const colors = {
            default: "#000",
            activeDefault: "#d8ebff",
            hover: "#f0f7ff",
            scrolled: "#000",
            activeScrolled: "#555",
            scrolledHover: "#007bff"
        };

        const isScrolled = window.scrollY > 0;

        navLinks.forEach(link => {
            const isActive = link.classList.contains("active");
            link.style.color = isScrolled ? (isActive ? colors.activeScrolled : colors.scrolled) : (isActive ? colors.activeDefault : colors.default);
            link.onmouseenter = () => link.style.color = isScrolled ? colors.scrolledHover : colors.hover;
            link.onmouseleave = () => link.style.color = isScrolled ? (isActive ? colors.activeScrolled : colors.scrolled) : (isActive ? colors.activeDefault : colors.default);
        });
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeaderOnScroll();
                updateNavLinksOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("DOMContentLoaded", () => {
        updateHeaderOnScroll();
        updateNavLinksOnScroll();
    });
})();

// ================================
// TOAST MODULE
// ================================
StoreApp.showToast = function(message, type) {
    type = type || "main-toast";

    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast " + type + " show";
    toast.textContent = message;
    container.appendChild(toast);

    toast.addEventListener("animationend", () => toast.remove());
};

// ================================
// ITEM PAGE MODULE (quantity + add-to-cart)
// ================================
(function ItemPageModule() {
    "use strict";

    const MAX_UNIQUE_ITEMS = 10;
    const MAX_QTY_PER_ITEM = 5;
    const MIN_QTY = 1;
    const CART_KEY = "store_cart_v1";

    StoreApp.loadCart = function () {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } 
        catch (e) { console.error(e); return []; }
    };

    StoreApp.saveCart = function (cart) {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart || [])); } 
        catch (e) { console.error(e); }
    };

    StoreApp.cart = StoreApp.cart || StoreApp.loadCart();

    // Quantity Controls
    (function QuantityControls() {
        const qtyEl = document.getElementById("quantity");
        const plusBtn = document.getElementById("increaseQty");
        const minusBtn = document.getElementById("decreaseQty");

        function readQty() {
            if (!qtyEl) return MIN_QTY;
            const n = parseInt(qtyEl.textContent, 10);
            return isNaN(n) || n < MIN_QTY ? MIN_QTY : n;
        }

        function writeQty(n) { if (qtyEl) qtyEl.textContent = String(n); }

        function onPlusClick(e) { e?.preventDefault(); let current = readQty(); if (current < MAX_QTY_PER_ITEM) writeQty(current + 1); else StoreApp.showToast(`⚠ Max per item: ${MAX_QTY_PER_ITEM}`, "main-toast"); }
        function onMinusClick(e) { e?.preventDefault(); let current = readQty(); if (current > MIN_QTY) writeQty(current - 1); else StoreApp.showToast(`⚠ Min per item: ${MIN_QTY}`, "main-toast"); }

        if (plusBtn && !plusBtn.__bound) { plusBtn.addEventListener("click", onPlusClick); plusBtn.__bound = true; }
        if (minusBtn && !minusBtn.__bound) { minusBtn.addEventListener("click", onMinusClick); minusBtn.__bound = true; }

        function resetQuantityToDefault() { writeQty(MIN_QTY); }
        StoreApp.resetProductQuantity = resetQuantityToDefault;
        document.addEventListener("DOMContentLoaded", resetQuantityToDefault);
        window.addEventListener("pageshow", resetQuantityToDefault);
    })();

    // Add To Cart
    (function AddToBag() {
        const addBtn = document.getElementById("addToCartBtn");
        const selectEl = document.getElementById("picks");
        const priceEl = document.querySelector(".product-info .price");

        if (selectEl && priceEl) {
            selectEl.addEventListener("change", () => {
                const selectedOption = selectEl.options[selectEl.selectedIndex];
                const price = selectedOption.dataset.price || "0";
                priceEl.textContent = `$${price}`;
            });
        }

        function getSelectedOption() {
            if (!selectEl) return {
                value: "option1",
                img: document.querySelector(".pic-main")?.src || "",
                price: document.querySelector(".product-info .price")?.textContent || "$0"
            };
            const opt = selectEl.options[selectEl.selectedIndex];
            return {
                value: selectEl.value,
                img: opt.dataset?.img || "",
                price: opt.dataset?.price ? `$${opt.dataset.price}` : document.querySelector(".product-info .price")?.textContent || "$0"
            };
        }

        function addToCartHandler(e) {
            e?.preventDefault();
            const qtyEl = document.getElementById("quantity");
            const qtyToAdd = Math.max(MIN_QTY, parseInt(qtyEl?.textContent || "1", 10));
            const selected = getSelectedOption();
            const productName = document.querySelector(".product-info h2")?.textContent || "Product";

            const cartNow = StoreApp.cart || [];
            const existingIndex = cartNow.findIndex(i => String(i.option) === String(selected.value));

            if (existingIndex > -1) {
                const existing = cartNow[existingIndex];
                const newQty = Number(existing.quantity) + qtyToAdd;
                if (newQty > MAX_QTY_PER_ITEM) return StoreApp.showToast(`⚠ Max per item: ${MAX_QTY_PER_ITEM}`);
                existing.quantity = newQty;
            } else {
                if (cartNow.length >= MAX_UNIQUE_ITEMS) return StoreApp.showToast(`⚠ Max unique items: ${MAX_UNIQUE_ITEMS}`);
                if (qtyToAdd > MAX_QTY_PER_ITEM) return StoreApp.showToast(`⚠ Max per item: ${MAX_QTY_PER_ITEM}`);
                cartNow.push({
                    id: Date.now()+"-"+Math.random().toString(16).slice(2),
                    name: productName,
                    price: selected.price,
                    option: selected.value,
                    quantity: qtyToAdd,
                    img: selected.img
                });
            }

            StoreApp.cart = cartNow;
            StoreApp.saveCart(cartNow);
            StoreApp.renderCart?.();
            StoreApp.showToast(`✅ Added to bag: ${productName}`, "success-toast");
        }

        if (addBtn && !addBtn.__bound) { addBtn.addEventListener("click", addToCartHandler); addBtn.__bound = true; }

        function resetSelectToDefault() {
            if (!selectEl) return;
            selectEl.selectedIndex = 0;
            selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        }
        StoreApp.resetProductSelect = resetSelectToDefault;
        document.addEventListener("DOMContentLoaded", resetSelectToDefault);
        window.addEventListener("pageshow", resetSelectToDefault);
    })();
})();

// ================================
// BAG SIDEBAR MODULE
// ================================
(function BagModule() {
    "use strict";

    const MAX_UNIQUE_ITEMS = 10;
    const MAX_QTY_PER_ITEM = 5;
    const STRIPE_CHECKOUT_LINK = "https://buy.stripe.com/test_default_checkout_link";

    function getSidebar() { return document.getElementById("shoppingSidebar"); }
    function getCartIcon() { return document.querySelector(".cart-icon"); }

    function computeTotals(cart) {
        let unique = 0, qty = 0;
        if (!Array.isArray(cart)) return { unique: 0, qty: 0 };
        unique = cart.length;
        cart.forEach(i => qty += Number(i.quantity) || 0);
        return { unique, qty };
    }
    StoreApp.computeTotals = computeTotals;

    StoreApp.renderCart = function () {
        const cartContents = document.getElementById("cartContents");
        if (!cartContents) return;
        cartContents.innerHTML = "";
        const cart = StoreApp.cart || [];

        if (!cart.length) {
            const emptyP = document.createElement("p");
            emptyP.className = "sidebar-paragraph";
            emptyP.textContent = "Your bag is currently empty.";
            cartContents.appendChild(emptyP);
        } else {
            cart.forEach((item, idx) => {
                const cartItem = document.createElement("div");
                cartItem.className = "cart-item";
                cartItem.dataset.index = idx;
                cartItem.dataset.id = item.id || "";

                // left (image)
                const left = document.createElement("div");
                left.className = "cart-item-left";
                const img = document.createElement("img");
                img.className = "cart-item-img";
                img.src = item.img || "";
                img.alt = item.name || "Product";
                left.appendChild(img);

                // left-mid (info + price)
                const leftMid = document.createElement("div");
                leftMid.className = "cart-item-left-mid";
                leftMid.style.display = "flex";
                leftMid.style.flexDirection = "column";
                leftMid.style.justifyContent = "space-between";

                const info = document.createElement("div");
                info.className = "cart-item-info";
                info.innerHTML = `<p class="cart-item-name">${item.name || ""}</p>
                                  <p class="cart-item-variant">${item.option || ""}</p>`;

                const price = document.createElement("div");
                price.className = "cart-item-price";
                price.textContent = item.price || "";

                leftMid.appendChild(info);
                leftMid.appendChild(price);

                // right-mid (quantity controls)
                const rightMid = document.createElement("div");
                rightMid.className = "cart-item-right-mid";
                rightMid.style.display = "flex";
                rightMid.style.alignItems = "center";
                rightMid.style.justifyContent = "flex-end";

                const decBtn = document.createElement("button");
                decBtn.type = "button"; decBtn.className = "qty-btn minus"; decBtn.textContent = "−";
                const qtySpan = document.createElement("span");
                qtySpan.className = "cart-item-qty"; qtySpan.textContent = String(item.quantity || 1);
                const incBtn = document.createElement("button");
                incBtn.type = "button"; incBtn.className = "qty-btn plus"; incBtn.textContent = "+";

                decBtn.addEventListener("click", ev => {
                    ev.stopPropagation();
                    const cartArr = StoreApp.cart || [];
                    const index = Number(cartItem.dataset.index);
                    const target = cartArr[index];
                    if (!target) return;
                    if (target.quantity > 1) { target.quantity -= 1; StoreApp.saveCart(cartArr); StoreApp.renderCart(); } 
                    else { confirmRemove(index); }
                });

                incBtn.addEventListener("click", ev => {
                    ev.stopPropagation();
                    const cartArr = StoreApp.cart || [];
                    const index = Number(cartItem.dataset.index);
                    const target = cartArr[index];
                    if (!target) return;
                    if (Number(target.quantity) >= MAX_QTY_PER_ITEM) {
                        StoreApp.showToast(`⚠ Max per item: ${MAX_QTY_PER_ITEM}`, "main-toast");
                        return;
                    }
                    target.quantity += 1;
                    StoreApp.saveCart(cartArr);
                    StoreApp.renderCart();
                });

                rightMid.appendChild(decBtn); 
                rightMid.appendChild(qtySpan); 
                rightMid.appendChild(incBtn);

                // right (remove button)
                const right = document.createElement("div");
                right.className = "cart-item-right";
                right.style.display = "flex";
                right.style.alignItems = "center";
                right.style.justifyContent = "flex-end";

                const removeBtn = document.createElement("button");
                removeBtn.type = "button"; removeBtn.className = "remove-btn";
                removeBtn.title = "Remove item"; removeBtn.innerHTML = '🗑';
                removeBtn.addEventListener("click", ev => { ev.stopPropagation(); confirmRemove(idx); });
                right.appendChild(removeBtn);

                cartItem.appendChild(left);
                cartItem.appendChild(leftMid);
                cartItem.appendChild(rightMid);
                cartItem.appendChild(right);
                cartContents.appendChild(cartItem);
            });
        }

        appendOrUpdateCheckoutButton(cartContents);
        updateCartBadge();
    };

    function confirmRemove(index) {
        const cartArr = StoreApp.cart || [];
        const item = cartArr[index]; if (!item) return;
        if (!window.confirm(`Remove "${item.name}" from your bag?`)) return;
        cartArr.splice(index,1);
        StoreApp.cart = cartArr; StoreApp.saveCart(cartArr);
        StoreApp.renderCart();
        StoreApp.showToast("✅ Item removed successfully!", "success-toast");
    }

    function appendOrUpdateCheckoutButton(container) {
        if (!container) return;
        let checkoutBtn = document.getElementById("checkoutBtn");
        if (!checkoutBtn) {
            checkoutBtn = document.createElement("button");
            checkoutBtn.id = "checkoutBtn"; 
            checkoutBtn.className = "checkout-btn";
            checkoutBtn.textContent = "Checkout";
            checkoutBtn.addEventListener("click", () => {
                if (window.confirm("You will be redirected to Stripe checkout. Continue?")) 
                    window.location.href = STRIPE_CHECKOUT_LINK;
            });
        }
        container.appendChild(checkoutBtn);
        checkoutBtn.disabled = !(StoreApp.cart && StoreApp.cart.length > 0);
    }

    function updateCartBadge() {
        const badgeParent = document.querySelector(".cart-icon");
        if (!badgeParent) return;
        let badge = badgeParent.querySelector(".cart-badge");
        if (!badge) { badge = document.createElement("span"); badge.className = "cart-badge"; badgeParent.appendChild(badge); }
        const unique = Math.min((StoreApp.cart?.length || 0), MAX_UNIQUE_ITEMS);
        if (unique <= 0) { badge.style.opacity = "0"; badge.textContent = ""; return; }
        badge.textContent = String(unique); badge.style.opacity = "1";
    }

    // Sidebar Handlers
    (function sidebarHandlers() {
        const sidebar = getSidebar();
        const cartIcon = getCartIcon();
        const SIDEBAR_OPEN_CLASS = "open";

        function closeSidebar() { if (sidebar && sidebar.classList.contains(SIDEBAR_OPEN_CLASS)) sidebar.classList.remove(SIDEBAR_OPEN_CLASS); }

        const closeBtn = sidebar?.querySelector(".shopping-sidebar .close");
        if (closeBtn && !closeBtn.__storeapp_close_bound) {
            closeBtn.addEventListener("click", ev => { ev.stopPropagation(); closeSidebar(); });
            closeBtn.__storeapp_close_bound = true;
        }

        cartIcon?.addEventListener("click", e => { e.stopPropagation(); sidebar.classList.toggle(SIDEBAR_OPEN_CLASS); });

        function docClickHandler(e) {
            if (!sidebar || !sidebar.classList.contains(SIDEBAR_OPEN_CLASS)) return;
            if (!sidebar.contains(e.target) && !(cartIcon && (cartIcon.contains(e.target) || cartIcon === e.target))) closeSidebar();
        }

        function docKeyHandler(e) {
            const key = e.key || e.keyCode;
            if (key === "Escape" || key === "Esc" || e.keyCode === 27) closeSidebar();
        }

        document.addEventListener("click", docClickHandler);
        document.addEventListener("keyup", docKeyHandler);
        document.addEventListener("click", (e) => { 
            const a = e.target.closest && e.target.closest("a"); 
            if (a && sidebar?.classList.contains("open")) sidebar.classList.remove(SIDEBAR_OPEN_CLASS); 
        });
        window.addEventListener("pageshow", () => { sidebar?.classList.remove(SIDEBAR_OPEN_CLASS); });
    })();

    document.addEventListener("DOMContentLoaded", () => StoreApp.renderCart());
})();

// ================================
// CAROUSEL MODULE
// ================================
(function CarouselModule() {
    const mainImage = document.querySelector(".pic-main");
    const thumbs = document.querySelectorAll(".thumbs");
    const prevBtn = document.querySelector(".carousal-arrow.prev");
    const nextBtn = document.querySelector(".carousal-arrow.next");

    if (!mainImage || thumbs.length === 0 || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    function updateCarousel(index) {
        if (index < 0) index = thumbs.length - 1;
        else if (index >= thumbs.length) index = 0;
        currentIndex = index;

        const selectedThumb = thumbs[currentIndex];
        mainImage.src = selectedThumb.dataset.img;
        mainImage.alt = selectedThumb.alt;

        thumbs.forEach(thumb => thumb.classList.remove("active-thumb"));
        selectedThumb.classList.add("active-thumb");
    }

    prevBtn.addEventListener("click", () => updateCarousel(currentIndex - 1));
    nextBtn.addEventListener("click", () => updateCarousel(currentIndex + 1));

    thumbs.forEach(thumb => {
        thumb.addEventListener("click", () => {
            const index = parseInt(thumb.dataset.index, 10);
            updateCarousel(index);
        });
    });

    updateCarousel(0); // initialize
})();
