/**
 * The fixed Codex asset contract. Nothing outside this map exists on disk,
 * so no other image name may ever be referenced from a screen.
 */
export const assets = {
  bg: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  orb: require('../../assets/sprite_1.png'),
  rotor: require('../../assets/sprite_2.png'),
  sparkCrystal: require('../../assets/sprite_3.png'),
  funnel: require('../../assets/sprite_4.png'),
  rivet: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
} as const;

export type AssetKey = keyof typeof assets;
