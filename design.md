---
name: Neon Nexus
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#fface8'
  on-secondary: '#5e0053'
  secondary-container: '#ff24e4'
  on-secondary-container: '#520049'
  tertiary: '#faf3ff'
  on-tertiary: '#3c0090'
  tertiary-container: '#e1d2ff'
  on-tertiary-container: '#7213ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffd7f0'
  secondary-fixed-dim: '#fface8'
  on-secondary-fixed: '#3a0033'
  on-secondary-fixed-variant: '#840076'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d1bcff'
  on-tertiary-fixed: '#23005b'
  on-tertiary-fixed-variant: '#5700c9'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-game:
    fontFamily: Sora
    fontSize: 80px
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-gap: 1rem
  section-padding: 2rem
  container-max: 1200px
  touch-target: 48px
---

## Brand & Style

The design system is built on a **Cyber-Playful** aesthetic, merging the precision of futuristic interfaces with the high-energy vibe of arcade gaming. It targets a digital-native audience that values speed, responsiveness, and visual flair. 

The style utilizes a **Glassmorphism** approach layered over a deep, structural foundation. By combining high-contrast neon accents with translucent surfaces and vibrant background blurs, the UI feels both immersive and lightweight. The emotional response is intended to be electric and competitive, yet polished—moving away from "retro" tropes into a sleek, modern "web3-adjacent" visual language.

## Colors

This design system utilizes a high-octane dark mode palette. The background is a deep, saturated navy (`#0F172A`) which provides the necessary contrast for the neon functional colors.

- **Primary (Cyan - #00F0FF):** Assigned to the 'X' player and primary action highlights. It represents energy and precision.
- **Secondary (Magenta - #FF00E5):** Assigned to the 'O' player and secondary emphasis points. It represents vibrancy and disruption.
- **Tertiary (Electric Violet - #7000FF):** Used for ambient glows, accent borders, and victory states.
- **Surface:** Uses a desaturated version of the neutral color with varying levels of transparency (10-20%) to create glass effects.

## Typography

The typography strategy focuses on a hierarchy of geometric precision. **Sora** is used for display and headline levels to provide a futuristic, tech-forward character with its wide stance and distinct apertures. 

For functional UI and long-form reading, **Hanken Grotesk** offers high legibility without losing the modern edge. **Geist** is employed for labels and scoreboard stats to provide a monospaced-adjacent feel that suggests "data" and "logic," reinforcing the gaming engine aesthetic. 

- Use `display-game` specifically for the X and O symbols within the grid.
- All labels should be rendered in `label-caps` with increased tracking for a technical look.

## Layout & Spacing

The layout follows a **Fluid Grid** model focused on a centralized 3x3 game board. The core experience is contained within a "Stage" that maintains a 1:1 aspect ratio for the game grid while the surrounding UI (Scoreboard, Controls) scales responsively.

- **Desktop:** A 12-column grid. The game board occupies the central 6 columns.
- **Mobile:** A 4-column grid. The game board spans the full width minus side margins (24px).
- **Rhythm:** An 8px base unit drives all padding and margins. The spacing between cells in the grid must be consistent (`grid-gap`) to allow the background glow to bleed through the "gutters."

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Vibrant Blurs** rather than traditional drop shadows.

1.  **Base:** Deep neutral background.
2.  **Mid-Ground:** Semi-transparent "Glass" cards (15% white or primary color opacity) with a `20px` backdrop blur.
3.  **Top-Ground:** Interactive elements that use "Internal Glows" (inner shadows) to simulate light-emitting surfaces.
4.  **Highlights:** Neon accents use a "Drop Glow"—a box-shadow with a high blur radius (`20px-40px`) and low opacity (`30%`) matching the accent's hex code.

Borders should be thin (1px) and use linear gradients that simulate light hitting an edge.

## Shapes

The shape language uses **Rounded** geometry to balance the "sharp" digital aesthetic with a playful, approachable feel. 

- **Cells & Cards:** Use the `rounded-lg` (1rem) standard to ensure the grid feels friendly.
- **Small Elements:** Chips and small buttons use the base `0.5rem` roundedness.
- **Interactive States:** When a cell is "claimed," the transition of the shape (the X or O) should be fluid, while the cell container maintains its radius.

## Components

### The Game Grid
The 3x3 grid consists of nine individual glass-morphic cells. Each cell should have a subtle 1px border. On hover, cells should trigger a `primary-color` or `secondary-color` inner glow depending on whose turn it is.

### Symbols (X & O)
- **X (Cyan):** Drawn with a thick stroke and rounded caps. Apply an outer glow.
- **O (Magenta):** A perfect circle with a thick stroke. Apply an outer glow.
- Symbols should animate in using a "scale-up" and "spring" effect.

### Buttons
- **Primary:** Solid `primary_color` background with black text for maximum contrast.
- **Ghost:** Transparent background with a `1px` neon border and text in the same color.
- **Hover State:** Increase the glow intensity and slightly lift the element using a subtle `translateY(-2px)` transform.

### Status Indicators
Use a "Status Bar" component at the top of the grid to announce turns, draws, or victories. Victory states should trigger a "Confetti" or "Grid Pulse" effect using the winner's color.