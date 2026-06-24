/**
 * soundEffects.js — Central Web Audio synthesizer for the billing dashboard.
 *
 * All sounds are generated entirely with the Web Audio API (no .mp3 files).
 * The AudioContext is created lazily on the first call so it satisfies the
 * browser's "autoplay policy" requirement (must be triggered by a user gesture).
 *
 *  - initAudio()          → warm up AudioContext on first gesture
 *  - attachAudioInitListeners() → one-shot pointer/touch/key listeners
 *  - playClick()        → subtle 800 Hz tap feedback
 *  - playAddSuccess()   → bright double-beep (1200 Hz → 1600 Hz)
 *  - playDelete()       → low warning blip (400 Hz)
 *  - playPrint()        → rising three-tone sequence (600 → 900 → 1200 Hz)
 *
 * Legacy aliases kept for backwards compatibility:
 *  - playSuccessTone()  → same as playAddSuccess()
 *  - playPrintBeep()    → same as playPrint()
 */

// ── Shared AudioContext (one per page, created on first interaction) ─────────
let _ctx = null;
let _initListenersAttached = false;

function ctx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Chrome suspends the context if the page loses focus — resume it.
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

/**
 * Warm up the AudioContext on the first user gesture (tap, click, or key).
 * Browsers block audio until a gesture occurs — call this once at app mount.
 */
export function initAudio() {
  try {
    ctx();
  } catch (e) {
    console.warn('[soundEffects] initAudio() failed:', e.message);
  }
}

/** Attach one-shot listeners that bootstrap audio on the first interaction. */
export function attachAudioInitListeners() {
  if (_initListenersAttached || typeof window === 'undefined') return;
  _initListenersAttached = true;

  const boot = () => {
    initAudio();
    window.removeEventListener('pointerdown', boot, true);
    window.removeEventListener('touchstart', boot, true);
    window.removeEventListener('keydown', boot, true);
  };

  window.addEventListener('pointerdown', boot, true);
  window.addEventListener('touchstart', boot, { capture: true, passive: true });
  window.addEventListener('keydown', boot, true);
}

// ── Core primitive: play a single oscillator burst ───────────────────────────
/**
 * @param {number} frequency   Hz
 * @param {number} duration    seconds
 * @param {number} startTime   ctx.currentTime offset (seconds)
 * @param {number} volume      0–1 peak gain
 * @param {'sine'|'square'|'triangle'|'sawtooth'} type
 */
function tone(frequency, duration, startTime = 0, volume = 0.09, type = 'sine') {
  try {
    const c = ctx();
    const now = c.currentTime + startTime;

    const osc  = c.createOscillator();
    const gain = c.createGain();

    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // Soft attack + exponential decay tail (avoids clicks/pops)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);      // 5 ms attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.01); // tiny buffer so decay completes cleanly
  } catch (e) {
    // Silently ignore — audio is non-critical
    console.warn('[soundEffects] tone() failed:', e.message);
  }
}

// ── 1. Standard Click ─────────────────────────────────────────────────────────
/**
 * A tiny, subtle, neutral click (~800 Hz, 30 ms).
 * Use for: selecting items, opening inputs, switching filters/tabs.
 */
export function playClick() {
  // Short square-wave burst reads as a crisp electronic tap on mobile speakers.
  tone(800, 0.03, 0, 0.05, 'square');
}

// ── 2. Action / Add Success ───────────────────────────────────────────────────
/**
 * A bright, cheerful double-beep (1200 Hz → 1600 Hz).
 * Use for: item successfully added to the active invoice.
 */
export function playAddSuccess() {
  tone(1200, 0.06, 0.00, 0.09, 'sine'); // first note
  tone(1600, 0.07, 0.09, 0.09, 'sine'); // second note, slightly louder
}

// ── 3. Delete / Clear Action ─────────────────────────────────────────────────
/**
 * A lower, warning-toned blip (400 Hz, 80 ms).
 * Use for: removing an item from the bill or clearing the entire bill.
 */
export function playDelete() {
  tone(400, 0.08, 0, 0.10, 'sine');
}

// ── 4. Print Command ──────────────────────────────────────────────────────────
/**
 * A crisp, rising sequence of three short tones (600 → 900 → 1200 Hz).
 * Use for: tapping the green "Print Invoice" button.
 */
export function playPrint() {
  tone( 600, 0.055, 0.00, 0.08, 'sine');
  tone( 900, 0.055, 0.07, 0.08, 'sine');
  tone(1200, 0.070, 0.14, 0.09, 'sine');
}

// ── Legacy aliases (backwards-compat with previous session wiring) ────────────
/** @deprecated use playAddSuccess() */
export const playSuccessTone = playAddSuccess;

/** @deprecated use playPrint() */
export const playPrintBeep = playPrint;
