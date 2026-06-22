/* =============================================
   intro.js — Black screen intro with word sequence
   ============================================= */

import { AudioManager } from './audio.js';

export const IntroManager = (() => {

  // ✏️ EDIT KATA DI SINI
  const words = [
 ''
  
  ];

  // ⏱️ DURASI (detik)
  const WORDS_DURATION = 3;
  const fade_in  = WORDS_DURATION / 4;
  const fade_out = WORDS_DURATION / 4;
  const totalDuration = words.length * WORDS_DURATION * 1000;

  let started = false;

  function init() {
    const screen = document.getElementById('intro-screen');
    if (!screen) return;

    // Set scene ke zoom awal
    const scene = document.getElementById('scene');
    if (scene) scene.classList.add('intro-zoom');

    const startHandler = () => {
      if (started) return;
      started = true;

      const hint = document.getElementById('intro-tap-hint');
      if (hint) hint.style.display = 'none';

      runSequence();

      AudioManager.startWithOffset(totalDuration / 1000);

      screen.removeEventListener('click', startHandler);
      screen.removeEventListener('touchend', startHandler);
    };

    screen.addEventListener('click', startHandler);
    screen.addEventListener('touchend', (e) => {
      e.preventDefault();
      startHandler();
    });
  }

  function runSequence() {
    const textEl = document.getElementById('intro-text');
    if (!textEl) return;

    let index = 0;

    function showNext() {
      if (index >= words.length) {
        const scene = document.getElementById('scene');
        const screen = document.getElementById('intro-screen');

        if (scene) {
          scene.style.transformOrigin = '50% 50%';
          scene.classList.add('zooming', 'zoom-out');
        }

        if (screen) {
          screen.style.transition = 'opacity 0.3s ease-in';
          screen.style.opacity = '0';
        }

        setTimeout(() => {
          if (screen) screen.classList.add('hidden');
          if (scene) scene.classList.remove('intro-zoom', 'zooming', 'zoom-out');
        }, 450);
        return;
      }

      textEl.textContent = words[index];

      textEl.style.transitionDuration = `${fade_in}s`;
      textEl.style.opacity = '1';

      setTimeout(() => {
        textEl.style.transitionDuration = `${fade_out}s`;
        textEl.style.opacity = '0';

        setTimeout(() => {
          index++;
          showNext();
        }, fade_out * 1000);

      }, (WORDS_DURATION - fade_out) * 1000);
    }

    showNext();
  }

  return { init };
})();
