/* =============================================
   surat.js — Surat (letter) zoom + one-time narration
   Same state machine as PiguraManager: open() zooms in, close() zooms
   out on an outside click. Click-on-surat-again also closes it, so both
   "tap again to close" and "tap elsewhere to close" work.
   ============================================= */

export const SuratManager = (() => {
  let isOpen = false;
  let narrated = false; // narration guard — plays once per session, not once per open

  function init() {
    const surat = document.querySelector('.surat');
    if (!surat) return; // nothing to wire up — fail quiet

    surat.addEventListener('click', (e) => {
      e.stopPropagation(); // keep this click from also hitting the
                            // document-level outside-click listener below
      isOpen ? close() : open(surat);
    });

    surat.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen ? close() : open(surat);
    });

    surat.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen ? close() : open(surat);
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !e.target.closest('.surat')) close();
    });
    document.addEventListener('touchend', (e) => {
      if (isOpen && !e.target.closest('.surat')) {
        e.preventDefault();
        close();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (isOpen && e.key === 'Escape') close();
    });
  }

  function open(surat) {
    if (isOpen) return;
    const scene = document.getElementById('scene');
    if (!scene) return;

    // Cheap cross-manager guard: if a pigura (or anything else) is mid-zoom,
    // don't stomp on it. Real coordination between zoomable elements would
    // need a shared module — not built since nothing has needed it yet.
    if (scene.classList.contains('zoom-in') || scene.classList.contains('zooming')) return;

    isOpen = true;
    surat.setAttribute('aria-expanded', 'true');
    playNarrationOnce();

    // Piguras use a hand-tuned originMap (eyeballed per element). Surat
    // doesn't have one yet, so its origin is computed from actual layout
    // instead of guessing a percentage — swap this for a hardcoded string
    // once you've eyeballed a value you like, for parity with pigura.js.
    scene.style.transformOrigin = computeOrigin(surat, scene);
    scene.classList.add('zooming', 'zoom-in');

    scene.addEventListener('animationend', () => {
      scene.classList.remove('zooming');
    }, { once: true });
  }

  function close() {
    if (!isOpen) return;
    const scene = document.getElementById('scene');
    const surat = document.querySelector('.surat');

    scene.classList.remove('zoom-in');
    scene.classList.add('zooming', 'zoom-out');
    if (surat) surat.setAttribute('aria-expanded', 'false');

    scene.addEventListener('animationend', () => {
      isOpen = false;
      scene.classList.remove('zooming', 'zoom-out');
      scene.style.transformOrigin = '';
    }, { once: true });
  }

  function computeOrigin(el, scene) {
    const elRect = el.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const x = ((elRect.left + elRect.width / 2 - sceneRect.left) / sceneRect.width) * 100;
    const y = ((elRect.top + elRect.height / 2 - sceneRect.top) / sceneRect.height) * 100;
    return `${x}% ${y}%`;
  }

  function playNarrationOnce() {
    if (narrated) return;
    narrated = true;

    const voice = document.getElementById('voiceNarration');
    const bgMusic = document.getElementById('bgMusic');
    if (!voice) return;

    // Lazy ducking: hard pause/resume, no crossfade.
    // Ceiling: abrupt cut instead of a smooth fade.
    // Upgrade path: ease bgMusic.volume down/up over ~300ms, or reuse
    // AudioManager's existing VOLUME_KEYFRAMES easing if that's already
    // the established pattern for volume changes elsewhere.
    if (bgMusic && !bgMusic.paused) bgMusic.pause();

    voice.currentTime = 0;
    voice.play().catch(() => {});
    voice.addEventListener('ended', () => {
      if (bgMusic) bgMusic.play().catch(() => {});
    }, { once: true });
  }

  return { init };
})();
