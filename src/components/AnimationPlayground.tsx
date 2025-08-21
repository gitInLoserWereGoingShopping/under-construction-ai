import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import useMousePosition from "../hooks/useMousePosition";

// 🎮 Animation Playground - Interactive Visual Effects Laboratory
interface AnimationPlaygroundProps {
  onBack?: () => void;
  onHeaderCollapseRequest?: (shouldCollapse: boolean) => void; // New prop for header control
}

// 🎨 Playground Types
type PlaygroundType =
  | "shader-effects"
  | "particle-physics"
  | "color-morphing"
  | "geometric-patterns"
  | "fluid-dynamics";

interface PlaygroundConfig {
  id: PlaygroundType;
  title: string;
  icon: string;
  description: string;
  zones: AnimationZone[];
}

// 🎨 Shader-Inspired Filter Types
type FilterType =
  | "none"
  | "fire"
  | "ice"
  | "liquid"
  | "electric"
  | "cosmic"
  | "glitch"
  | "particle-burst"
  | "gravity-well"
  | "color-shift"
  | "prism-split"
  | "kaleidoscope"
  | "fluid-ripple"
  | "vortex-spin";

// 🎯 Animation Zone Configuration
interface AnimationZone {
  id: string;
  title: string;
  icon: string;
  filter: FilterType;
  position: { x: string; y: string };
  color: string;
  description: string;
}

const ANIMATION_ZONES: AnimationZone[] = [
  {
    id: "fire-zone",
    title: "Fire & Heat",
    icon: "🔥",
    filter: "fire",
    position: { x: "15%", y: "20%" },
    color: "#ff4500",
    description: "Chromatic heat distortions and ember trails",
  },
  {
    id: "ice-zone",
    title: "Ice & Crystal",
    icon: "❄️",
    filter: "ice",
    position: { x: "75%", y: "25%" },
    color: "#00bfff",
    description: "Refractive distortions and crystalline patterns",
  },
  {
    id: "liquid-zone",
    title: "Liquid Flow",
    icon: "🌊",
    filter: "liquid",
    position: { x: "25%", y: "70%" },
    color: "#20b2aa",
    description: "Ripple effects and fluid color blending",
  },
  {
    id: "electric-zone",
    title: "Electric Energy",
    icon: "⚡",
    filter: "electric",
    position: { x: "70%", y: "65%" },
    color: "#9400d3",
    description: "Digital glitch and neon scanning effects",
  },
  {
    id: "cosmic-zone",
    title: "Cosmic Space",
    icon: "🌌",
    filter: "cosmic",
    position: { x: "50%", y: "45%" },
    color: "#4b0082",
    description: "Starfield overlays and gravitational lensing",
  },
];

// 🎯 Playground Configurations
const PLAYGROUND_CONFIGS: PlaygroundConfig[] = [
  {
    id: "shader-effects",
    title: "Shader Effects",
    icon: "🎨",
    description: "Visual filters and shader-like effects",
    zones: ANIMATION_ZONES,
  },
  {
    id: "particle-physics",
    title: "Particle Physics",
    icon: "⚛️",
    description: "Dynamic particle systems and physics",
    zones: [
      {
        id: "gravity-well",
        title: "Gravity Well",
        icon: "🌀",
        filter: "gravity-well",
        position: { x: "20%", y: "30%" },
        color: "#663399",
        description: "Particles spiral into gravitational center",
      },
      {
        id: "particle-burst",
        title: "Particle Burst",
        icon: "💥",
        filter: "particle-burst",
        position: { x: "70%", y: "25%" },
        color: "#ff6b35",
        description: "Explosive particle emission effects",
      },
      {
        id: "magnetic-field",
        title: "Magnetic Field",
        icon: "🧲",
        filter: "electric",
        position: { x: "30%", y: "65%" },
        color: "#00d4aa",
        description: "Particles follow magnetic field lines",
      },
      {
        id: "quantum-foam",
        title: "Quantum Foam",
        icon: "🌌",
        filter: "cosmic",
        position: { x: "65%", y: "60%" },
        color: "#8a2be2",
        description: "Probabilistic particle fluctuations",
      },
    ],
  },
  {
    id: "color-morphing",
    title: "Color Morphing",
    icon: "🌈",
    description: "Dynamic color transformations and gradients",
    zones: [
      {
        id: "prism-split",
        title: "Prism Split",
        icon: "🔺",
        filter: "prism-split",
        position: { x: "25%", y: "25%" },
        color: "#ff1493",
        description: "Light spectrum separation effects",
      },
      {
        id: "color-shift",
        title: "Color Shift",
        icon: "🎭",
        filter: "color-shift",
        position: { x: "60%", y: "35%" },
        color: "#32cd32",
        description: "Hue rotation and saturation morphing",
      },
      {
        id: "kaleidoscope",
        title: "Kaleidoscope",
        icon: "🔮",
        filter: "kaleidoscope",
        position: { x: "45%", y: "65%" },
        color: "#ffd700",
        description: "Symmetrical color pattern mirroring",
      },
    ],
  },
  {
    id: "geometric-patterns",
    title: "Geometric Patterns",
    icon: "📐",
    description: "Mathematical and geometric visualizations",
    zones: [
      {
        id: "fractal-zone",
        title: "Fractal Zoom",
        icon: "🌀",
        filter: "cosmic",
        position: { x: "30%", y: "30%" },
        color: "#ff69b4",
        description: "Self-similar pattern generation",
      },
      {
        id: "tessellation",
        title: "Tessellation",
        icon: "🔷",
        filter: "ice",
        position: { x: "65%", y: "45%" },
        color: "#4169e1",
        description: "Interlocking geometric shapes",
      },
    ],
  },
  {
    id: "fluid-dynamics",
    title: "Fluid Dynamics",
    icon: "💧",
    description: "Liquid simulation and flow effects",
    zones: [
      {
        id: "fluid-ripple",
        title: "Fluid Ripple",
        icon: "🌊",
        filter: "fluid-ripple",
        position: { x: "40%", y: "30%" },
        color: "#1e90ff",
        description: "Surface tension and wave propagation",
      },
      {
        id: "vortex-spin",
        title: "Vortex Spin",
        icon: "🌪️",
        filter: "vortex-spin",
        position: { x: "55%", y: "55%" },
        color: "#20b2aa",
        description: "Rotational fluid motion effects",
      },
    ],
  },
];

// 🎨 Styled Components
const PlaygroundWrapper = styled(motion.div)`
  width: 100%;
  max-width: 1200px; /* Same as NewFeatureComponent's DashboardWrapper */
  margin: 0 auto; /* Center the playground */
  min-height: 100vh; /* Ensure full viewport coverage */
`;

const PlaygroundContainer = styled.div<{ $isTracking: boolean }>`
  position: relative;
  width: 100%;
  height: calc(
    100vh - 80px
  ); /* Account for header bar height + minimal padding */
  max-height: 85vh; /* Prevent overflow on mobile */
  min-height: 400px; /* Reduced min-height for mobile */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
  cursor: crosshair;
  border-radius: 15px;
  border: 2px solid rgba(255, 122, 24, 0.3);
  user-select: ${(props) => (props.$isTracking ? "none" : "auto")};

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    height: calc(100vh - 70px);
    max-height: 85vh;
    min-height: 350px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    height: calc(100vh - 60px);
    max-height: 85vh;
    min-height: 300px;
    border-radius: 10px;
  }

  /* Prevent text selection globally when tracking */
  ${(props) =>
    props.$isTracking &&
    `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `}
`;

const FilterOverlay = styled.div<{ $activeFilter: FilterType }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: all 0.5s ease;

  ${({ $activeFilter }) => {
    switch ($activeFilter) {
      case "fire":
        return `
          background: radial-gradient(circle, rgba(255,69,0,0.1) 0%, transparent 70%);
          filter: hue-rotate(15deg) saturate(1.5) contrast(1.2);
          animation: heat-shimmer 2s infinite ease-in-out;
        `;
      case "ice":
        return `
          background: radial-gradient(circle, rgba(0,191,255,0.1) 0%, transparent 70%);
          filter: hue-rotate(-30deg) saturate(0.7) contrast(1.3) brightness(1.1);
        `;
      case "liquid":
        return `
          background: radial-gradient(circle, rgba(32,178,170,0.1) 0%, transparent 70%);
          filter: blur(0.5px) saturate(1.3);
          animation: liquid-ripple 3s infinite ease-in-out;
        `;
      case "electric":
        return `
          background: linear-gradient(45deg, rgba(148,0,211,0.1) 0%, rgba(75,0,130,0.1) 100%);
          filter: contrast(1.5) saturate(2) hue-rotate(45deg);
          animation: electric-pulse 1s infinite ease-in-out;
        `;
      case "cosmic":
        return `
          background: radial-gradient(circle, rgba(75,0,130,0.2) 0%, rgba(25,25,112,0.1) 100%);
          filter: saturate(1.4) contrast(1.2);
          animation: cosmic-drift 4s infinite ease-in-out;
        `;
      // 🆕 New filter effects for additional playgrounds
      case "gravity-well":
        return `
          background: radial-gradient(circle, rgba(102,51,153,0.15) 0%, transparent 70%);
          filter: contrast(1.3) hue-rotate(45deg);
          animation: gravity-pull 2.5s infinite ease-in-out;
        `;
      case "particle-burst":
        return `
          background: radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 60%);
          filter: saturate(2) brightness(1.2) contrast(1.4);
          animation: burst-flicker 0.8s infinite ease-in-out;
        `;
      case "prism-split":
        return `
          background: linear-gradient(90deg, rgba(255,20,147,0.1) 0%, rgba(0,255,255,0.1) 50%, rgba(255,255,0,0.1) 100%);
          filter: saturate(2) contrast(1.3);
          animation: prism-rainbow 3s infinite ease-in-out;
        `;
      case "color-shift":
        return `
          background: radial-gradient(circle, rgba(50,205,50,0.15) 0%, transparent 70%);
          filter: hue-rotate(0deg) saturate(1.5);
          animation: color-morph 2s infinite ease-in-out;
        `;
      case "kaleidoscope":
        return `
          background: conic-gradient(from 0deg, rgba(255,215,0,0.1) 0%, rgba(255,20,147,0.1) 120deg, rgba(0,191,255,0.1) 240deg, rgba(255,215,0,0.1) 360deg);
          filter: saturate(1.8) contrast(1.2);
          animation: kaleidoscope-spin 4s infinite linear;
        `;
      case "fluid-ripple":
        return `
          background: radial-gradient(ellipse, rgba(30,144,255,0.12) 0%, transparent 70%);
          filter: blur(0.8px) saturate(1.4);
          animation: fluid-wave 2.8s infinite ease-in-out;
        `;
      case "vortex-spin":
        return `
          background: conic-gradient(from 45deg, rgba(32,178,170,0.15) 0%, transparent 50%, rgba(32,178,170,0.15) 100%);
          filter: contrast(1.3) saturate(1.6);
          animation: vortex-rotation 1.5s infinite ease-in-out;
        `;
      default:
        return `filter: none;`;
    }
  }}

  @keyframes heat-shimmer {
    0%,
    100% {
      filter: hue-rotate(10deg) saturate(1.4);
    }
    50% {
      filter: hue-rotate(25deg) saturate(1.6);
    }
  }

  @keyframes liquid-ripple {
    0%,
    100% {
      filter: blur(0.3px);
    }
    50% {
      filter: blur(0.8px);
    }
  }

  @keyframes electric-pulse {
    0%,
    100% {
      filter: contrast(1.3) brightness(1);
    }
    50% {
      filter: contrast(1.7) brightness(1.2);
    }
  }

  @keyframes cosmic-drift {
    0%,
    100% {
      filter: saturate(1.2) hue-rotate(0deg);
    }
    50% {
      filter: saturate(1.6) hue-rotate(10deg);
    }
  }

  // 🆕 New keyframe animations
  @keyframes gravity-pull {
    0%,
    100% {
      filter: contrast(1.2) hue-rotate(40deg);
      transform: scale(1);
    }
    50% {
      filter: contrast(1.5) hue-rotate(50deg);
      transform: scale(1.02);
    }
  }

  @keyframes burst-flicker {
    0%,
    100% {
      filter: saturate(1.8) brightness(1.1);
    }
    25% {
      filter: saturate(2.2) brightness(1.3);
    }
    50% {
      filter: saturate(2) brightness(1.2);
    }
    75% {
      filter: saturate(2.4) brightness(1.4);
    }
  }

  @keyframes prism-rainbow {
    0% {
      filter: hue-rotate(0deg) saturate(2);
    }
    33% {
      filter: hue-rotate(120deg) saturate(2.2);
    }
    66% {
      filter: hue-rotate(240deg) saturate(2);
    }
    100% {
      filter: hue-rotate(360deg) saturate(2);
    }
  }

  @keyframes color-morph {
    0% {
      filter: hue-rotate(0deg) saturate(1.5);
    }
    50% {
      filter: hue-rotate(180deg) saturate(1.8);
    }
    100% {
      filter: hue-rotate(360deg) saturate(1.5);
    }
  }

  @keyframes kaleidoscope-spin {
    0% {
      filter: saturate(1.8) contrast(1.2) hue-rotate(0deg);
    }
    100% {
      filter: saturate(1.8) contrast(1.2) hue-rotate(360deg);
    }
  }

  @keyframes fluid-wave {
    0%,
    100% {
      filter: blur(0.6px) saturate(1.3);
    }
    50% {
      filter: blur(1.2px) saturate(1.6);
    }
  }

  @keyframes vortex-rotation {
    0%,
    100% {
      filter: contrast(1.3) saturate(1.6) hue-rotate(0deg);
    }
    50% {
      filter: contrast(1.5) saturate(1.8) hue-rotate(30deg);
    }
  }
`;

const AnimationZoneElement = styled.div<{
  $position: { x: string; y: string };
  $color: string;
  $isActive: boolean;
}>`
  position: absolute;
  left: ${(props) => props.$position.x};
  top: ${(props) => props.$position.y};
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${(props) => props.$color}40 0%,
    ${(props) => props.$color}20 70%,
    transparent 100%
  );
  border: 2px solid ${(props) => props.$color}80;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${(props) => (props.$isActive ? "scale(1.3)" : "scale(1)")};
  box-shadow: ${(props) =>
    props.$isActive
      ? `0 0 30px ${props.$color}80`
      : `0 0 10px ${props.$color}40`};

  /* Mobile/Tablet Responsive Sizing */
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    font-size: 1.5rem;
    border-width: 1.5px;
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    border-width: 1px;
  }

  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 25px ${(props) => props.$color}80;
  }
`;

const CursorOrb = styled(motion.div)`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff, #ff7a18, #ff4500);
  pointer-events: none; /* Orb doesn't interfere with interactions */
  z-index: 150; /* Higher z-index to ensure it's above zones */
  user-select: none; /* Prevent text selection */

  /* Mobile/Tablet Responsive Sizing */
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const PlaygroundUI = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 200;
  color: white;
`;

// 📋 Collapsible Header Components
const HeaderContainer = styled.div<{ $isCollapsed: boolean }>`
  background: rgba(0, 10, 25, 0.95);
  backdrop-filter: blur(10px);
  padding: ${(props) => (props.$isCollapsed ? "8px 15px" : "15px")};
  border-radius: 10px;
  border: 1px solid rgba(255, 122, 24, 0.3);
  max-width: 300px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;

  &:hover {
    border-color: rgba(255, 122, 24, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 122, 24, 0.15);
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    max-width: 250px;
    padding: ${(props) => (props.$isCollapsed ? "6px 12px" : "12px")};
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    max-width: 200px;
    padding: ${(props) => (props.$isCollapsed ? "5px 10px" : "10px")};
    font-size: 0.8rem;
  }
`;

const HeaderContent = styled(motion.div)<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
`;

const HeaderInfo = styled(motion.div)`
  flex: 1;
`;

const CollapseArrow = styled(motion.div)<{ $isCollapsed: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 122, 24, 0.1);
  border-radius: 50%;
  color: #ff7a18;
  font-size: 14px;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 122, 24, 0.2);
    transform: scale(1.1);
  }

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
`;

const ExpandedContent = styled(motion.div)`
  margin-top: 10px;
`;

// 🎯 Playground Header Bar (positioned above playground)
const PlaygroundHeaderBar = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 10, 25, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 122, 24, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    top: 15px;
    left: 15px;
    right: 15px;
    padding: 10px 15px;
  }

  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 8px 12px;
  }
`;

const PlaygroundHeaderButton = styled.button<{
  $variant?: "primary" | "secondary";
  $shouldPulse?: boolean;
}>`
  padding: 8px 16px;
  background: ${(props) =>
    props.$variant === "primary"
      ? "linear-gradient(135deg, #ff7a18, #ff8e2b)"
      : "rgba(255, 122, 24, 0.1)"};
  color: ${(props) => (props.$variant === "primary" ? "#000" : "#ff7a18")};
  border: ${(props) =>
    props.$variant === "primary"
      ? "none"
      : "1px solid rgba(255, 122, 24, 0.3)"};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  /* Pulsing glow effect */
  ${(props) =>
    props.$shouldPulse &&
    `
    animation: pulse-glow 2s infinite ease-in-out;
    
    /* Dynamic text color that contrasts with pulse */
    color: #000;
    animation: pulse-glow 2s infinite ease-in-out, pulse-text-contrast 2s infinite ease-in-out;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #ff7a18, #ff8e2b, #ffa040, #ff7a18);
      border-radius: 10px;
      z-index: -1;
      animation: pulse-border 2s infinite ease-in-out;
      opacity: 0.8;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      background: radial-gradient(circle, rgba(255, 122, 24, 0.4) 0%, transparent 70%);
      border-radius: 12px;
      z-index: -2;
      animation: pulse-halo 2s infinite ease-in-out;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 122, 24, 0.3);
    background: ${(props) =>
      props.$variant === "primary"
        ? "linear-gradient(135deg, #ff8e2b, #ffa040)"
        : "rgba(255, 122, 24, 0.2)"};

    /* Stop pulsing on hover and restore original text color */
    animation: none;
    color: ${(props) => (props.$variant === "primary" ? "#000" : "#ff7a18")};

    &::before,
    &::after {
      animation: none;
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(255, 122, 24, 0.6);
      background: rgba(255, 122, 24, 0.15);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 122, 24, 0.9);
      background: rgba(255, 122, 24, 0.35);
    }
  }

  @keyframes pulse-text-contrast {
    0%,
    100% {
      color: #000;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }
    50% {
      color: #001122;
      text-shadow: 0 0 12px rgba(255, 255, 255, 1);
    }
  }

  @keyframes pulse-border {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.02);
    }
  }

  @keyframes pulse-halo {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }
`;

const CollapseHeaderIcon = styled(motion.span)<{ $isCollapsed: boolean }>`
  display: inline-block;
  font-size: 14px;
  transform-origin: center;
`;

// 🔄 Playground Rotation Components
const PlaygroundRotationButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 122, 24, 0.15);
  border: 2px solid rgba(255, 122, 24, 0.3);
  border-radius: 12px;
  padding: 8px 16px;
  color: #ff7a18;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;

  &:hover {
    background: rgba(255, 122, 24, 0.25);
    border-color: rgba(255, 122, 24, 0.5);
    transform: translate(-50%, -50%) translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.2);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-width: 120px;
  }
`;

const PlaygroundRotationIcon = styled(motion.div)`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaygroundRotationTitle = styled.div`
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 80px;
  }
`;

const AnimationPlayground: React.FC<AnimationPlaygroundProps> = ({
  onBack,
  onHeaderCollapseRequest,
}) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("none");
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [orbPosition, setOrbPosition] = useState({ x: 300, y: 200 }); // Pixel fallback position
  const [isLoaded, setIsLoaded] = useState(false); // Loading state for entrance animation
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false); // Header collapse state
  const [isParentHeaderCollapsed, setIsParentHeaderCollapsed] = useState(false); // Parent header collapse state
  const [shouldPulseButton, setShouldPulseButton] = useState(false); // Guide pulse state
  const [currentPlaygroundIndex, setCurrentPlaygroundIndex] = useState(0); // Playground rotation state
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current playground configuration
  const currentPlayground = PLAYGROUND_CONFIGS[currentPlaygroundIndex];

  // Rotate to next playground
  const rotatePlayground = () => {
    setCurrentPlaygroundIndex((prev) => (prev + 1) % PLAYGROUND_CONFIGS.length);
    // Reset zone states when switching playgrounds
    setActiveZone(null);
    setCurrentFilter("none");
  };

  // 🖱️ Mouse/Touch position tracking
  const { mousePosition, isTracking, startTracking, stopTracking } =
    useMousePosition({
      throttleMs: 16, // Smooth 60fps
      enableTouch: true,
    });

  // 🎬 Entrance Animation - Load after a brief pause
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);

      // Start pulsing the Hide Header button after entrance animation completes
      const pulseTimer = setTimeout(() => {
        setShouldPulseButton(true);
      }, 1500); // Start pulsing 1.5s after entrance animation

      return () => clearTimeout(pulseTimer);
    }, 800); // 800ms pause before entrance animation

    return () => clearTimeout(timer);
  }, []);

  // 🎯 Convert mouse position to relative playground coordinates
  const getRelativePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();

      // Calculate absolute pixel position relative to container
      const absoluteX = clientX - rect.left;
      const absoluteY = clientY - rect.top;

      // Responsive orb size calculation
      const getOrbRadius = () => {
        const width = window.innerWidth;
        if (width <= 480) return 20; // 40px / 2
        if (width <= 768) return 25; // 50px / 2
        return 30; // 60px / 2 (default)
      };

      // Subtract half orb size to center it on cursor
      const orbRadius = getOrbRadius();
      const centeredX = absoluteX - orbRadius;
      const centeredY = absoluteY - orbRadius;

      // Clamp to keep orb fully within playground bounds
      const margin = 10; // Extra margin from edges
      const orbSize = orbRadius * 2;

      return {
        x: Math.max(margin, Math.min(rect.width - orbSize - margin, centeredX)),
        y: Math.max(
          margin,
          Math.min(rect.height - orbSize - margin, centeredY)
        ),
      };
    },
    []
  ); // 🎨 Update orb position and check zone interactions
  useEffect(() => {
    if (!isTracking) return;

    const relativePos = getRelativePosition(mousePosition.x, mousePosition.y);
    if (relativePos) {
      setOrbPosition(relativePos);

      // Zone detection using mouse position
      const elements = document.elementsFromPoint(
        mousePosition.x,
        mousePosition.y
      );
      const zoneElement = elements.find((el) =>
        el.getAttribute("data-zone-id")
      );

      if (zoneElement) {
        const zoneId = zoneElement.getAttribute("data-zone-id");
        const zone = currentPlayground.zones.find((z) => z.id === zoneId);
        if (zone && activeZone !== zone.id) {
          setActiveZone(zone.id);
          setCurrentFilter(zone.filter);
        }
      } else if (activeZone) {
        setActiveZone(null);
        setCurrentFilter("none");
      }
    }
  }, [mousePosition, isTracking, getRelativePosition, activeZone]);

  // 🎯 Handle playground interactions
  const handlePlaygroundMouseDown = useCallback(() => {
    startTracking();
  }, [startTracking]);

  const handlePlaygroundMouseUp = useCallback(() => {
    stopTracking();
  }, [stopTracking]);

  const handlePlaygroundTouchStart = useCallback(() => {
    startTracking();
  }, [startTracking]);

  const handlePlaygroundTouchEnd = useCallback(() => {
    stopTracking();
  }, [stopTracking]);

  // 🎯 Header collapse toggle handler
  const toggleHeaderCollapse = useCallback(() => {
    setIsHeaderCollapsed((prev) => !prev);
  }, []);

  // 🏗️ Parent header collapse handler
  const toggleParentHeader = useCallback(() => {
    if (onHeaderCollapseRequest) {
      const newCollapseState = !isParentHeaderCollapsed;
      setIsParentHeaderCollapsed(newCollapseState);
      onHeaderCollapseRequest(newCollapseState);

      // Stop pulsing once the user interacts with the button
      setShouldPulseButton(false);
    }
  }, [onHeaderCollapseRequest, isParentHeaderCollapsed]);

  const currentZone = currentPlayground.zones.find((z) => z.id === activeZone);

  return (
    <AnimatePresence>
      {isLoaded && (
        <PlaygroundWrapper
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* 🎯 Playground Header Bar - Fixed positioning */}
          <PlaygroundHeaderBar>
            <PlaygroundHeaderButton onClick={onBack}>
              ← Back
            </PlaygroundHeaderButton>

            {/* 🔄 Playground Rotation Button */}
            <PlaygroundRotationButton
              onClick={rotatePlayground}
              title={`Switch to ${
                PLAYGROUND_CONFIGS[
                  (currentPlaygroundIndex + 1) % PLAYGROUND_CONFIGS.length
                ].title
              }`}
            >
              <PlaygroundRotationIcon
                animate={{ rotate: currentPlaygroundIndex * 72 }} // 360/5 playgrounds = 72 degrees per rotation
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {currentPlayground.icon}
              </PlaygroundRotationIcon>
              <PlaygroundRotationTitle>
                {currentPlayground.title}
              </PlaygroundRotationTitle>
            </PlaygroundRotationButton>

            <PlaygroundHeaderButton
              $variant="secondary"
              $shouldPulse={shouldPulseButton && !isParentHeaderCollapsed}
              onClick={toggleParentHeader}
            >
              {isParentHeaderCollapsed ? "Show" : "Hide"} Info
              <CollapseHeaderIcon
                $isCollapsed={isParentHeaderCollapsed}
                animate={{ rotate: isParentHeaderCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                ▲
              </CollapseHeaderIcon>
            </PlaygroundHeaderButton>
          </PlaygroundHeaderBar>

          <PlaygroundContainer
            ref={containerRef}
            className="playground-container"
            $isTracking={isTracking}
            onMouseDown={handlePlaygroundMouseDown}
            onMouseUp={handlePlaygroundMouseUp}
            onTouchStart={handlePlaygroundTouchStart}
            onTouchEnd={handlePlaygroundTouchEnd}
          >
            {/* 🌈 Dynamic Filter Overlay */}
            <FilterOverlay $activeFilter={currentFilter} />

            {/* 🎮 UI Controls */}
            <PlaygroundUI>
              <HeaderContainer
                $isCollapsed={isHeaderCollapsed}
                onClick={toggleHeaderCollapse}
                style={{
                  opacity: isTracking ? 0.3 : 1,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <HeaderContent $isCollapsed={isHeaderCollapsed}>
                  <HeaderInfo>
                    <h3
                      style={{
                        margin: "0",
                        color: "#ff7a18",
                        fontSize: isHeaderCollapsed ? "0.9rem" : "1rem",
                      }}
                    >
                      🎨 Animation Playground
                    </h3>
                    <AnimatePresence>
                      {!isHeaderCollapsed && (
                        <ExpandedContent
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <p style={{ margin: "10px 0", fontSize: "0.9rem" }}>
                            Drag the orb over zones to activate shader-like
                            visual filters!
                          </p>
                          {currentZone ? (
                            <div>
                              <strong>
                                {currentZone.icon} {currentZone.title}
                              </strong>
                              <p
                                style={{
                                  margin: "5px 0 0 0",
                                  fontSize: "0.8rem",
                                  opacity: 0.8,
                                }}
                              >
                                {currentZone.description}
                              </p>
                            </div>
                          ) : (
                            <p
                              style={{
                                margin: "5px 0 0 0",
                                fontSize: "0.8rem",
                                opacity: 0.6,
                              }}
                            >
                              Move the orb to discover effects...
                            </p>
                          )}
                        </ExpandedContent>
                      )}
                    </AnimatePresence>
                  </HeaderInfo>
                  <CollapseArrow $isCollapsed={isHeaderCollapsed}>
                    <motion.span
                      animate={{ rotate: isHeaderCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      ▼
                    </motion.span>
                  </CollapseArrow>
                </HeaderContent>
              </HeaderContainer>
            </PlaygroundUI>

            {/* 🎯 Animation Zones */}
            {currentPlayground.zones.map((zone) => (
              <AnimationZoneElement
                key={zone.id}
                data-zone-id={zone.id}
                $position={zone.position}
                $color={zone.color}
                $isActive={activeZone === zone.id}
                title={`${zone.title}: ${zone.description}`}
              >
                {zone.icon}
              </AnimationZoneElement>
            ))}

            {/* 🪄 Cursor-Following Orb */}
            <CursorOrb
              style={{
                left: `${orbPosition.x}px`,
                top: `${orbPosition.y}px`,
                // transform: "translate(-50%, -50%)", // Temporarily removed to debug
                opacity: isTracking ? 1 : 0.7, // Visual feedback when active
              }}
              animate={{
                scale: isTracking ? 1.2 : 1,
                boxShadow: isTracking
                  ? "0 0 30px rgba(255, 122, 24, 0.8)"
                  : "0 0 20px rgba(255, 122, 24, 0.6)",
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            />
          </PlaygroundContainer>
        </PlaygroundWrapper>
      )}
    </AnimatePresence>
  );
};

export default AnimationPlayground;
