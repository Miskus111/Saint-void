/* ================================================
   SAINT VOID — Main JavaScript
   ================================================ */

/* ---- Navigation ---- */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

if (mobileClose) {
  mobileClose.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ---- Cart State (localStorage) ---- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('sv_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('sv_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.size === product.size);
  if (existing) {
    existing.qty += product.qty || 1;
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

/* ---- Toast ---- */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="toast-icon"></div><div class="toast-text"></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ---- Intersection Observer for animations ---- */
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
}

/* ---- Accordion ---- */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ---- Size Selectors ---- */
function initSizeSelectors() {
  document.querySelectorAll('.size-btn, .product-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.size-selector, .product-sizes');
      if (group) {
        group.querySelectorAll('.size-btn, .product-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });
}

/* ---- Quantity Controls ---- */
function initQtyControls() {
  document.querySelectorAll('.qty-control').forEach(control => {
    const display = control.querySelector('.qty-display');
    if (!display) return;
    let qty = parseInt(display.textContent) || 1;

    control.querySelector('.qty-btn[data-action="minus"]')?.addEventListener('click', () => {
      if (qty > 1) { qty--; display.textContent = qty; }
    });

    control.querySelector('.qty-btn[data-action="plus"]')?.addEventListener('click', () => {
      if (qty < 99) { qty++; display.textContent = qty; }
    });
  });
}

/* ---- Cart Qty Controls ---- */
function initCartQtyControls() {
  document.querySelectorAll('.cart-qty').forEach(control => {
    const numEl = control.querySelector('.cart-qty-num');
    if (!numEl) return;
    let qty = parseInt(numEl.textContent) || 1;

    control.querySelector('.cart-qty-btn[data-action="minus"]')?.addEventListener('click', () => {
      if (qty > 1) { qty--; numEl.textContent = qty; updateCartSummary(); }
    });

    control.querySelector('.cart-qty-btn[data-action="plus"]')?.addEventListener('click', () => {
      qty++; numEl.textContent = qty; updateCartSummary();
    });
  });

  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.cart-item');
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        item.style.transition = 'all 0.3s ease';
        setTimeout(() => { item.remove(); updateCartSummary(); }, 300);
      }
    });
  });
}

function updateCartSummary() {
  const items = document.querySelectorAll('.cart-item');
  let subtotal = 0;
  items.forEach(item => {
    const price = parseFloat(item.dataset.price || 0);
    const qty = parseInt(item.querySelector('.cart-qty-num')?.textContent || 1);
    subtotal += price * qty;
  });
  const subtotalEl = document.querySelector('.cart-subtotal-value');
  const totalEl = document.querySelector('.cart-total-value');
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

/* ---- Add to Cart Buttons ---- */
function initAddToCart() {
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId   = btn.dataset.productId || 'sv-item';
      const productName = btn.dataset.productName || 'SAINT VOID Item';
      const price       = parseFloat(btn.dataset.price || 0);
      const sizeBtn     = document.querySelector('.product-size-btn.active, .size-btn.active');
      const size        = sizeBtn ? sizeBtn.textContent.trim() : 'M';
      const qtyDisplay  = document.querySelector('.qty-display');
      const qty         = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;

      addToCart({ id: productId, name: productName, price, size, qty });
    });
  });
}

/* ---- Product Gallery ---- */
function initGallery() {
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainSlot = document.querySelector('.gallery-main-inner');
  if (!thumbs.length || !mainSlot) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const view = thumb.dataset.view;
      if (view) {
        document.querySelectorAll('.gallery-view').forEach(v => {
          v.style.display = v.dataset.view === view ? 'block' : 'none';
        });
      }
    });
  });
}

/* ---- Countdown Timer ---- */
function initCountdown() {
  const countdownEl = document.querySelector('.countdown');
  if (!countdownEl) return;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  targetDate.setHours(targetDate.getHours() + 14);
  targetDate.setMinutes(targetDate.getMinutes() + 23);

  function updateCountdown() {
    const now  = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      countdownEl.innerHTML = '<div class="countdown-unit"><span class="countdown-value">SOLD OUT</span></div>';
      return;
    }
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const dEl = countdownEl.querySelector('[data-unit="days"]');
    const hEl = countdownEl.querySelector('[data-unit="hours"]');
    const mEl = countdownEl.querySelector('[data-unit="minutes"]');
    const sEl = countdownEl.querySelector('[data-unit="seconds"]');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ---- Newsletter ---- */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value.includes('@')) {
        input.value = '';
        showToast('Welcome to the void. You\'re on the list.');
      }
    });
  });
}

/* ---- Payment Method Toggle ---- */
function initPaymentToggle() {
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
      method.classList.add('active');
      const cardFields = document.querySelector('.card-fields');
      if (cardFields) {
        cardFields.classList.toggle('visible', method.dataset.method === 'card');
      }
    });
  });
}

/* ---- Stars background ---- */
function initStars() {
  const starsContainer = document.querySelector('.hero-stars');
  if (!starsContainer) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 1200 800');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;';

  const starData = [];
  for (let i = 0; i < 120; i++) {
    starData.push({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.05
    });
  }

  starData.forEach(s => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', s.x);
    circle.setAttribute('cy', s.y);
    circle.setAttribute('r', s.r);
    circle.setAttribute('fill', 'white');
    circle.setAttribute('opacity', s.o);
    svg.appendChild(circle);
  });

  /* Lightning bolt */
  const lightning = document.createElementNS(svgNS, 'path');
  lightning.setAttribute('d', 'M 150 80 L 120 200 L 148 200 L 110 350 L 175 180 L 148 180 L 185 80 Z');
  lightning.setAttribute('fill', 'none');
  lightning.setAttribute('stroke', 'rgba(255,255,255,0.03)');
  lightning.setAttribute('stroke-width', '1');
  svg.appendChild(lightning);

  const lightning2 = document.createElementNS(svgNS, 'path');
  lightning2.setAttribute('d', 'M 1050 150 L 1020 270 L 1048 270 L 1010 420 L 1075 250 L 1048 250 L 1085 150 Z');
  lightning2.setAttribute('fill', 'rgba(255,255,255,0.015)');
  lightning2.setAttribute('stroke', 'rgba(255,255,255,0.04)');
  lightning2.setAttribute('stroke-width', '1');
  svg.appendChild(lightning2);

  starsContainer.appendChild(svg);
}

/* ---- Smooth page links ---- */
function initPageLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

/* ---- Checkout Form ---- */
function initCheckout() {
  const form = document.querySelector('.checkout-submit-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.textContent = 'Processing...';
      btn.disabled = true;
      setTimeout(() => {
        showToast('Order placed. Welcome to the void.');
        btn.textContent = 'Place Order';
        btn.disabled = false;
      }, 2000);
    }
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initAnimations();
  initAccordions();
  initSizeSelectors();
  initQtyControls();
  initCartQtyControls();
  initAddToCart();
  initGallery();
  initCountdown();
  initNewsletter();
  initPaymentToggle();
  initStars();
  initPageLinks();
  initCheckout();
});
