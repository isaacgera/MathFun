// sprites.js - the little drawn SVG characters that ride the progress line during a round
// (v1.4). Each sprite is a small, self-contained, inline SVG string - fully offline, no
// image files, no network, trademark-safe (original simple cartoon shapes, not any
// copyrighted character). One sprite per theme (skin); unknown keys fall back to the
// default Math World sprite.
//
// Design notes:
// - Each SVG draws into a 0 0 48 48 viewBox and is sized/positioned by CSS on .runner.
// - `aria-hidden` is set on the wrapper in ui.js; these are decorative.
// - Keep the art simple and bold so it reads at ~34px on the progress line.
// - Colours are literal (kid-friendly, on-theme). We deliberately DON'T use currentColor so
//   each character keeps its own recognisable palette regardless of the light/dark theme.

// ---- The sprite registry (key -> inline <svg> string) --------------------------------
//
// v1.4 round 2: richer, more characterful original cartoons. Each draws into a 48x48 viewBox
// with a soft ground shadow, rounded bodies, highlight/shade for a bit of depth, bold eyes
// with catch-lights, rosy cheeks and a clear smile - so they read with personality even at
// ~38px. Deliberately evocative of a "type" of character, drawn as our own (trademark-safe).

export const SPRITES = {
  // Math World: a friendly round number buddy, cap with a "+", holding a pencil.
  math: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="43" rx="12" ry="2.6" fill="#000" opacity="0.14"/>
      <circle cx="24" cy="25" r="15" fill="#6d5efc"/>
      <path d="M24 10 a15 15 0 0 1 13 8 a15 15 0 0 0-26 0 a15 15 0 0 1 13-8Z" fill="#8a7dff" opacity="0.6"/>
      <circle cx="24" cy="25" r="15" fill="none" stroke="#4b3fd4" stroke-width="2"/>
      <path d="M12 17 a13 7 0 0 1 24 0Z" fill="#4b3fd4"/>
      <path d="M22 9 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 Z" fill="#ffb703" transform="translate(0 -1) scale(0.8) translate(6 2)"/>
      <circle cx="19" cy="24" r="3.1" fill="#fff"/><circle cx="29" cy="24" r="3.1" fill="#fff"/>
      <circle cx="19.6" cy="24.5" r="1.5" fill="#1f2340"/><circle cx="29.6" cy="24.5" r="1.5" fill="#1f2340"/>
      <circle cx="20.3" cy="23.6" r="0.6" fill="#fff"/><circle cx="30.3" cy="23.6" r="0.6" fill="#fff"/>
      <circle cx="16" cy="29" r="2" fill="#ff8fab" opacity="0.6"/><circle cx="32" cy="29" r="2" fill="#ff8fab" opacity="0.6"/>
      <path d="M19 30 q5 4 10 0" stroke="#1f2340" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,

  // Plumber World: a chunky red-capped little hero (cap, moustache, overalls, button).
  plumber: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M12 20 a12 11 0 0 1 24 0 q0 2-2 2 H14 q-2 0-2-2Z" fill="#e5322f"/>
      <path d="M22 11 a12 11 0 0 1 12 9 H26 q-1-6-4-9Z" fill="#ff6b5e" opacity="0.7"/>
      <circle cx="24" cy="15.5" r="3.2" fill="#fff"/><path d="M22.4 15.5 h3.2 M24 13.9 v3.2" stroke="#e5322f" stroke-width="1"/>
      <path d="M15 22 h18 v6 a9 9 0 0 1-18 0Z" fill="#ffd9b0"/>
      <circle cx="20" cy="26" r="2" fill="#1f2340"/><circle cx="28" cy="26" r="2" fill="#1f2340"/>
      <circle cx="20.6" cy="25.4" r="0.6" fill="#fff"/><circle cx="28.6" cy="25.4" r="0.6" fill="#fff"/>
      <path d="M20 30 q4 2 8 0" stroke="#5a3210" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M16 35 q8 4 16 0 l0 5 H16Z" fill="#2a7de1"/>
      <circle cx="24" cy="37.5" r="1.6" fill="#f7c331"/>
    </svg>`,

  // Dino Valley: a plump friendly green dino with back-plates, belly and little arms.
  dino: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="44" rx="13" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M10 40 q-3-3 1-6 l6-2 q-3-10 6-15 q10-5 15 5 q3 6-1 10 q5 1 7 6 l-5 0 q-2 3-6 3 Z" fill="#3f9d4e"/>
      <path d="M22 13 q9-3 13 6 q-6-6-13-6Z" fill="#5cc16b" opacity="0.7"/>
      <path d="M26 11 l3-4 1 5Zm6 2 l4-3 0 5Z" fill="#2c7a3a"/>
      <ellipse cx="22" cy="33" rx="7" ry="6" fill="#d7f0c4"/>
      <circle cx="29" cy="20" r="3" fill="#fff"/><circle cx="29.8" cy="20.4" r="1.5" fill="#1f2340"/><circle cx="30.4" cy="19.6" r="0.5" fill="#fff"/>
      <path d="M26 25 q4 2 7 0" stroke="#2c7a3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="30" r="1.8" fill="#86d98e" opacity="0.8"/>
      <rect x="14" y="38" width="4" height="5" rx="2" fill="#2c7a3a"/><rect x="24" y="38" width="4" height="5" rx="2" fill="#2c7a3a"/>
    </svg>`,

  // Speedy Hedgehog: a zippy character, swept-back blue spikes, big eyes, cheeky grin, shoe.
  hedgehog: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M26 12 q-14 2-16 14 l8-3 q-2 6 1 10 l5-5 q4 5 10 4 q8-2 8-11 q0-3-2-5 l-4 4 q1-5-4-8 q-4-2-9 0 Z" fill="#1f6feb"/>
      <path d="M26 12 q-9 1-13 9 q6-6 13-7Z" fill="#5a9bf5" opacity="0.7"/>
      <ellipse cx="27" cy="26" rx="8" ry="7.5" fill="#f2c6a0"/>
      <circle cx="24" cy="23" r="3.2" fill="#fff"/><circle cx="30" cy="23" r="3.2" fill="#fff"/>
      <circle cx="25" cy="24" r="1.7" fill="#1f2340"/><circle cx="31" cy="24" r="1.7" fill="#1f2340"/>
      <circle cx="25.6" cy="23.2" r="0.6" fill="#fff"/><circle cx="31.6" cy="23.2" r="0.6" fill="#fff"/>
      <ellipse cx="30" cy="28" rx="1.8" ry="1.4" fill="#8a4a2a"/>
      <path d="M23 30 q5 3 9 0" stroke="#1f2340" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M18 38 q5 3 11 0 l1 3 q-6 3-13 0Z" fill="#e5322f"/>
    </svg>`,

  // Magic Kingdom: a sparkly wizard sprite, pointed star hat, little cape, holding a wand.
  magic: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="23" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M13 40 q0-9 10-9 q10 0 10 9Z" fill="#8b5cf6"/>
      <circle cx="23" cy="27" r="9" fill="#ffe0c2"/>
      <path d="M23 7 l9 13 q-9 4-18 0Z" fill="#6d28d9"/>
      <path d="M23 7 l9 13 q-5 2-9 2Z" fill="#8b5cf6" opacity="0.8"/>
      <path d="M23 5 l1.4 3 3.2 .3-2.4 2.1 .8 3.1-3-1.7-3 1.7 .8-3.1-2.4-2.1 3.2-.3Z" fill="#fbbf24"/>
      <circle cx="20" cy="27" r="2.6" fill="#fff"/><circle cx="26" cy="27" r="2.6" fill="#fff"/>
      <circle cx="20.6" cy="27.4" r="1.3" fill="#1f2340"/><circle cx="26.6" cy="27.4" r="1.3" fill="#1f2340"/>
      <circle cx="17" cy="30" r="1.8" fill="#ec4899" opacity="0.6"/><circle cx="29" cy="30" r="1.8" fill="#ec4899" opacity="0.6"/>
      <path d="M19 31 q4 3 8 0" stroke="#7a1f4f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M35 13 l.9 2.4 2.4 .9-2.4 .9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z" fill="#fbbf24"/>
    </svg>`,

  // Space Blast: a smiling astronaut in a round helmet with a visor glint and antenna.
  space: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="10" ry="2.3" fill="#000" opacity="0.14"/>
      <rect x="16" y="30" width="16" height="11" rx="5" fill="#eef0ff"/>
      <rect x="16" y="30" width="16" height="11" rx="5" fill="none" stroke="#c7cbf5" stroke-width="1.5"/>
      <rect x="21" y="33" width="6" height="5" rx="2" fill="#22d3ee"/>
      <circle cx="24" cy="22" r="13" fill="#f4f6ff"/>
      <circle cx="24" cy="22" r="13" fill="none" stroke="#c7cbf5" stroke-width="2"/>
      <path d="M13 22 a11 11 0 0 1 22 0 q0 3-11 3 q-11 0-11-3Z" fill="#cfe3ff" opacity="0.55"/>
      <circle cx="20" cy="22" r="2.6" fill="#1f2340"/><circle cx="28" cy="22" r="2.6" fill="#1f2340"/>
      <circle cx="20.8" cy="21.1" r="0.8" fill="#fff"/><circle cx="28.8" cy="21.1" r="0.8" fill="#fff"/>
      <circle cx="16.5" cy="25" r="1.8" fill="#ff8fab" opacity="0.6"/><circle cx="31.5" cy="25" r="1.8" fill="#ff8fab" opacity="0.6"/>
      <path d="M20 26 q4 3 8 0" stroke="#1f2340" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="24" y1="9" x2="24" y2="5" stroke="#9aa0d8" stroke-width="1.6"/><circle cx="24" cy="4" r="1.8" fill="#f5c518"/>
    </svg>`,

  // Ocean Deep: a smiley octopus with curling tentacles and little suckers.
  ocean: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="12" ry="2.3" fill="#000" opacity="0.12"/>
      <path d="M11 26 a13 12 0 0 1 26 0 v4 H11Z" fill="#0891b2"/>
      <path d="M13 20 a12 10 0 0 1 20 0 q-10-4-20 0Z" fill="#3fb6cf" opacity="0.6"/>
      <g fill="#0891b2" stroke="#0e7490" stroke-width="0.6">
        <path d="M11 30 q-3 7 2 9 q3-4 1-9Z"/><path d="M17 31 q-2 8 2 9 q3-5 1-9Z"/>
        <path d="M24 31 q0 8 2 9 q3-2 2-9Z"/>
        <path d="M31 31 q2 8-2 9 q-3-5-1-9Z"/><path d="M37 30 q3 7-2 9 q-3-4-1-9Z"/>
      </g>
      <circle cx="33" cy="37" r="1" fill="#0e7490"/><circle cx="15" cy="37" r="1" fill="#0e7490"/>
      <circle cx="20" cy="24" r="3" fill="#fff"/><circle cx="28" cy="24" r="3" fill="#fff"/>
      <circle cx="20.6" cy="24.4" r="1.5" fill="#1f2340"/><circle cx="28.6" cy="24.4" r="1.5" fill="#1f2340"/>
      <circle cx="21.3" cy="23.5" r="0.6" fill="#fff"/><circle cx="29.3" cy="23.5" r="0.6" fill="#fff"/>
      <circle cx="16" cy="27" r="1.8" fill="#f472b6" opacity="0.5"/><circle cx="32" cy="27" r="1.8" fill="#f472b6" opacity="0.5"/>
      <path d="M20 28 q4 3 8 0" stroke="#083344" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  // Jungle Safari: a cheeky monkey with big ears, muzzle, tuft and a curled tail.
  jungle: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M38 34 q6-2 4-8 q-2 3-5 3" stroke="#8a5a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="13" cy="20" r="5" fill="#8a5a2b"/><circle cx="35" cy="20" r="5" fill="#8a5a2b"/>
      <circle cx="13" cy="20" r="2.6" fill="#c98a4b"/><circle cx="35" cy="20" r="2.6" fill="#c98a4b"/>
      <circle cx="24" cy="24" r="13" fill="#a46a33"/>
      <path d="M24 11 q10 0 12 10 q-6-7-12-7Z" fill="#bd834a" opacity="0.7"/>
      <path d="M22 11 q2-3 4 0" stroke="#7a4a1f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="24" cy="28" rx="8.5" ry="7.5" fill="#f2d2a9"/>
      <circle cx="20" cy="23" r="2.6" fill="#fff"/><circle cx="28" cy="23" r="2.6" fill="#fff"/>
      <circle cx="20.6" cy="23.4" r="1.4" fill="#1f2340"/><circle cx="28.6" cy="23.4" r="1.4" fill="#1f2340"/>
      <ellipse cx="22" cy="28" rx="1.3" ry="1" fill="#8a5a2b"/><ellipse cx="26" cy="28" rx="1.3" ry="1" fill="#8a5a2b"/>
      <path d="M20 31 q4 3 8 0" stroke="#5a3a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  // Candy Land: a glossy swirl-lollipop friend on a stick, with a candy-stripe swirl.
  candy: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="7" ry="2.2" fill="#000" opacity="0.12"/>
      <rect x="22.5" y="26" width="3" height="16" rx="1.5" fill="#f3e2c0"/>
      <rect x="22.5" y="26" width="1.3" height="16" rx="0.6" fill="#fff" opacity="0.6"/>
      <circle cx="24" cy="18" r="13" fill="#ec4899"/>
      <path d="M24 18 m0-11 a11 11 0 0 1 0 22 a8 8 0 0 0 0-16 a5 5 0 0 1 0-6Z" fill="#fff" opacity="0.45"/>
      <path d="M13 24 a13 13 0 0 1 9-20 a13 13 0 0 0-5 20Z" fill="#fff" opacity="0.35"/>
      <circle cx="20" cy="16" r="2.6" fill="#fff"/><circle cx="28" cy="16" r="2.6" fill="#fff"/>
      <circle cx="20.6" cy="16.4" r="1.3" fill="#1f2340"/><circle cx="28.6" cy="16.4" r="1.3" fill="#1f2340"/>
      <circle cx="21.3" cy="15.5" r="0.6" fill="#fff"/><circle cx="29.3" cy="15.5" r="0.6" fill="#fff"/>
      <circle cx="16" cy="20" r="2" fill="#fca5c6" opacity="0.8"/><circle cx="32" cy="20" r="2" fill="#fca5c6" opacity="0.8"/>
      <path d="M20 21 q4 3 8 0" stroke="#7a1f4f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  // Robot Lab: a friendly boxy bot, domed head, antenna, screen face, side ears, arms.
  robot: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <line x1="24" y1="8" x2="24" y2="12" stroke="#64748b" stroke-width="2"/><circle cx="24" cy="7" r="2.4" fill="#f59e0b"/>
      <path d="M12 20 q0-8 12-8 q12 0 12 8 v12 a4 4 0 0 1-4 4 H16 a4 4 0 0 1-4-4Z" fill="#3b82f6"/>
      <path d="M12 20 q0-8 12-8 q6 0 9 2 q-9-1-14 6Z" fill="#7cb0ff" opacity="0.6"/>
      <rect x="10" y="22" width="3" height="7" rx="1.5" fill="#64748b"/><rect x="35" y="22" width="3" height="7" rx="1.5" fill="#64748b"/>
      <rect x="15" y="19" width="18" height="11" rx="4" fill="#0b1b3a"/>
      <circle cx="20" cy="24" r="2.6" fill="#22d3ee"/><circle cx="28" cy="24" r="2.6" fill="#22d3ee"/>
      <circle cx="20.8" cy="23.2" r="0.7" fill="#fff"/><circle cx="28.8" cy="23.2" r="0.7" fill="#fff"/>
      <path d="M20 28 q4 2 8 0" stroke="#22d3ee" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <rect x="15" y="36" width="5" height="6" rx="2" fill="#64748b"/><rect x="28" y="36" width="5" height="6" rx="2" fill="#64748b"/>
    </svg>`,

  // ---- v1.4 NEW themes (original, trademark-safe vibe-alikes) ----

  // Honey Woods: a plump cosy storybook bear hugging a little honey pot.
  honey: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="12" ry="2.5" fill="#000" opacity="0.14"/>
      <circle cx="13" cy="15" r="5.5" fill="#d9952f"/><circle cx="35" cy="15" r="5.5" fill="#d9952f"/>
      <circle cx="13" cy="15" r="2.8" fill="#c07d1c"/><circle cx="35" cy="15" r="2.8" fill="#c07d1c"/>
      <circle cx="24" cy="24" r="15" fill="#edb14a"/>
      <path d="M24 10 a15 15 0 0 1 13 8 a15 15 0 0 0-26 0 a15 15 0 0 1 13-8Z" fill="#f6c870" opacity="0.7"/>
      <ellipse cx="24" cy="29" rx="8" ry="6.5" fill="#fbe6b4"/>
      <circle cx="19" cy="22" r="2.6" fill="#fff"/><circle cx="29" cy="22" r="2.6" fill="#fff"/>
      <circle cx="19.5" cy="22.4" r="1.6" fill="#3b2a12"/><circle cx="29.5" cy="22.4" r="1.6" fill="#3b2a12"/>
      <circle cx="20.2" cy="21.5" r="0.6" fill="#fff"/><circle cx="30.2" cy="21.5" r="0.6" fill="#fff"/>
      <ellipse cx="24" cy="27" rx="2.2" ry="1.6" fill="#3b2a12"/>
      <circle cx="15.5" cy="27" r="2" fill="#f0a35a" opacity="0.7"/><circle cx="32.5" cy="27" r="2" fill="#f0a35a" opacity="0.7"/>
      <path d="M20 31 q4 3 8 0" stroke="#3b2a12" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M28 34 h9 v5 a2 2 0 0 1-2 2 h-5 a2 2 0 0 1-2-2Z" fill="#e58f2a"/>
      <rect x="27" y="33" width="11" height="2.4" rx="1.2" fill="#b96e18"/>
    </svg>`,

  // Kart Racers: a cheery driver in a little red kart with a helmet, number & racing stripe.
  kart: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="45" rx="15" ry="2.2" fill="#000" opacity="0.12"/>
      <circle cx="13" cy="37" r="6.5" fill="#1f2340"/><circle cx="13" cy="37" r="2.6" fill="#cbd5e1"/>
      <circle cx="35" cy="37" r="6.5" fill="#1f2340"/><circle cx="35" cy="37" r="2.6" fill="#cbd5e1"/>
      <path d="M7 33 q1-10 11-10 h7 l5 6 h7 q4 0 4 4 v0 H7Z" fill="#e11d48"/>
      <path d="M7 33 q1-9 10-9 l-2 9Z" fill="#ff5277" opacity="0.6"/>
      <rect x="9" y="30" width="30" height="2.4" fill="#fff" opacity="0.8"/>
      <path d="M18 23 h7 l4 5 h-11Z" fill="#7dd3fc"/>
      <circle cx="22" cy="18" r="5.5" fill="#dc2626"/>
      <path d="M16.6 17 a5.5 5.5 0 0 1 10.8 0Z" fill="#b91c1c"/>
      <rect x="18" y="16.5" width="8" height="4" rx="2" fill="#bae6fd"/>
      <circle cx="21" cy="18.4" r="1.2" fill="#1f2340"/><circle cx="24" cy="18.4" r="1.2" fill="#1f2340"/>
      <circle cx="24" cy="28" r="2.4" fill="#fff"/><text x="24" y="30" font-size="4" font-weight="900" text-anchor="middle" fill="#e11d48">1</text>
    </svg>`,

  // Piggy Puddles: a happy piglet in red wellies, splashing - snout, ears, little boots.
  piggy: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="12" ry="2.4" fill="#000" opacity="0.12"/>
      <path d="M14 13 q2-4 5-2 l-1 6Zm20 0 q-2-4-5-2 l1 6Z" fill="#f17ba6"/>
      <circle cx="24" cy="24" r="14" fill="#ff9ec4"/>
      <path d="M24 11 a14 14 0 0 1 12 7 a14 14 0 0 0-24 0 a14 14 0 0 1 12-7Z" fill="#ffb8d4" opacity="0.7"/>
      <ellipse cx="24" cy="27" rx="7.5" ry="6" fill="#f47aa8"/>
      <ellipse cx="21.5" cy="27" rx="1.4" ry="1.8" fill="#9d2b5e"/><ellipse cx="26.5" cy="27" rx="1.4" ry="1.8" fill="#9d2b5e"/>
      <circle cx="19" cy="21" r="2.6" fill="#fff"/><circle cx="29" cy="21" r="2.6" fill="#fff"/>
      <circle cx="19.5" cy="21.4" r="1.4" fill="#1f2340"/><circle cx="29.5" cy="21.4" r="1.4" fill="#1f2340"/>
      <circle cx="20.2" cy="20.5" r="0.6" fill="#fff"/><circle cx="30.2" cy="20.5" r="0.6" fill="#fff"/>
      <circle cx="15" cy="25" r="2" fill="#f25f97" opacity="0.6"/><circle cx="33" cy="25" r="2" fill="#f25f97" opacity="0.6"/>
      <path d="M19 32 q5 3 10 0" stroke="#9d2b5e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <rect x="16" y="36" width="5" height="6" rx="2" fill="#e11d48"/><rect x="27" y="36" width="5" height="6" rx="2" fill="#e11d48"/>
      <path d="M9 42 q3-3 5 0 M34 42 q3-3 5 0" stroke="#7dd3fc" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8"/>
    </svg>`,

  // Robo Cat: a round sky-blue robotic cat - big white face, cat eyes, red nose, collar & bell.
  robocat: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="12" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M13 14 l5 6-8 2Zm22 0 l-5 6 8 2Z" fill="#2aa5e0"/>
      <circle cx="24" cy="24" r="15" fill="#36b7f2"/>
      <path d="M24 9 a15 15 0 0 1 13 8 a15 15 0 0 0-26 0 a15 15 0 0 1 13-8Z" fill="#6cccf7" opacity="0.6"/>
      <circle cx="24" cy="27" r="10" fill="#fff"/>
      <ellipse cx="20" cy="20" rx="3.2" ry="3.8" fill="#fff" stroke="#1f2340" stroke-width="1.1"/>
      <ellipse cx="28" cy="20" rx="3.2" ry="3.8" fill="#fff" stroke="#1f2340" stroke-width="1.1"/>
      <circle cx="21" cy="21" r="1.4" fill="#1f2340"/><circle cx="27" cy="21" r="1.4" fill="#1f2340"/>
      <circle cx="24" cy="25" r="2.2" fill="#e5322f"/><circle cx="23.3" cy="24.4" r="0.7" fill="#fff"/>
      <path d="M24 27 V33" stroke="#1f2340" stroke-width="1.3"/>
      <path d="M17 30 q7 4 14 0" stroke="#1f2340" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M13 26 l-5 1 M13 29 l-5 2 M35 26 l5 1 M35 29 l5 2" stroke="#1f2340" stroke-width="1" stroke-linecap="round"/>
      <rect x="13" y="35" width="22" height="3.4" rx="1.7" fill="#e5322f"/>
      <circle cx="24" cy="39.5" r="2.4" fill="#f5c518" stroke="#b8860b" stroke-width="0.8"/><circle cx="24" cy="40.3" r="0.6" fill="#8a6a00"/>
    </svg>`,

  // Little Explorer: a bright-eyed round-headed toddler in a yellow jumper, tuft of hair.
  explorer: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill="#000" opacity="0.14"/>
      <path d="M14 39 q0-10 10-10 q10 0 10 10Z" fill="#f5a623"/>
      <path d="M14 39 q0-10 10-10 q4 0 6 1 q-8 2-9 9Z" fill="#ffc152" opacity="0.7"/>
      <circle cx="24" cy="20" r="11" fill="#f6c99f"/>
      <path d="M13 18 a11 11 0 0 1 22 0 q-6-7-11-7 q-6 0-11 7Z" fill="#4b2e14"/>
      <path d="M24 9 q2-3 4 0 q-2 1-4 0Z" fill="#4b2e14"/>
      <circle cx="19.5" cy="20" r="2.8" fill="#fff"/><circle cx="28.5" cy="20" r="2.8" fill="#fff"/>
      <circle cx="20" cy="20.5" r="1.6" fill="#1f2340"/><circle cx="29" cy="20.5" r="1.6" fill="#1f2340"/>
      <circle cx="20.7" cy="19.6" r="0.6" fill="#fff"/><circle cx="29.7" cy="19.6" r="0.6" fill="#fff"/>
      <circle cx="16" cy="24" r="2.2" fill="#f9a8c0" opacity="0.8"/><circle cx="32" cy="24" r="2.2" fill="#f9a8c0" opacity="0.8"/>
      <path d="M20 25 q4 3.5 8 0" stroke="#7a1f14" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
};

// Default used before a profile exists / for unknown keys.
export const DEFAULT_SPRITE_KEY = 'math';

// Return the inline SVG string for a theme key (safe fallback to Math World).
export function spriteFor(themeKey) {
  return SPRITES[themeKey] || SPRITES[DEFAULT_SPRITE_KEY];
}
