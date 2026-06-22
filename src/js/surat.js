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
    // doesn't have one yet, so its origin is computed from		 actual layout
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
    const surat = document.getElementById('surat');
  
    scene.classList.remove('zoom-in');
    scene.classList.add('zooming', 'zoom-out');
    if (surat) surat.setAttribute('aria-expanded', 'false');
  
    // 🛠️ TAMBAHKAN KODE INI: Kembalikan volume musik jika surat ditutup
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      bgMusic.volume = 1.0; 
    }
  
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

  // Variabel global di luar fungsi untuk menyimpan Audio Context agar tidak terbuat berulang-ulang
  let audioCtx = null;
  let gainNode = null;
  let source = null;
  
  function playNarrationOnce() {
    if (narrated) return;
    narrated = true;
  
    const voice = document.getElementById('voiceNarration');
    const bgMusic = document.getElementById('bgMusic');
    if (!voice) return;
  
    // 1. Kecilkan musik latar seperti biasa
    if (bgMusic && !bgMusic.paused) {
      bgMusic.volume = 0.2; 
    }
  
    try {
      // 2. Setup Web Audio API untuk mendongkrak volume suara narator
      if (!audioCtx) {
        // Buat Audio Context baru jika belum ada
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Buat node penguat suara (Gain Node)
        gainNode = audioCtx.createGain();
        
        // Hubungkan elemen audio narator ke dalam sistem Web Audio API
        source = audioCtx.createMediaElementSource(voice);
        
        // Hubungkan suara -> penguat suara -> speaker device
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
      }
  
      // 3. SET VOLUMENYA DI SINI MENJADI 2.0 (2x lipat lebih keras dari aslinya)
      gainNode.gain.value = 2.0;
  
      // Pastikan audio context dalam kondisi aktif (mengatasi kebijakan browser)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
  
    } catch (e) {
      console.log("Web Audio API setup:", e);
    }
  
    // 4. Mainkan suara narator
    voice.play().catch(() => {});
  
    // Ketika suara narator selesai, kembalikan volume musik ke normal (100%)
    voice.addEventListener('ended', () => {
      if (bgMusic) {
        bgMusic.volume = 1.0; 
      }
    }, { once: true });
  }

  return { init };
})();
