// avatars.js - fixed set of fun character/emoji avatars (no photos, child-safe, offline).

export const AVATARS = [
  '\uD83E\uDD8A', // fox
  '\uD83D\uDC31', // cat
  '\uD83D\uDC36', // dog
  '\uD83E\uDD84', // unicorn
  '\uD83D\uDC27', // penguin
  '\uD83E\uDD89', // owl
  '\uD83D\uDC2F', // tiger
  '\uD83D\uDC3C', // panda
  '\uD83D\uDE80', // rocket
  '\uD83E\uDD16', // robot
];

export function isValidAvatar(a) {
  return AVATARS.includes(a);
}

export function randomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
