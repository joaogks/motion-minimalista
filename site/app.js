'use strict';
(() => {
  const config = window.PRODUCT_CONFIG || {};
  const button = document.querySelector('.purchase-button');
  const status = document.querySelector('#checkout-status');
  let checkout;
  try {
    const candidate = new URL(String(config.checkoutUrl || ''));
    if (candidate.protocol === 'https:' && candidate.hostname) checkout = candidate.href;
  } catch (_) { /* Keep purchase unavailable until a real HTTPS URL exists. */ }
  if (checkout && button && status) {
    button.disabled = false;
    button.innerHTML = 'Quero meu acesso — R$ 67,90 <span aria-hidden="true">↗</span>';
    status.textContent = 'Você será direcionado ao checkout para conferir os dados e finalizar a compra.';
    button.addEventListener('click', () => { window.location.assign(checkout); });
  }
  const support = document.querySelector('#support-link');
  const email = String(config.supportEmail || '').trim();
  if (support && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) {
    support.href = `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
    support.hidden = false;
  }

  // Real video snippets provide motion; they are never forced on reduced-motion users.
  // Native controls always remain available, including pause, seek and fullscreen.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [...document.querySelectorAll('.loop-video')];
  const manuallyPaused = new WeakSet();
  const visibleClips = new Set();
  clips.forEach(video => {
    video.addEventListener('pause', () => {
      if (!video.dataset.systemPause) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
  });
  function pause(video) {
    if (video.paused) return;
    video.dataset.systemPause = 'true';
    video.pause();
    // The media pause event is queued, so clear the flag after it is dispatched.
    setTimeout(() => delete video.dataset.systemPause, 100);
  }
  function update() {
    clips.forEach(video => {
      if (reduceMotion.matches || document.hidden || !visibleClips.has(video)) pause(video);
      else if (!manuallyPaused.has(video)) video.play().catch(() => {});
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleClips.add(entry.target) : visibleClips.delete(entry.target));
      update();
    }, { threshold: 0.25 });
    clips.forEach(video => observer.observe(video));
  }
  reduceMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
