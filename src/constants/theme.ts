/**
 * RETRO_NEON, tuned for the Cascade Route Lab instrument-bench look.
 * HUD / sci-fi FUI: thin cyan line frames, corner brackets, glow-outline over fill-shadow.
 */
export const theme = {
  name: 'RETRO_NEON',

  colors: {
    bg: '#0A0A0F',
    surface: '#12121F',
    surfaceAlt: '#1A1A2E',
    surfaceDeep: '#16213E',

    primary: '#FF006E',
    primaryDim: '#B3005A',
    secondary: '#00F5FF',
    spark: '#FFC857',
    success: '#7FE8C5',

    text: '#F2F4FF',
    textSecondary: '#A7B0CC',
    textMuted: '#6B7493',

    channel: '#2A2F4A',
    peg: '#4A5078',

    glass: 'rgba(18,18,31,0.82)',
    glassDeep: 'rgba(12,12,24,0.88)',
    hairline: 'rgba(255,255,255,0.08)',
    borderCyan: 'rgba(0,245,255,0.16)',
    borderCyanStrong: 'rgba(0,245,255,0.45)',
    borderMagenta: 'rgba(255,0,110,0.40)',
  },

  overlays: {
    loader: ['rgba(10,10,15,0.94)', 'rgba(22,33,62,0.90)', 'rgba(10,10,15,0.97)'] as const,
    menu: ['rgba(10,10,15,0.70)', 'rgba(26,26,46,0.62)', 'rgba(10,10,15,0.88)'] as const,
    game: ['rgba(10,10,15,0.82)', 'rgba(18,18,31,0.74)', 'rgba(10,10,15,0.92)'] as const,
    panel: ['rgba(10,10,15,0.80)', 'rgba(22,33,62,0.66)', 'rgba(10,10,15,0.92)'] as const,
    win: ['rgba(0,245,255,0.18)', 'rgba(10,10,15,0.86)', 'rgba(10,10,15,0.94)'] as const,
    partial: ['rgba(255,200,87,0.16)', 'rgba(10,10,15,0.86)', 'rgba(10,10,15,0.94)'] as const,
    broken: ['rgba(255,0,110,0.18)', 'rgba(10,10,15,0.88)', 'rgba(10,10,15,0.95)'] as const,
  },

  gradients: {
    magenta: ['#FF006E', '#FF4D94'] as const,
    magentaDeep: ['#FF006E', '#B3005A'] as const,
    cyan: ['#00F5FF', '#0094B3'] as const,
    route: ['#FF006E', '#00F5FF'] as const,
    sparkBar: ['#FFC857', '#FF9500'] as const,
  },

  radius: { sm: 8, md: 14, lg: 18, xl: 22, pill: 100 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },

  type: {
    hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 4 },
    banner: { fontSize: 30, fontWeight: '800' as const, letterSpacing: 3 },
    title: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 2 },
    section: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 1.5 },
    body: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.4 },
    caption: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 2 },
    captionWide: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 2.4 },
  },

  /** tabular numbers everywhere a value changes, so counters never jump the layout */
  nums: { fontVariant: ['tabular-nums' as const] },

  shadows: {
    cta: {
      shadowColor: '#FF006E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 22,
      elevation: 10,
    },
    bar: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 12,
    },
  },

  spring: {
    press: { tension: 320, friction: 12 },
    panel: { tension: 50, friction: 9 },
    logo: { tension: 40, friction: 7 },
  },

  /** Icon contract: every button icon is exactly this many px, label lineHeight matches. */
  iconSize: 24,
  iconGap: 10,
} as const;

export type Theme = typeof theme;
