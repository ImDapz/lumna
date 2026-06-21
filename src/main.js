/* =============================================
   main.js — Bootstrap all modules
   ============================================= */

import { AudioManager } from './js/audio.js';
import { FadeManager } from './js/fade.js';
import { IntroManager } from './js/intro.js';
import { PiguraManager } from './js/pigura.js';
import { SuratManager } from './js/surat.js';
// import { CandleManager } from './js/candle.js'; // add `export` to that
// file's declaration, then uncomment this + the init() call below.

document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();
  FadeManager.init();
  // CandleManager.init();
  PiguraManager.init();
  SuratManager.init();
  IntroManager.init();
});
