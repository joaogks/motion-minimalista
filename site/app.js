'use strict';
(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Checkout: every .js-buy link goes straight to the Kiwify checkout once a valid HTTPS URL exists.
  const config = window.PRODUCT_CONFIG || {};
  let checkout;
  try {
    const candidate = new URL(String(config.checkoutUrl || ''));
    if (candidate.protocol === 'https:' && candidate.hostname) checkout = candidate.href;
  } catch (_) { /* Without a valid URL the buttons keep scrolling to the offer. */ }
  const status = document.querySelector('#checkout-status');
  const buyLinks = [...document.querySelectorAll('.js-buy')];
  if (checkout) {
    buyLinks.forEach(a => { a.href = checkout; a.rel = 'noopener'; });
  } else {
    const main = document.querySelector('#buy-main');
    if (main) { main.setAttribute('aria-disabled', 'true'); main.removeAttribute('href'); }
    if (status) status.textContent = 'O checkout ainda não está disponível.';
  }

  // The one authored moment: the prompt types itself, then the result appears.
  const prompt = document.querySelector('.prompt');
  const target = prompt && prompt.querySelector('.prompt-text');
  if (prompt && target) {
    const full = target.dataset.text || target.textContent;
    if (reduceMotion.matches) {
      prompt.classList.add('done');
    } else {
      target.textContent = '';
      prompt.classList.add('typing');
      let i = 0;
      const tick = () => {
        i += 1;
        target.textContent = full.slice(0, i);
        if (i < full.length) setTimeout(tick, 28 + Math.random() * 40);
        else setTimeout(() => { prompt.classList.add('done'); prompt.classList.remove('typing'); }, 350);
      };
      setTimeout(tick, 700);
    }
  }

  // Sticky mobile CTA: visible after the hero, hidden while the offer is on screen.
  const sticky = document.querySelector('#sticky');
  const hero = document.querySelector('#inicio');
  const offer = document.querySelector('#oferta');
  if (sticky && hero && offer && 'IntersectionObserver' in window) {
    let heroOut = false, offerIn = false;
    const sync = () => {
      const on = heroOut && !offerIn;
      sticky.classList.toggle('on', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; sync(); }, { threshold: 0.05 }).observe(hero);
    new IntersectionObserver(([e]) => { offerIn = e.isIntersecting; sync(); }, { threshold: 0.1 }).observe(offer);
  }

  // Looping clips only play while visible, and never for reduced-motion users.
  const clips = [...document.querySelectorAll('.loop-video')];
  const visible = new Set();
  function update() {
    clips.forEach(v => {
      if (reduceMotion.matches || document.hidden || !visible.has(v)) v.pause();
      else v.play().catch(() => {});
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      update();
    }, { threshold: 0.25 });
    clips.forEach(v => io.observe(v));
  }
  reduceMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
