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

/* ---- Animated canvas particle stars ---- */
function initStars() {
  const container = document.querySelector('.hero-stars');
  const hero      = document.querySelector('.hero');
  if (!container || !hero) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const ctx     = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width  = hero.offsetWidth  || window.innerWidth;
    canvas.height = hero.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const isMobile = window.innerWidth < 768;
  const COUNT    = isMobile ? 55 : 115;

  const particles = Array.from({ length: COUNT }, () => ({
    x:            Math.random() * canvas.width,
    y:            Math.random() * canvas.height,
    r:            Math.random() * 1.35 + 0.15,
    baseO:        Math.random() * 0.13 + 0.025,
    vx:           (Math.random() - 0.5) * 0.14,
    vy:           -(Math.random() * 0.09 + 0.02),
    phase:        Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.5 + 0.18,
    wobble:       (Math.random() - 0.5) * 0.2
  }));

  let t = 0, raf;

  function frame() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (reduced) {
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.baseO * 0.55})`;
        ctx.fill();
      });
      return;
    }

    t += 0.016;
    particles.forEach(p => {
      const o = p.baseO * (0.38 + 0.62 * Math.abs(Math.sin(t * p.twinkleSpeed + p.phase)));
      p.x += p.vx + Math.sin(t * 0.38 + p.phase) * p.wobble;
      p.y += p.vy;
      if (p.x < -4)  p.x = W + 4;
      if (p.x > W+4) p.x = -4;
      if (p.y < -4)  p.y = H + 4;
      if (p.y > H+4) p.y = -4;

      if (p.r > 0.85) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
        g.addColorStop(0, `rgba(255,255,255,${o * 0.65})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${o})`;
      ctx.fill();
    });

    raf = requestAnimationFrame(frame);
  }

  frame();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden)  { cancelAnimationFrame(raf); }
    else if (!reduced)    { raf = requestAnimationFrame(frame); }
  });
}

/* ---- Mouse parallax depth ---- */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const atmo    = hero.querySelector('.hero-atmospheric');
  const stars   = hero.querySelector('.hero-stars');
  const content = hero.querySelector('.hero-content');

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
    ty = ((e.clientY - r.top)   / r.height - 0.5) * 2;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  (function tick() {
    cx += (tx - cx) * 0.055;
    cy += (ty - cy) * 0.055;
    if (atmo)    atmo.style.transform    = `translate(${cx * -22}px, ${cy * -13}px) scale(1.05)`;
    if (stars)   stars.style.transform   = `translate(${cx * -9}px,  ${cy * -6}px)`;
    if (content) content.style.transform = `translate(${cx * 5}px,   ${cy * 3}px)`;
    requestAnimationFrame(tick);
  })();
}

/* ---- JS lightning flashes ---- */
function initHeroLightning() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bolts = [
    document.getElementById('heroLightning1'),
    document.getElementById('heroLightning2')
  ].filter(Boolean);
  if (!bolts.length) return;

  function flash(bolt) {
    bolt.style.filter     = 'brightness(5) opacity(1)';
    bolt.style.transition = 'filter 0.06s ease';
    setTimeout(() => {
      bolt.style.filter     = '';
      bolt.style.transition = 'filter 0.5s ease';
      if (Math.random() > 0.42) {
        setTimeout(() => {
          bolt.style.filter     = 'brightness(4) opacity(1)';
          bolt.style.transition = 'filter 0.05s ease';
          setTimeout(() => {
            bolt.style.filter     = '';
            bolt.style.transition = 'filter 0.6s ease';
          }, 60);
        }, 130);
      }
    }, 85);
  }

  (function schedule() {
    setTimeout(() => {
      flash(bolts[Math.floor(Math.random() * bolts.length)]);
      schedule();
    }, 2800 + Math.random() * 7500);
  })();
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
  initHeroParallax();
  initHeroLightning();
  initPageLinks();
  initCheckout();
});
