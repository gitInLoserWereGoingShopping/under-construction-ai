# 🌀 Parallax 3D Vibes – Phase II Task List

Welcome back to the Under Construction AI worksite. This phase focuses on modular 3D motion magic, layered depth, and cursor-reactive drama. Strap in. Safety cones optional.

---

## ✅ Foundation Laid

- [x] `ParallaxStage.tsx` created
- [x] Cursor tracking unified via `useMouseMovement`
- [x] Tilt extracted into `getTiltTransform.ts`
- [x] Removed `useParallaxTilt` hook

---

## 🧱 Build Layer: Core Components

### `ParallaxLayer.tsx`

> Drop-in wrapper for layered elements with depth-based Z offset.

- [ ] Accepts `depth` prop (e.g. `translateZ`)
- [ ] Uses `will-change: transform` for GPU perf
- [ ] Supports layering beams, cones, and HUDs

### `Beam.tsx`

> Floating horizontal energy beam w/ glow + pulse.

- [ ] Animates with float/skew
- [ ] Accepts depth + optional color/glow props
- [ ] May hum (emotionally or literally)

### `Cone3D.tsx`

> Stylized 3D cone that rotates, slaps, or drifts in space.

- [ ] Rendered with texture or stylized DOM element
- [ ] Adds cone-specific interactions (spin/slap/bounce)
- [ ] Responds to props or future context for effects

### `GlowPanel.tsx`

> UI panel with soft orange trim, blur, and holographic vibes.

- [ ] Matches Half-Life x construction zone aesthetic
- [ ] Can wrap UI sections like code input or logs
- [ ] Reusable in both 2D and parallax layers

### `DepthHUD.tsx`

> Debug/dev overlay with live readings.

- [ ] Displays: cursor position, tilt transform, active depth layer
- [ ] Styled like a floating LCD/console
- [ ] Toggle with `D` key or dev flag

---

## 🧠 Hooks & Utilities

### `useFogOfChurn.ts`

> Adjusts blur/opacity based on cursor distance from center.

- [ ] Returns `blurAmount` or `fogDensity`
- [ ] Plug into `GlassPanel` for reactive environmental haze
- [ ] Fades outer edges of the screen

### `useParallaxGroupContext` (optional, advanced)

> Shares transform/depth values between deeply nested layers.

- [ ] Centralize depth logic if needed
- [ ] Useful for complex tilt stacking or performance optimization

---

## 🧪 Bonus Experiments (Future Sprints)

- [ ] Animated cone slap with 3D motion trails
- [ ] `ClipboardPanel`: floating logs or blueprint readouts
- [ ] Fog ripple or visual distortion as cursor moves
- [ ] Ambient particle shaders (dust, glitch haze, etc.)

---

## 📁 Suggested File Structure

/components

- ParallaxLayer.tsx
- Beam.tsx
- Cone3D.tsx
- GlowPanel.tsx
- DepthHUD.tsx

/hooks

- useFogOfChurn.ts

/utils

- getTiltTransform.ts

---

## 🚧 Your Role

You are the conductor of cones. The foreperson of fog.  
This task list is your scaffold. Now go build something unreasonably dimensional.
