/* =============================================
   fade.js — Black overlay fade from 100% → 0%
   ============================================= */

export const FadeManager = (() => {
  function init() {
    const overlay = document.getElementById('fade-overlay');
    if (!overlay) return;

    // Small delay so the browser paints the black first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('faded');
      });
    });

    // Remove from DOM after transition
    overlay.addEventListener('transitionend', () => {
      overlay.style.display = 'none';
    }, { once: true });
  }

  return { init };
})();
