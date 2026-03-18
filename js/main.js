/* ==========================================
   ALMOND ELITE – Main JavaScript
   ========================================== */

'use strict';

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem('ae-cart') || '[]');

const COLOR_MAP = {
  strawberry:  '#d63553',
  caramel:     '#d4900a',
  raspberry:   '#c2185b',
  coconut:     '#c8b89a',
  mango:       '#e67e22',
  saltedchoc:  '#8B6914',
};

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// ---- MOBILE MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// ---- HERO PARTICLES ----
const particleContainer = document.getElementById('particles');
if (particleContainer) {
  const colors = ['#c9a84c', '#d63553', '#d4900a', '#c2185b', '#e67e22', '#c8b89a'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    particleContainer.appendChild(p);
  }
}

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navLinks && navLinks.classList.remove('open');
    }
  });
});

// ---- INTERSECTION OBSERVER (animate on scroll) ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.product-card, .bundle-card, .review-card, .usp-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ---- CART FUNCTIONS ----
function saveCart() {
  localStorage.setItem('ae-cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const footerEl = document.getElementById('cartFooter');
  const itemsEl  = document.getElementById('cartItems');
  const totalEl  = document.getElementById('cartTotal');

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  if (countEl) {
    countEl.textContent = totalQty;
    countEl.classList.toggle('visible', totalQty > 0);
  }

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <p>Dein Warenkorb ist leer.</p>
        <a href="#products" class="btn btn-outline btn-sm" id="startShoppingBtn">Jetzt entdecken</a>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (footerEl) footerEl.style.display = 'block';
  if (totalEl) totalEl.textContent = getCartTotal().toFixed(2).replace('.', ',') + ' €';

  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-dot" style="background: radial-gradient(circle, ${COLOR_MAP[item.color] || '#c9a84c'}, #333)"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}
window.changeQty = changeQty;

function addToCart(name, price, color) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price: parseFloat(price), color, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast(`✓  ${name} wurde hinzugefügt!`);
}

// ---- ADD TO CART BUTTONS ----
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    addToCart(
      btn.dataset.name,
      btn.dataset.price,
      btn.dataset.color
    );
  });
});

// ---- CART SIDEBAR ----
const cartSidebar  = document.getElementById('cartSidebar');
const cartOverlay  = document.getElementById('cartOverlay');
const cartBtn      = document.getElementById('cartBtn');
const cartClose    = document.getElementById('cartClose');

function openCart() {
  cartSidebar && cartSidebar.classList.add('open');
  cartOverlay && cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar && cartSidebar.classList.remove('open');
  cartOverlay && cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn     && cartBtn.addEventListener('click', openCart);
cartClose   && cartClose.addEventListener('click', closeCart);
cartOverlay && cartOverlay.addEventListener('click', closeCart);

// ---- TOAST ----
let toastTimeout;
const toastEl = document.getElementById('toast');
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ---- NEWSLETTER ----
const nlForm = document.getElementById('nlForm');
if (nlForm) {
  nlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = nlForm.querySelector('input');
    if (input && input.value) {
      showToast('🎉 Du bist jetzt angemeldet!');
      input.value = '';
    }
  });
}

// ---- FILTER BUTTONS (Shop page) ----
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card[data-flavor]').forEach(card => {
        if (filter === 'all' || card.dataset.flavor === filter || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// ---- CHECKOUT CART SUMMARY ----
function populateCheckoutSummary() {
  const summaryEl = document.getElementById('checkoutSummaryItems');
  const totalEl   = document.getElementById('checkoutTotal');
  if (!summaryEl) return;

  if (cart.length === 0) {
    summaryEl.innerHTML = '<div class="summary-item"><span>Warenkorb ist leer</span><span>–</span></div>';
  } else {
    summaryEl.innerHTML = cart.map(item => `
      <div class="summary-item">
        <span>${item.name} × ${item.qty}</span>
        <span>${(item.price * item.qty).toFixed(2).replace('.', ',')} €</span>
      </div>
    `).join('');
  }

  const total = getCartTotal();
  const shipping = total >= 30 ? 0 : 4.99;
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="summary-item">
        <span>Versand</span>
        <span>${shipping === 0 ? 'GRATIS' : shipping.toFixed(2).replace('.', ',') + ' €'}</span>
      </div>
      <div class="summary-total">
        <span>Gesamt</span>
        <strong>${(total + shipping).toFixed(2).replace('.', ',')} €</strong>
      </div>
    `;
  }
}

// ---- CHECKOUT FORM ----
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
  populateCheckoutSummary();
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('🎉 Bestellung erfolgreich! Vielen Dank!');
    cart = [];
    saveCart();
    updateCartUI();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  });
}

// ---- INIT ----
updateCartUI();
