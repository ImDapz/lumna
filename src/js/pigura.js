import { AudioManager } from './audio.js';

export const PiguraManager = (() => {
  let isOpen = false;

  const originMap = {
    '1': '92.5% -15%',
    '2': '-7.5% -30%',
    '3': '-2.5% 0%',
    '4': '-2.5% 45%',   // ← kamu adjust sendiri
    '5': '95.5% 40%',   // ← kamu adjust sendiri
    '6': '-7.5% 80%',   // ← kamu adjust sendiri
  };

  function init() {
    document.querySelectorAll('.pigura').forEach(el => {
      el.addEventListener('click', (e) => open(e, el));
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(e, el);
      });
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !e.target.closest('.pigura')) close();
    });
    document.addEventListener('touchend', (e) => {
      if (isOpen && !e.target.closest('.pigura')) {
        e.preventDefault();
        close();
      }
    });
  }

  function open(e, el) {
    if (isOpen) return;
    isOpen = true;

    AudioManager.play('angin');

    const piguraId = el.getAttribute('data-pigura');
    const scene = document.getElementById('scene');
    scene.style.transformOrigin = originMap[piguraId] || '50% 50%';
    scene.classList.add('zooming', 'zoom-in');

    scene.addEventListener('animationend', () => {
      scene.classList.remove('zooming');
    }, { once: true });
  }

  function close() {
    if (!isOpen) return;
    const scene = document.getElementById('scene');

    scene.classList.remove('zoom-in');
    scene.classList.add('zooming', 'zoom-out');

    scene.addEventListener('animationend', () => {
      isOpen = false;
      scene.classList.remove('zooming', 'zoom-out');
      scene.style.transformOrigin = '';
    }, { once: true });
  }

  return { init };
})();
