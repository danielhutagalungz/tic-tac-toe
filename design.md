---
name: Chlorophyll Minimalist
colors:
  surface: '#0d150f'
  surface-dim: '#0d150f'
  surface-bright: '#333b34'
  surface-container-lowest: '#08100a'
  surface-container-low: '#151d17'
  surface-container: '#19221b'
  surface-container-high: '#242c25'
  surface-container-highest: '#2e3730'
  on-surface: '#dce5db'
  on-surface-variant: '#bccabb'
  inverse-surface: '#dce5db'
  inverse-on-surface: '#2a322c'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#4de082'
  primary: '#6bfb9a'
  on-primary: '#003919'
  primary-container: '#4ade80'
  on-primary-container: '#005e2d'
  inverse-primary: '#006d36'
  secondary: '#8bd6b4'
  on-secondary: '#003827'
  secondary-container: '#005c42'
  on-secondary-container: '#87d2b0'
  tertiary: '#cae7d0'
  on-tertiary: '#1d3526'
  tertiary-container: '#afcbb5'
  on-tertiary-container: '#3d5745'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6dfe9c'
  primary-fixed-dim: '#4de082'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#a6f2cf'
  secondary-fixed-dim: '#8bd6b4'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#cdead3'
  tertiary-fixed-dim: '#b1cdb7'
  on-tertiary-fixed: '#072012'
  on-tertiary-fixed-variant: '#334c3b'
  background: '#0d150f'
  on-background: '#dce5db'
  surface-variant: '#2e3730'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
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
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The brand personality is rooted in organic minimalism—a "digital greenhouse" that feels breathable, quiet, and alive. It targets users who appreciate calm, focused environments, moving away from high-energy tech aesthetics toward a more grounded, restorative experience. 

The design style combines **Minimalism** with subtle **Organic** influences. It utilizes expansive negative space, high-quality typography, and a "living" color palette. Surfaces are treated with deep, rhythmic tonal changes rather than heavy ornamentation, ensuring the interface feels as light and natural as a forest canopy.

## Colors
The palette is a monochromatic exploration of green, optimized for a deep dark-mode experience.
- **Primary (#4ADE80):** A vibrant "Leaf Green" used for calls to action, active states, and essential brand moments.
- **Secondary (#A7F3D0):** A "Soft Mint" used for supportive elements, highlights, and subtle background accents.
- **Tertiary (#364F3E):** A "Moss/Forest" mid-tone for containers, borders, and secondary text backgrounds.
- **Neutral (#0F1711):** An extremely deep "Night Forest" black-green, serving as the primary canvas to reduce eye strain and provide maximum contrast for the leaf accents.

Apply color with restraint to maintain the minimalist ethos. Functional colors (success, error, warning) should be desaturated to stay within the organic tonal range.

## Typography
This design system pairs **Sora** for headlines with **Hanken Grotesk** for body and UI elements. 
- **Sora** provides a geometric, modern, and slightly wide structure that feels architectural and fresh. Use it for impactful headers to anchor the page.
- **Hanken Grotesk** offers exceptional legibility and a clean, sharp aesthetic for long-form reading and functional labels. 

Maintain generous line heights to preserve the "breathable" quality of the brand. Use "Label-MD" in all-caps for category headers or overlines to create a clear structural hierarchy.

## Layout & Spacing
The layout follows a **Fluid Grid** logic built on an 8px base unit. 
- **Desktop:** 12-column grid with 64px outside margins and 24px gutters. Use large vertical gaps (80px+) between major sections to emphasize the minimalist style.
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 20px margins.

Spacing should prioritize asymmetrical balance; avoid crowding elements. Use "white space" (or in this case, "deep green space") as a functional tool to group related content rather than relying on lines or boxes.

## Elevation & Depth
In this dark, organic environment, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines**. 
- **Level 0 (Base):** The deep `#0F1711` background.
- **Level 1 (Cards/Containers):** A slightly lighter shade of the forest green (`#1A261D`) with a subtle 1px border using a 10% opacity primary green.
- **Level 2 (Modals/Popovers):** These surfaces use a very soft backdrop blur (12px) to suggest a glass-like transparency, allowing the background "foliage" colors to peak through.

Avoid heavy black shadows. Instead, use "glow shadows"—very low-opacity Primary Green blurs—to indicate active or hovered states.

## Shapes
The shape language is defined by **Moderate Roundness (8px / 0.5rem)**. This provides a balance between the precision of tech and the softness of nature.
- **Buttons & Inputs:** 8px (0.5rem) corner radius.
- **Cards & Large Containers:** 16px (1rem) corner radius.
- **Floating Action Buttons/Tags:** 24px+ (1.5rem) to create a "pebble" feel.

All shapes should feel purposeful and tactile, avoiding sharp 90-degree angles to maintain the "approachable" brand promise.

## Components
- **Buttons:** Primary buttons use a solid Leaf Green (`#4ADE80`) fill with dark text. Secondary buttons use an "Outlined" style with a Moss Green border and no fill.
- **Chips:** Small, pill-shaped elements with a Tertiary Green background and Mint text. Use these for tags or categories.
- **Input Fields:** Ghost-style inputs. A subtle bottom border or a very dark background fill with 8px rounding. The border should "bloom" into the Primary Green when focused.
- **Lists:** Clean, borderless list items separated by generous vertical padding (16px). Use Primary Green icons to guide the eye.
- **Cards:** Use Level 1 elevation (Tonal layering). Cards should not have shadows by default, only a subtle 1px border to define the edge against the base background.
- **Progress Indicators:** Use the Primary Green for the track, with the secondary "Mint" for the remaining "empty" space to create a soft, luminous effect.

---
name: Neon Nexus
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#1c253c'
  surface-container-high: '#283048'
  surface-container-highest: '#333b54'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c4c6d0'
  outline: '#8e9099'
  outline-variant: '#44474e'
  primary: '#00f0ff'
  on-primary: '#00363d'
  primary-container: '#004f58'
  on-primary-container: '#97f0ff'
  secondary: '#ff00ff'
  on-secondary: '#560056'
  secondary-container: '#7a007a'
  on-secondary-container: '#ffd7f3'
  tertiary: '#b4ff00'
  on-tertiary: '#2a3600'
  tertiary-container: '#3d4d00'
  on-tertiary-container: '#cfff66'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
typography:
  display-large: 57px/64px SORA, bold
  display-medium: 45px/52px SORA, bold
  display-small: 36px/44px SORA, bold
  headline-large: 32px/40px SORA, bold
  headline-medium: 28px/36px SORA, bold
  headline-small: 24px/32px SORA, bold
  title-large: 22px/28px SORA, medium
  title-medium: 16px/24px SORA, medium
  title-small: 14px/20px SORA, medium
  label-large: 14px/20px SORA, medium
  label-medium: 12px/16px SORA, medium
  label-small: 11px/16px SORA, medium
  body-large: 16px/24px SORA, normal
  body-medium: 14px/20px SORA, normal
  body-small: 12px/16px SORA, normal
spacing:
  section-padding: 80px
  grid-gap: 24px
  element-spacing: 16px
  touch-target: 48px
  container-max: 1280px
roundness:
  none: 0px
  extra-small: 4px
  small: 8px
  medium: 12px
  large: 16px
  extra-large: 28px
  full: 9999px
---