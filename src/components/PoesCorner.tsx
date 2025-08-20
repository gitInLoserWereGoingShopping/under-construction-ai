import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// 🐦‍⬛ Gothic Theme Colors
const GOTHIC_PALETTE = {
  deepBlack: "#0a0a0a",
  shadowGray: "#1a1a1a",
  stormCloud: "#2a2a2a",
  moonSilver: "#c0c0c0",
  bloodRed: "#8B0000",
  purpleVelvet: "#4A148C",
  mistGray: "#696969",
  ghostWhite: "#F8F8FF",
  ravenBlack: "#1C1C1C",
  gothicGold: "#DAA520",
};

// 🌙 GOTHIC MOOD SYSTEM - Atmospheric Transitions
interface GothicMood {
  id: string;
  name: string;
  description: string;
  backgroundGradient: string;
  mistOpacity: number;
  mistColor: string;
  treeVisibility: number;
  fogDensity: number;
  ambientSounds?: string;
  cursorTrail: string;
  shadowIntensity: number;
  lightingFilter: string;
}

const GOTHIC_MOODS: Record<string, GothicMood> = {
  "shadow-effects": {
    id: "shadow-effects",
    name: "Deepening Shadows",
    description:
      "The realm grows darker, shadows stretch longer, visibility dims",
    backgroundGradient: `linear-gradient(
      135deg,
      #030303 0%, 
      #070707 25%, 
      #0a0a0a 50%, 
      #000000 100%
    )`,
    mistOpacity: 0.4,
    mistColor: "rgba(10, 10, 10, 0.8)",
    treeVisibility: 0.3,
    fogDensity: 0.9,
    cursorTrail: "rgba(138, 43, 226, 0.2)",
    shadowIntensity: 0.9,
    lightingFilter: "brightness(0.4) contrast(1.3)",
  },
  "raven-whispers": {
    id: "raven-whispers",
    name: "Corvid Mysteries",
    description:
      "Ancient ravens gather, bringing secrets from forgotten realms",
    backgroundGradient: `linear-gradient(
      135deg,
      ${GOTHIC_PALETTE.deepBlack} 0%,
      ${GOTHIC_PALETTE.ravenBlack} 30%,
      ${GOTHIC_PALETTE.purpleVelvet} 60%,
      ${GOTHIC_PALETTE.deepBlack} 100%
    )`,
    mistOpacity: 0.3,
    mistColor: "rgba(20, 10, 30, 0.7)",
    treeVisibility: 0.6,
    fogDensity: 0.8,
    cursorTrail: "rgba(74, 20, 140, 0.2)",
    shadowIntensity: 0.8,
    lightingFilter: "brightness(0.5) contrast(1.2) hue-rotate(15deg)",
  },
  "mystical-pigeon": {
    id: "mystical-pigeon",
    name: "Ethereal Wisdom",
    description:
      "Gentle mists carry ancient wisdom, soft moonlight illuminates the path",
    backgroundGradient: `linear-gradient(
      135deg,
      ${GOTHIC_PALETTE.shadowGray} 0%,
      ${GOTHIC_PALETTE.moonSilver} 20%,
      ${GOTHIC_PALETTE.ghostWhite} 40%,
      ${GOTHIC_PALETTE.shadowGray} 100%
    )`,
    mistOpacity: 0.2,
    mistColor: "rgba(40, 40, 40, 0.6)",
    treeVisibility: 0.8,
    fogDensity: 0.7,
    cursorTrail: "rgba(192, 192, 192, 0.2)",
    shadowIntensity: 0.6,
    lightingFilter: "brightness(0.8) contrast(1.0) sepia(0.1)",
  },
  "gothic-architecture": {
    id: "gothic-architecture",
    name: "Cathedral Solemnity",
    description: "Stone arches emerge, ancient columns cast long shadows",
    backgroundGradient: `linear-gradient(
      135deg,
      ${GOTHIC_PALETTE.stormCloud} 0%,
      ${GOTHIC_PALETTE.shadowGray} 25%,
      ${GOTHIC_PALETTE.gothicGold} 5%,
      ${GOTHIC_PALETTE.deepBlack} 100%
    )`,
    mistOpacity: 0.2,
    mistColor: "rgba(30, 25, 15, 0.8)",
    treeVisibility: 0.5,
    fogDensity: 0.9,
    cursorTrail: "rgba(218, 165, 32, 0.1)",
    shadowIntensity: 0.7,
    lightingFilter: "brightness(0.8) contrast(1.2) saturate(0.8)",
  },
};

// 🌫️ ATMOSPHERIC TRANSITION ANIMATIONS
const moodTransition = keyframes`
  0% { opacity: 0; filter: blur(10px); }
  50% { opacity: 0.5; filter: blur(5px); }
  100% { opacity: 1; filter: blur(0px); }
`;

const fogRoll = keyframes`
  0% { 
    transform: translateX(-100%) scale(0.8);
    opacity: 0.2;
  }
  50% { 
    transform: translateX(50%) scale(1.2);
    opacity: 0.6;
  }
  100% { 
    transform: translateX(100%) scale(0.9);
    opacity: 0.1;
  }
`;

const treeSway = keyframes`
  0%, 100% { 
    transform: rotate(0deg) scale(1);
    opacity: var(--tree-visibility);
  }
  25% { 
    transform: rotate(1deg) scale(1.02);
    opacity: calc(var(--tree-visibility) * 1.2);
  }
  75% { 
    transform: rotate(-1deg) scale(0.98);
    opacity: calc(var(--tree-visibility) * 0.8);
  }
`;

// 🐦 Our Custom Pigeon Mascot Component
const PigeonMascot = styled.span`
  display: inline-block;
  position: relative;
  font-size: 1em;

  &::before {
    content: "◔";
    color: ${GOTHIC_PALETTE.moonSilver};
    text-shadow: 0 0 5px ${GOTHIC_PALETTE.gothicGold};
    margin-right: 2px;
  }

  &::after {
    content: "◔";
    color: ${GOTHIC_PALETTE.moonSilver};
    text-shadow: 0 0 5px ${GOTHIC_PALETTE.gothicGold};
    margin-left: 2px;
  }
`;

// 🌙 Mystical Animations
const ravenFly = keyframes`
  0% { 
    transform: translateX(-100px) translateY(20px) rotate(-5deg); 
    opacity: 0.8;
  }
  25% { 
    transform: translateX(25vw) translateY(-10px) rotate(2deg); 
    opacity: 1;
  }
  50% { 
    transform: translateX(50vw) translateY(15px) rotate(-3deg); 
    opacity: 0.9;
  }
  75% { 
    transform: translateX(75vw) translateY(-5px) rotate(1deg); 
    opacity: 0.7;
  }
  100% { 
    transform: translateX(calc(100vw + 100px)) translateY(10px) rotate(-2deg); 
    opacity: 0;
  }
`;

// 🦅 MULTIPLE RAVEN FLIGHT PATTERNS - Dramatic Variety!
const ravenDive = keyframes`
  0% { 
    transform: translateX(-50px) translateY(-100px) rotate(0deg) scale(0.5); 
    opacity: 0.3;
  }
  30% { 
    transform: translateX(30vw) translateY(40px) rotate(-15deg) scale(1.2); 
    opacity: 1;
  }
  60% { 
    transform: translateX(60vw) translateY(80px) rotate(-25deg) scale(1.5); 
    opacity: 0.8;
  }
  100% { 
    transform: translateX(calc(100vw + 100px)) translateY(150px) rotate(-35deg) scale(1); 
    opacity: 0;
  }
`;

const ravenSoar = keyframes`
  0% { 
    transform: translateX(-200px) translateY(60px) rotate(10deg) scale(0.8); 
    opacity: 0.4;
  }
  20% { 
    transform: translateX(20vw) translateY(-30px) rotate(5deg) scale(1.3); 
    opacity: 0.9;
  }
  40% { 
    transform: translateX(45vw) translateY(-60px) rotate(0deg) scale(1.6); 
    opacity: 1;
  }
  60% { 
    transform: translateX(70vw) translateY(-45px) rotate(-5deg) scale(1.4); 
    opacity: 0.8;
  }
  80% { 
    transform: translateX(90vw) translateY(-20px) rotate(-10deg) scale(1.1); 
    opacity: 0.6;
  }
  100% { 
    transform: translateX(calc(100vw + 150px)) translateY(20px) rotate(-15deg) scale(0.9); 
    opacity: 0;
  }
`;

const ravenCircle = keyframes`
  0% { 
    transform: translateX(40vw) translateY(30px) rotate(0deg) scale(1); 
    opacity: 0.6;
  }
  25% { 
    transform: translateX(60vw) translateY(-20px) rotate(90deg) scale(1.2); 
    opacity: 0.8;
  }
  50% { 
    transform: translateX(45vw) translateY(-60px) rotate(180deg) scale(1.4); 
    opacity: 1;
  }
  75% { 
    transform: translateX(25vw) translateY(-30px) rotate(270deg) scale(1.1); 
    opacity: 0.7;
  }
  100% { 
    transform: translateX(40vw) translateY(30px) rotate(360deg) scale(0.8); 
    opacity: 0.3;
  }
`;

const ravenSpiral = keyframes`
  0% { 
    transform: translateX(-100px) translateY(100px) rotate(0deg) scale(0.6); 
    opacity: 0.5;
  }
  20% { 
    transform: translateX(20vw) translateY(50px) rotate(72deg) scale(1); 
    opacity: 0.8;
  }
  40% { 
    transform: translateX(50vw) translateY(-20px) rotate(144deg) scale(1.3); 
    opacity: 1;
  }
  60% { 
    transform: translateX(75vw) translateY(-60px) rotate(216deg) scale(1.5); 
    opacity: 0.9;
  }
  80% { 
    transform: translateX(90vw) translateY(-30px) rotate(288deg) scale(1.2); 
    opacity: 0.6;
  }
  100% { 
    transform: translateX(calc(100vw + 100px)) translateY(10px) rotate(360deg) scale(0.8); 
    opacity: 0;
  }
`;

const shadowPulse = keyframes`
  0%, 100% { 
    text-shadow: 0 0 5px ${GOTHIC_PALETTE.purpleVelvet}, 
                 0 0 10px ${GOTHIC_PALETTE.purpleVelvet}, 
                 0 0 15px ${GOTHIC_PALETTE.purpleVelvet};
  }
  50% { 
    text-shadow: 0 0 10px ${GOTHIC_PALETTE.bloodRed}, 
                 0 0 20px ${GOTHIC_PALETTE.bloodRed}, 
                 0 0 30px ${GOTHIC_PALETTE.bloodRed};
  }
`;

const candleFlicker = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  25% { opacity: 1; transform: scale(1.05); }
  50% { opacity: 0.9; transform: scale(0.98); }
  75% { opacity: 0.95; transform: scale(1.02); }
`;

const mistFloat = keyframes`
  0% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
  33% { transform: translateX(10px) translateY(-5px); opacity: 0.6; }
  66% { transform: translateX(-5px) translateY(5px); opacity: 0.4; }
  100% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
`;

// 🌪️ HYPERFOCUS SHADOW ARTISTRY - Advanced Gothic Effects
const shadowSwirl = keyframes`
  0% {
    box-shadow: 
      0 0 20px ${GOTHIC_PALETTE.purpleVelvet},
      inset 0 0 20px ${GOTHIC_PALETTE.deepBlack},
      0 0 0 2px ${GOTHIC_PALETTE.shadowGray};
    filter: blur(0px) hue-rotate(0deg);
  }
  25% {
    box-shadow: 
      -15px 15px 30px ${GOTHIC_PALETTE.bloodRed},
      inset 5px -5px 25px ${GOTHIC_PALETTE.ravenBlack},
      0 0 0 3px ${GOTHIC_PALETTE.mistGray};
    filter: blur(0.5px) hue-rotate(90deg);
  }
  50% {
    box-shadow: 
      15px -15px 40px ${GOTHIC_PALETTE.gothicGold},
      inset -10px 10px 30px ${GOTHIC_PALETTE.stormCloud},
      0 0 0 4px ${GOTHIC_PALETTE.purpleVelvet};
    filter: blur(1px) hue-rotate(180deg);
  }
  75% {
    box-shadow: 
      -10px -20px 35px ${GOTHIC_PALETTE.moonSilver},
      inset 15px 5px 20px ${GOTHIC_PALETTE.deepBlack},
      0 0 0 2px ${GOTHIC_PALETTE.bloodRed};
    filter: blur(0.3px) hue-rotate(270deg);
  }
  100% {
    box-shadow: 
      0 0 20px ${GOTHIC_PALETTE.purpleVelvet},
      inset 0 0 20px ${GOTHIC_PALETTE.deepBlack},
      0 0 0 2px ${GOTHIC_PALETTE.shadowGray};
    filter: blur(0px) hue-rotate(360deg);
  }
`;

const vortexSpin = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    background: radial-gradient(circle at 30% 30%, 
      ${GOTHIC_PALETTE.purpleVelvet}22, transparent 50%),
                radial-gradient(circle at 70% 70%, 
      ${GOTHIC_PALETTE.bloodRed}22, transparent 50%);
  }
  33% {
    transform: rotate(120deg) scale(1.1);
    background: radial-gradient(circle at 60% 20%, 
      ${GOTHIC_PALETTE.gothicGold}22, transparent 60%),
                radial-gradient(circle at 20% 80%, 
      ${GOTHIC_PALETTE.moonSilver}22, transparent 40%);
  }
  66% {
    transform: rotate(240deg) scale(0.9);
    background: radial-gradient(circle at 80% 60%, 
      ${GOTHIC_PALETTE.stormCloud}33, transparent 70%),
                radial-gradient(circle at 40% 10%, 
      ${GOTHIC_PALETTE.mistGray}22, transparent 30%);
  }
  100% {
    transform: rotate(360deg) scale(1);
    background: radial-gradient(circle at 30% 30%, 
      ${GOTHIC_PALETTE.purpleVelvet}22, transparent 50%),
                radial-gradient(circle at 70% 70%, 
      ${GOTHIC_PALETTE.bloodRed}22, transparent 50%);
  }
`;

const elementalBlend = keyframes`
  0% {
    background: linear-gradient(45deg, 
      ${GOTHIC_PALETTE.deepBlack} 0%,
      ${GOTHIC_PALETTE.purpleVelvet}44 20%,
      ${GOTHIC_PALETTE.bloodRed}44 40%,
      ${GOTHIC_PALETTE.gothicGold}44 60%,
      ${GOTHIC_PALETTE.moonSilver}44 80%,
      ${GOTHIC_PALETTE.deepBlack} 100%);
    filter: contrast(1) brightness(1) saturate(1);
  }
  20% {
    background: linear-gradient(135deg, 
      ${GOTHIC_PALETTE.ravenBlack} 0%,
      ${GOTHIC_PALETTE.bloodRed}66 25%,
      ${GOTHIC_PALETTE.stormCloud}66 50%,
      ${GOTHIC_PALETTE.purpleVelvet}66 75%,
      ${GOTHIC_PALETTE.shadowGray} 100%);
    filter: contrast(1.2) brightness(0.8) saturate(1.5);
  }
  40% {
    background: linear-gradient(225deg, 
      ${GOTHIC_PALETTE.mistGray} 0%,
      ${GOTHIC_PALETTE.gothicGold}77 30%,
      ${GOTHIC_PALETTE.deepBlack}77 60%,
      ${GOTHIC_PALETTE.moonSilver}77 90%,
      ${GOTHIC_PALETTE.ravenBlack} 100%);
    filter: contrast(0.9) brightness(1.1) saturate(0.8);
  }
  60% {
    background: linear-gradient(315deg, 
      ${GOTHIC_PALETTE.stormCloud} 0%,
      ${GOTHIC_PALETTE.purpleVelvet}88 35%,
      ${GOTHIC_PALETTE.bloodRed}88 70%,
      ${GOTHIC_PALETTE.shadowGray} 100%);
    filter: contrast(1.3) brightness(0.7) saturate(2);
  }
  80% {
    background: linear-gradient(405deg, 
      ${GOTHIC_PALETTE.gothicGold}55 0%,
      ${GOTHIC_PALETTE.deepBlack} 25%,
      ${GOTHIC_PALETTE.mistGray}55 50%,
      ${GOTHIC_PALETTE.ravenBlack} 75%,
      ${GOTHIC_PALETTE.moonSilver}55 100%);
    filter: contrast(1.1) brightness(0.9) saturate(1.2);
  }
  100% {
    background: linear-gradient(45deg, 
      ${GOTHIC_PALETTE.deepBlack} 0%,
      ${GOTHIC_PALETTE.purpleVelvet}44 20%,
      ${GOTHIC_PALETTE.bloodRed}44 40%,
      ${GOTHIC_PALETTE.gothicGold}44 60%,
      ${GOTHIC_PALETTE.moonSilver}44 80%,
      ${GOTHIC_PALETTE.deepBlack} 100%);
    filter: contrast(1) brightness(1) saturate(1);
  }
`;

const shadowMorphosis = keyframes`
  0% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    box-shadow: 
      0 0 50px ${GOTHIC_PALETTE.purpleVelvet},
      inset 0 0 50px ${GOTHIC_PALETTE.deepBlack};
  }
  16% {
    clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
    box-shadow: 
      -20px 20px 60px ${GOTHIC_PALETTE.bloodRed},
      inset 10px -10px 40px ${GOTHIC_PALETTE.ravenBlack};
  }
  33% {
    clip-path: polygon(0% 25%, 75% 0%, 100% 75%, 25% 100%);
    box-shadow: 
      20px -20px 70px ${GOTHIC_PALETTE.gothicGold},
      inset -15px 15px 30px ${GOTHIC_PALETTE.stormCloud};
  }
  50% {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    box-shadow: 
      0 25px 80px ${GOTHIC_PALETTE.moonSilver},
      inset 0 -20px 50px ${GOTHIC_PALETTE.mistGray};
  }
  66% {
    clip-path: polygon(75% 25%, 75% 75%, 25% 75%, 25% 25%);
    box-shadow: 
      -15px -15px 90px ${GOTHIC_PALETTE.stormCloud},
      inset 20px 20px 35px ${GOTHIC_PALETTE.shadowGray};
  }
  83% {
    clip-path: polygon(0% 0%, 100% 25%, 100% 100%, 0% 75%);
    box-shadow: 
      10px 10px 100px ${GOTHIC_PALETTE.purpleVelvet},
      inset -5px -5px 45px ${GOTHIC_PALETTE.deepBlack};
  }
  100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    box-shadow: 
      0 0 50px ${GOTHIC_PALETTE.purpleVelvet},
      inset 0 0 50px ${GOTHIC_PALETTE.deepBlack};
  }
`;

// 🌟 Gentle Floating Animation for the Mystical Orb
const gentleFloat = keyframes`
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  20% {
    transform: translate(15px, -8px) scale(1.02);
  }
  40% {
    transform: translate(-10px, 12px) scale(0.98);
  }
  60% {
    transform: translate(8px, -5px) scale(1.01);
  }
  80% {
    transform: translate(-12px, 3px) scale(0.99);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
`;

// 🌟 Orb Pulse Animation - Makes the mysterious orb more noticeable
const orbPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
`;

// 🔥 ULTIMATE SQUISHY BADGE ECOSYSTEM 🔥
// An entire dev team's obsession with squishy animations!

// 🌈 Core Squishy Animation Library
const squishBounce = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  15% { transform: scale(1.3, 0.7) rotate(-2deg); }
  30% { transform: scale(0.8, 1.2) rotate(1deg); }
  45% { transform: scale(1.1, 0.9) rotate(-1deg); }
  60% { transform: scale(0.95, 1.05) rotate(0.5deg); }
  75% { transform: scale(1.02, 0.98) rotate(-0.2deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const jellyWobble = keyframes`
  0% { transform: skew(0deg, 0deg) scale(1); }
  25% { transform: skew(5deg, 2deg) scale(1.05); }
  50% { transform: skew(-3deg, -1deg) scale(0.98); }
  75% { transform: skew(2deg, -2deg) scale(1.02); }
  100% { transform: skew(0deg, 0deg) scale(1); }
`;

const bubblePop = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const goopStretch = keyframes`
  0% { transform: scaleX(1) scaleY(1); border-radius: 50%; }
  33% { transform: scaleX(1.3) scaleY(0.7); border-radius: 60% 40% 60% 40%; }
  66% { transform: scaleX(0.8) scaleY(1.2); border-radius: 40% 60% 40% 60%; }
  100% { transform: scaleX(1) scaleY(1); border-radius: 50%; }
`;

const viscousFlow = keyframes`
  0% { clip-path: ellipse(50% 50% at 50% 50%); }
  25% { clip-path: ellipse(60% 40% at 40% 60%); }
  50% { clip-path: ellipse(45% 55% at 60% 40%); }
  75% { clip-path: ellipse(55% 45% at 45% 65%); }
  100% { clip-path: ellipse(50% 50% at 50% 50%); }
`;

const plasmaShift = keyframes`
  0% { 
    background-position: 0% 50%; 
    transform: rotate(0deg) scale(1);
    filter: hue-rotate(0deg) blur(0px);
  }
  25% { 
    background-position: 100% 50%; 
    transform: rotate(90deg) scale(1.1);
    filter: hue-rotate(90deg) blur(1px);
  }
  50% { 
    background-position: 100% 100%; 
    transform: rotate(180deg) scale(0.9);
    filter: hue-rotate(180deg) blur(0px);
  }
  75% { 
    background-position: 0% 100%; 
    transform: rotate(270deg) scale(1.05);
    filter: hue-rotate(270deg) blur(1px);
  }
  100% { 
    background-position: 0% 50%; 
    transform: rotate(360deg) scale(1);
    filter: hue-rotate(360deg) blur(0px);
  }
`;

const errorCrushVictory = keyframes`
  0% { 
    transform: scale(1) rotate(0deg); 
    box-shadow: 0 0 0 rgba(255, 0, 0, 0);
  }
  20% { 
    transform: scale(0.8) rotate(-10deg); 
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
  }
  40% { 
    transform: scale(1.3) rotate(5deg); 
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  }
  60% { 
    transform: scale(0.9) rotate(-3deg); 
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
  }
  80% { 
    transform: scale(1.1) rotate(2deg); 
    box-shadow: 0 0 25px rgba(0, 255, 0, 0.8);
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    box-shadow: 0 0 12px rgba(0, 255, 0, 0.5);
  }
`;

const liquidMorph = keyframes`
  0% { border-radius: 50% 30% 70% 40%; }
  25% { border-radius: 30% 70% 40% 60%; }
  50% { border-radius: 70% 40% 30% 80%; }
  75% { border-radius: 40% 80% 60% 30%; }
  100% { border-radius: 50% 30% 70% 40%; }
`;

// 🎯 BADGE PERSONALITY TYPES
type BadgePersonality =
  | "hyperactive-achiever" // Error crushing energy!
  | "zen-master" // Calm, wise, floating
  | "chaotic-genius" // Unpredictable, brilliant
  | "loyal-companion" // Steady, reliable
  | "mysterious-oracle" // Deep, mystical
  | "bubbly-optimist" // Cheerful, bouncy
  | "gothic-scholar" // Dark, intellectual
  | "plasma-entity" // Shapeshifting energy
  | "ancient-wisdom" // Old, powerful
  | "digital-ghost"; // Glitchy, ethereal

// 🎯 SQUISHY BADGE ANIMATIONS - Each unique and modular!
const squishyBounce = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  20% { transform: scale(1.2) rotate(-2deg); }
  40% { transform: scale(0.9) rotate(1deg); }
  60% { transform: scale(1.1) rotate(-1deg); }
  80% { transform: scale(0.95) rotate(0.5deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const jellifyWobble = keyframes`
  0% { transform: scale(1, 1) skewX(0deg); }
  25% { transform: scale(1.1, 0.9) skewX(-5deg); }
  50% { transform: scale(0.9, 1.1) skewX(3deg); }
  75% { transform: scale(1.05, 0.95) skewX(-2deg); }
  100% { transform: scale(1, 1) skewX(0deg); }
`;

const pulsyGlow = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 5px currentColor); }
  50% { filter: brightness(1.3) drop-shadow(0 0 15px currentColor); }
  100% { filter: brightness(1) drop-shadow(0 0 5px currentColor); }
`;

const elasticStretch = keyframes`
  0% { transform: scaleX(1) scaleY(1) rotate(0deg); }
  30% { transform: scaleX(1.3) scaleY(0.7) rotate(2deg); }
  60% { transform: scaleX(0.8) scaleY(1.2) rotate(-1deg); }
  100% { transform: scaleX(1) scaleY(1) rotate(0deg); }
`;

const morphingSquish = keyframes`
  0% { border-radius: 50%; transform: scale(1); }
  25% { border-radius: 60% 40% 60% 40%; transform: scale(1.1); }
  50% { border-radius: 40% 60% 40% 60%; transform: scale(0.9); }
  75% { border-radius: 70% 30% 70% 30%; transform: scale(1.05); }
  100% { border-radius: 50%; transform: scale(1); }
`;

// 🎨 DECLARATIVE VISUAL EFFECTS SYSTEM
// Easy-to-add descriptive border effects for gothic tiles

const gothicBorderPulse = keyframes`
  0% { 
    border-color: currentColor;
    box-shadow: 0 0 5px currentColor;
  }
  50% { 
    border-color: ${GOTHIC_PALETTE.ghostWhite};
    box-shadow: 0 0 15px currentColor, inset 0 0 10px currentColor;
  }
  100% { 
    border-color: currentColor;
    box-shadow: 0 0 5px currentColor;
  }
`;

const shadowCrawl = keyframes`
  0% { 
    box-shadow: 
      0 0 10px currentColor,
      inset 5px 5px 10px ${GOTHIC_PALETTE.deepBlack}aa;
  }
  25% { 
    box-shadow: 
      5px 0 15px currentColor,
      inset -5px 5px 15px ${GOTHIC_PALETTE.ravenBlack}aa;
  }
  50% { 
    box-shadow: 
      0 5px 20px currentColor,
      inset -5px -5px 20px ${GOTHIC_PALETTE.shadowGray}aa;
  }
  75% { 
    box-shadow: 
      -5px 0 15px currentColor,
      inset 5px -5px 15px ${GOTHIC_PALETTE.stormCloud}aa;
  }
  100% { 
    box-shadow: 
      0 0 10px currentColor,
      inset 5px 5px 10px ${GOTHIC_PALETTE.deepBlack}aa;
  }
`;

const ornateFlicker = keyframes`
  0% { 
    border-style: solid;
    filter: brightness(1);
  }
  10% { 
    border-style: dashed;
    filter: brightness(1.1) contrast(1.1);
  }
  20% { 
    border-style: dotted;
    filter: brightness(0.9) hue-rotate(10deg);
  }
  30% { 
    border-style: double;
    filter: brightness(1.2) saturate(1.2);
  }
  40% { 
    border-style: ridge;
    filter: brightness(0.8) contrast(1.3);
  }
  50% { 
    border-style: groove;
    filter: brightness(1.1) sepia(0.1);
  }
  60% { 
    border-style: inset;
    filter: brightness(0.95) hue-rotate(-5deg);
  }
  70% { 
    border-style: outset;
    filter: brightness(1.05) saturate(0.9);
  }
  80% { 
    border-style: solid;
    filter: brightness(1.1) contrast(0.9);
  }
  90% { 
    border-style: solid;
    filter: brightness(0.9) saturate(1.1);
  }
  100% { 
    border-style: solid;
    filter: brightness(1);
  }
`;

const bloodDrip = keyframes`
  0% {
    border-image: linear-gradient(180deg, currentColor, currentColor) 1;
  }
  25% {
    border-image: linear-gradient(180deg, currentColor 70%, ${GOTHIC_PALETTE.bloodRed} 100%) 1;
  }
  50% {
    border-image: linear-gradient(180deg, currentColor 50%, ${GOTHIC_PALETTE.bloodRed} 75%, ${GOTHIC_PALETTE.deepBlack} 100%) 1;
  }
  75% {
    border-image: linear-gradient(180deg, currentColor 60%, ${GOTHIC_PALETTE.bloodRed} 80%, ${GOTHIC_PALETTE.deepBlack} 100%) 1;
  }
  100% {
    border-image: linear-gradient(180deg, currentColor, currentColor) 1;
  }
`;

// 🏰 VISUAL EFFECTS CONFIGURATION
// Declarative system for easy modification and addition

type VisualEffectKey =
  | "gothic-pulse"
  | "shadow-crawl"
  | "ornate-flicker"
  | "blood-drip"
  | "spectral-shimmer";

interface VisualEffect {
  name: string;
  description: string;
  animation: ReturnType<typeof css>;
  borderWidth: string;
  additionalStyles: string;
}

const VISUAL_EFFECTS: Record<VisualEffectKey, VisualEffect> = {
  // Gothic border effects that can be easily applied
  "gothic-pulse": {
    name: "Gothic Pulse",
    description: "Borders gently pulse with ethereal gothic light",
    animation: css`
      ${gothicBorderPulse} 3s infinite ease-in-out
    `,
    borderWidth: "2px",
    additionalStyles: "",
  },
  "shadow-crawl": {
    name: "Shadow Crawl",
    description: "Living shadows crawl around the border edges",
    animation: css`
      ${shadowCrawl} 4s infinite ease-in-out
    `,
    borderWidth: "3px",
    additionalStyles: "filter: drop-shadow(0 0 8px currentColor);",
  },
  "ornate-flicker": {
    name: "Ornate Flicker",
    description: "Border styles flicker between ornate gothic patterns",
    animation: css`
      ${ornateFlicker} 6s infinite steps(10)
    `,
    borderWidth: "4px",
    additionalStyles: "border-radius: 12px;",
  },
  "blood-drip": {
    name: "Blood Drip",
    description: "Crimson essence drips down from the top border",
    animation: css`
      ${bloodDrip} 5s infinite ease-in-out
    `,
    borderWidth: "3px",
    additionalStyles: "border-radius: 8px; overflow: hidden;",
  },
  "spectral-shimmer": {
    name: "Spectral Shimmer",
    description: "Ghostly shimmer effect with color shifting borders",
    animation: css`
      ${gothicBorderPulse} 2s infinite ease-in-out, ${shadowCrawl} 8s infinite linear
    `,
    borderWidth: "2px",
    additionalStyles:
      "filter: hue-rotate(45deg) saturate(1.2) brightness(1.1);",
  },
};

// 🎨 UTILITY FUNCTION: Easy Visual Effect Addition
// To add a new effect, simply:
// 1. Add keyframe animation above
// 2. Add effect key to VisualEffectKey type
// 3. Add configuration object to VISUAL_EFFECTS
// 4. Assign to any feature in GOTHIC_FEATURES
//
// Example: "mystic-glow": createVisualEffect("Mystic Glow", "Mystical glowing border", css`${myGlowKeyframe} 2s infinite`, "3px", "filter: brightness(1.3);")
const createVisualEffect = (
  name: string,
  description: string,
  animation: ReturnType<typeof css>,
  borderWidth: string,
  additionalStyles: string
): VisualEffect => ({
  name,
  description,
  animation,
  borderWidth,
  additionalStyles,
});

// 🪄 WAND HOVER UNLOCK SPELL ANIMATIONS - Animation Team Approved!
const wandSpellCast = keyframes`
  0% { 
    transform: scale(1) rotate(0deg);
    box-shadow: 0 0 10px ${GOTHIC_PALETTE.gothicGold}44;
  }
  25% { 
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 0 20px ${GOTHIC_PALETTE.gothicGold}77, 0 0 40px ${GOTHIC_PALETTE.moonSilver}33;
  }
  50% { 
    transform: scale(1.1) rotate(-1deg);
    box-shadow: 0 0 30px ${GOTHIC_PALETTE.gothicGold}99, 0 0 60px ${GOTHIC_PALETTE.moonSilver}55, 0 0 80px ${GOTHIC_PALETTE.ghostWhite}22;
  }
  75% { 
    transform: scale(1.08) rotate(3deg);
    box-shadow: 0 0 25px ${GOTHIC_PALETTE.gothicGold}88, 0 0 50px ${GOTHIC_PALETTE.moonSilver}44;
  }
  100% { 
    transform: scale(1.05) rotate(0deg);
    box-shadow: 0 0 15px ${GOTHIC_PALETTE.gothicGold}66;
  }
`;

const magicalExpansion = keyframes`
  0% { 
    transform: scale(1);
    border-radius: 15px;
  }
  50% { 
    transform: scale(1.02);
    border-radius: 17px;
  }
  100% { 
    transform: scale(1.01);
    border-radius: 16px;
  }
`;

const spellParticles = keyframes`
  0% { 
    opacity: 0;
    transform: translateY(0px) scale(0.8);
  }
  25% { 
    opacity: 0.8;
    transform: translateY(-10px) scale(1.2);
  }
  50% { 
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  75% { 
    opacity: 0.6;
    transform: translateY(-30px) scale(0.9);
  }
  100% { 
    opacity: 0;
    transform: translateY(-40px) scale(0.5);
  }
`;

const wandTrail = keyframes`
  0% { 
    opacity: 0;
    width: 0%;
    background: linear-gradient(90deg, transparent, ${GOTHIC_PALETTE.gothicGold}aa, transparent);
  }
  50% { 
    opacity: 1;
    width: 100%;
    background: linear-gradient(90deg, transparent, ${GOTHIC_PALETTE.gothicGold}ff, ${GOTHIC_PALETTE.moonSilver}aa, transparent);
  }
  100% { 
    opacity: 0.3;
    width: 120%;
    background: linear-gradient(90deg, transparent, ${GOTHIC_PALETTE.moonSilver}66, transparent);
  }
`;

const unlockRunes = keyframes`
  0% { 
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
    filter: blur(3px);
  }
  25% { 
    opacity: 0.6;
    transform: rotate(90deg) scale(0.8);
    filter: blur(2px);
  }
  50% { 
    opacity: 1;
    transform: rotate(180deg) scale(1.2);
    filter: blur(0px);
  }
  75% { 
    opacity: 0.8;
    transform: rotate(270deg) scale(1);
    filter: blur(1px);
  }
  100% { 
    opacity: 0.4;
    transform: rotate(360deg) scale(0.9);
    filter: blur(2px);
  }
`;

// � JAGGED ETCHING OVERLAY - Creeping Gothic Details
const jaggedEtching = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0.95);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1);
  }
  100% { 
    opacity: 0.15;
    transform: scale(1.02);
  }
`;

const etchingCreep = keyframes`
  0% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  }
  25% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 30%, 0% 25%);
  }
  50% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 0% 75%);
  }
  75% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  100% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
`;

// �🕷️ CRAWLING SPIDER ANIMATIONS WITH NEON SILK TRAILS
const spiderCrawl = keyframes`
  0% { 
    transform: translateX(-100px) translateY(0px) rotate(0deg);
    filter: drop-shadow(0 0 5px #00ff88);
  }
  25% { 
    transform: translateX(25vw) translateY(-20px) rotate(90deg);
    filter: drop-shadow(0 0 15px #ff0088);
  }
  50% { 
    transform: translateX(50vw) translateY(10px) rotate(180deg);
    filter: drop-shadow(0 0 10px #8800ff);
  }
  75% { 
    transform: translateX(75vw) translateY(-15px) rotate(270deg);
    filter: drop-shadow(0 0 20px #00ffff);
  }
  100% { 
    transform: translateX(100vw) translateY(5px) rotate(360deg);
    filter: drop-shadow(0 0 8px #ffff00);
  }
`;

const neonSilkTrail = keyframes`
  0% { 
    opacity: 0;
    transform: scaleX(0) scaleY(1);
    box-shadow: 0 0 5px #00ff88, inset 0 0 10px #00ff88aa;
  }
  25% { 
    opacity: 0.7;
    transform: scaleX(0.25) scaleY(1.2);
    box-shadow: 0 0 15px #ff0088, inset 0 0 20px #ff0088aa;
  }
  50% { 
    opacity: 1;
    transform: scaleX(0.5) scaleY(0.8);
    box-shadow: 0 0 25px #8800ff, inset 0 0 15px #8800ffaa;
  }
  75% { 
    opacity: 0.5;
    transform: scaleX(0.75) scaleY(1.5);
    box-shadow: 0 0 30px #00ffff, inset 0 0 25px #00ffffaa;
  }
  100% { 
    opacity: 0.2;
    transform: scaleX(1) scaleY(0.6);
    box-shadow: 0 0 10px #ffff00, inset 0 0 5px #ffff00aa;
  }
`;

const spiderLegWiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scaleY(1); }
  25% { transform: rotate(5deg) scaleY(1.1); }
  50% { transform: rotate(-3deg) scaleY(0.9); }
  75% { transform: rotate(2deg) scaleY(1.05); }
`;

// 🕸️ COBWEB SWAY ANIMATION
const cobwebSway = keyframes`
  0%, 100% { 
    transform: rotate(0deg) scale(1);
    filter: drop-shadow(0 0 3px rgba(255,255,255,0.3));
  }
  25% { 
    transform: rotate(2deg) scale(1.02);
    filter: drop-shadow(0 0 8px rgba(138,43,226,0.4));
  }
  50% { 
    transform: rotate(-1deg) scale(0.98);
    filter: drop-shadow(0 0 5px rgba(0,255,255,0.3));
  }
  75% { 
    transform: rotate(3deg) scale(1.01);
    filter: drop-shadow(0 0 10px rgba(255,0,136,0.4));
  }
`;

const graveyardMist = keyframes`
  0% { 
    opacity: 0.1;
    transform: translateX(-20px) scaleY(0.8);
    filter: blur(2px);
  }
  25% { 
    opacity: 0.3;
    transform: translateX(10px) scaleY(1.2);
    filter: blur(3px);
  }
  50% { 
    opacity: 0.5;
    transform: translateX(-5px) scaleY(0.9);
    filter: blur(1px);
  }
  75% { 
    opacity: 0.2;
    transform: translateX(15px) scaleY(1.1);
    filter: blur(4px);
  }
  100% { 
    opacity: 0.1;
    transform: translateX(-10px) scaleY(0.8);
    filter: blur(2px);
  }
`;

// 🪦 TOMBSTONE SWAY
const tombstoneWaver = keyframes`
  0%, 100% { 
    transform: rotate(0deg) scale(1);
    filter: drop-shadow(0 0 5px rgba(70,70,70,0.5));
  }
  25% { 
    transform: rotate(1deg) scale(1.02);
    filter: drop-shadow(0 0 10px rgba(138,43,226,0.3));
  }
  50% { 
    transform: rotate(-0.5deg) scale(0.98);
    filter: drop-shadow(0 0 7px rgba(72,61,139,0.4));
  }
  75% { 
    transform: rotate(2deg) scale(1.01);
    filter: drop-shadow(0 0 12px rgba(25,25,112,0.3));
  }
`;

// 👻 GHOST DRIFT
const ghostDrift = keyframes`
  0% { 
    opacity: 0.2;
    transform: translateY(0px) scale(1) rotate(0deg);
    filter: blur(1px);
  }
  25% { 
    opacity: 0.6;
    transform: translateY(-15px) scale(1.1) rotate(2deg);
    filter: blur(0px);
  }
  50% { 
    opacity: 0.4;
    transform: translateY(-30px) scale(0.9) rotate(-1deg);
    filter: blur(2px);
  }
  75% { 
    opacity: 0.7;
    transform: translateY(-10px) scale(1.05) rotate(3deg);
    filter: blur(0px);
  }
  100% { 
    opacity: 0.2;
    transform: translateY(0px) scale(1) rotate(0deg);
    filter: blur(1px);
  }
`;

// 🦇 BAT SWARM
const batFly = keyframes`
  0% { 
    transform: translateX(-100px) translateY(10px) rotate(0deg);
    opacity: 0;
  }
  10% { 
    opacity: 0.8;
    transform: translateX(10vw) translateY(-20px) rotate(15deg);
  }
  25% { 
    transform: translateX(30vw) translateY(5px) rotate(-10deg);
  }
  50% { 
    transform: translateX(60vw) translateY(-15px) rotate(20deg);
  }
  75% { 
    transform: translateX(85vw) translateY(8px) rotate(-5deg);
  }
  90% { 
    opacity: 0.6;
    transform: translateX(95vw) translateY(-5px) rotate(10deg);
  }
  100% { 
    opacity: 0;
    transform: translateX(110vw) translateY(0px) rotate(0deg);
  }
`;

// 🖋️ FOUNTAIN PEN SMASH MODAL SYSTEM - Gothic Typography Destruction!
const FountainPenModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
`;

const FountainPenCrash = styled(motion.div)`
  font-size: 15rem;
  filter: drop-shadow(0 0 30px ${GOTHIC_PALETTE.deepBlack});
  transform-origin: center;
`;

const TileScatterContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const ScatteredTile = styled(motion.div)<{ $theme: string }>`
  position: absolute;
  width: 200px;
  height: 150px;
  background: linear-gradient(
    145deg,
    ${GOTHIC_PALETTE.deepBlack} 0%,
    #000000 30%,
    ${GOTHIC_PALETTE.ravenBlack} 60%,
    #000000 100%
  );
  border: 2px solid
    ${(props) =>
      props.$theme === "raven"
        ? GOTHIC_PALETTE.shadowGray
        : props.$theme === "moon"
        ? GOTHIC_PALETTE.stormCloud
        : props.$theme === "blood"
        ? GOTHIC_PALETTE.shadowGray
        : GOTHIC_PALETTE.stormCloud};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${GOTHIC_PALETTE.ghostWhite};
  font-family: "Cinzel", serif;
  font-size: 0.8rem;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.8));
`;

const PenCrashEffect = styled(motion.div)`
  font-size: 15rem;
  color: ${GOTHIC_PALETTE.deepBlack};
  filter: drop-shadow(0 0 30px ${GOTHIC_PALETTE.gothicGold});
  transform-origin: center;
  position: absolute;
  z-index: 10001;
`;

const CrashText = styled(motion.div)`
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  color: ${GOTHIC_PALETTE.gothicGold};
  font-family: "Cinzel", serif;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 20px ${GOTHIC_PALETTE.deepBlack};
  z-index: 10002;
`;

// � CONE CRASH EFFECT - Direct UI Impact Version
const ConeCrashEffect = styled(motion.div)`
  position: fixed;
  width: 8rem;
  height: 8rem;
  z-index: 10000;
  pointer-events: none;
  filter: drop-shadow(0 0 30px ${GOTHIC_PALETTE.gothicGold});

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// 🚧 CONE PARTICLE SYSTEM - Sacred Cone Explosion Effect
const ConeParticleSystem = styled(motion.div)<{ $x: number; $y: number }>`
  position: fixed;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  width: 1px;
  height: 1px;
  z-index: 10000;
  pointer-events: none;
`;

const ConeParticle = styled(motion.div)`
  position: absolute;
  width: 3rem;
  height: 3rem;
  z-index: 10001;
  pointer-events: none;
  filter: drop-shadow(0 0 15px ${GOTHIC_PALETTE.gothicGold});

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// 🎬 FOUNTAIN PEN ANIMATION VARIANTS
const fountainPenVariants = {
  hidden: {
    x: "100vw",
    y: "-100vh",
    rotate: 45,
    scale: 0.5,
  },
  visible: {
    x: "50vw",
    y: "50vh",
    rotate: 0,
    scale: 1.5,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic bezier for easeIn effect
    },
  },
  exit: {
    x: "-100vw",
    y: "100vh",
    rotate: -45,
    scale: 0.3,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic bezier for easeOut effect
    },
  },
};

const penCrashVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: 0,
  },
  crash: {
    opacity: 1,
    scale: [0, 1.5, 1.2, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      times: [0, 0.3, 0.7, 1],
    },
  },
};

const tileScatterVariants = {
  hidden: { opacity: 0 },
  scatter: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.8,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const individualTileVariants = {
  hidden: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  },
  scatter: {
    x: () => (Math.random() - 0.5) * window.innerWidth * 1.5,
    y: () => (Math.random() - 0.5) * window.innerHeight * 1.5,
    rotate: () => (Math.random() - 0.5) * 720,
    scale: () => 0.3 + Math.random() * 0.7,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
  exit: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

// 🏆 ULTIMATE SQUISHY BADGE ECOSYSTEM - The Dev Team's Dream!
// 🏷️ UNIFIED BADGE TYPE SYSTEM
type BadgeType =
  | "error-crusher"
  | "lore-keeper"
  | "shadow-weaver"
  | "raven-whisperer"
  | "code-necromancer";

interface SquishyBadge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  emoji: string;
  squishAnimation: ReturnType<typeof css>;
  color: string;
  glowColor: string;
  personality: BadgePersonality;
  soundEffect: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  squishIntensity: number; // 1-10 scale
  specialPowers: string[];
  unlockCondition: string;
}

const ULTIMATE_SQUISHY_BADGES: Record<BadgeType, SquishyBadge> = {
  "error-crusher": {
    id: "error-crusher",
    type: "error-crusher",
    name: "Error Destroyer Supreme",
    description:
      "LIVES for crushing compilation errors with maximum squishy energy!",
    emoji: "🔥⚡",
    squishAnimation: css`
      ${errorCrushVictory} 1.5s ease-out forwards, ${squishBounce} 2s infinite
    `,
    color: GOTHIC_PALETTE.bloodRed,
    glowColor: GOTHIC_PALETTE.gothicGold,
    personality: "hyperactive-achiever",
    soundEffect: "cone-thunk.mp3",
    rarity: "legendary",
    squishIntensity: 10,
    specialPowers: [
      "Error Detection",
      "Compilation Victory Dance",
      "Red-to-Green Transformation",
    ],
    unlockCondition: "Fix 5 compilation errors in a row",
  },
  "lore-keeper": {
    id: "lore-keeper",
    type: "lore-keeper",
    name: "Zen Pigeon of Ancient Wisdom",
    description:
      "Mystical keeper of all coding lore and hidden digital secrets",
    emoji: "◐◑�",
    squishAnimation: css`
      ${gentleFloat} 4s infinite ease-in-out, ${jellyWobble} 3s infinite
    `,
    color: GOTHIC_PALETTE.moonSilver,
    glowColor: GOTHIC_PALETTE.ghostWhite,
    personality: "zen-master",
    soundEffect: "cone-thunk.mp3",
    rarity: "mythic",
    squishIntensity: 3,
    specialPowers: ["Mystical Stories", "Gentle Guidance", "Inner Peace Aura"],
    unlockCondition: "Click the floating orb 10 times",
  },
  "shadow-weaver": {
    id: "shadow-weaver",
    type: "shadow-weaver",
    name: "Chaos Raven Reality Warper",
    description:
      "Unpredictable genius that reshapes digital reality with every squish!",
    emoji: "�‍⬛✨",
    squishAnimation: css`
      ${plasmaShift} 2s infinite, ${liquidMorph} 3s infinite alternate
    `,
    color: GOTHIC_PALETTE.purpleVelvet,
    glowColor: GOTHIC_PALETTE.deepBlack,
    personality: "chaotic-genius",
    soundEffect: "cone-thunk.mp3",
    rarity: "epic",
    squishIntensity: 8,
    specialPowers: ["Reality Warping", "Chaos Magic", "Impossible Solutions"],
    unlockCondition: "Trigger 3 different visual effects",
  },
  "raven-whisperer": {
    id: "raven-whisperer",
    type: "raven-whisperer",
    name: "Goop Master of Liquid Intelligence",
    description:
      "Flows through digital dimensions as pure liquid intelligence!",
    emoji: "�🌊",
    squishAnimation: css`
      ${goopStretch} 2.5s infinite ease-in-out, ${viscousFlow} 4s infinite
    `,
    color: GOTHIC_PALETTE.purpleVelvet,
    glowColor: GOTHIC_PALETTE.stormCloud,
    personality: "plasma-entity",
    soundEffect: "cone-thunk.mp3",
    rarity: "rare",
    squishIntensity: 9,
    specialPowers: ["Shape Shifting", "Flow State", "Dimensional Travel"],
    unlockCondition: "Interact with shadow effects 5 times",
  },
  "code-necromancer": {
    id: "code-necromancer",
    type: "code-necromancer",
    name: "Digital Phantom Overlord",
    description:
      "Glitchy spirit that haunts your codebase with transcendent squishy love!",
    emoji: "👻💫",
    squishAnimation: css`
      ${plasmaShift} 1.8s infinite, ${bubblePop} 3s infinite ease-in-out
    `,
    color: GOTHIC_PALETTE.ghostWhite,
    glowColor: GOTHIC_PALETTE.shadowGray,
    personality: "digital-ghost",
    soundEffect: "cone-thunk.mp3",
    rarity: "legendary",
    squishIntensity: 7,
    specialPowers: ["Code Haunting", "Glitch Magic", "Digital Transcendence"],
    unlockCondition: "Experience 5 compilation cycles",
  },
};

// 🏆 ERROR-CRUSHING BADGE SYSTEM - Interactive badges dripping with lore!
// Badge animations for that squishy interactive feel

const badgeBounce = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.15) rotate(-2deg); }
  50% { transform: scale(1.05) rotate(1deg); }
  75% { transform: scale(1.1) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const badgeGlow = keyframes`
  0% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor, inset 0 0 10px currentColor; }
  100% { box-shadow: 0 0 5px currentColor; }
`;

// 🏰 Gothic Styled Components
const GothicRealm = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${GOTHIC_PALETTE.deepBlack} 0%,
    ${GOTHIC_PALETTE.ravenBlack} 25%,
    ${GOTHIC_PALETTE.shadowGray} 50%,
    ${GOTHIC_PALETTE.deepBlack} 100%
  );
  color: ${GOTHIC_PALETTE.ghostWhite};
  font-family: "Cinzel", "Georgia", serif;
  position: relative;
  overflow: hidden;
  padding: 2rem;

  /* 🪄 MYSTICAL WAND CURSOR - Consistent everywhere */
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="28" font-size="24">🪄</text></svg>'),
    auto;

  /* 🌟 Force wand cursor on ALL elements */
  *,
  *:hover,
  button,
  a,
  [role="button"],
  .clickable,
  input,
  textarea,
  select {
    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="28" font-size="24">🪄</text></svg>'),
      auto !important;
  }
`;

const RavenSwarm = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const Raven = styled.div<{
  $delay: number;
  $size: string;
  $isSpecial?: boolean;
  $opacity?: number;
  $flightPattern?: number;
  $isGiant?: boolean;
  $duration: number;
  $topPosition: string;
  $specialDuration?: number;
}>`
  position: absolute;
  font-size: ${(props) => props.$size};

  /* 🦅 DYNAMIC FLIGHT PATTERNS - Choose animation based on flightPattern */
  ${(props) => {
    const flightAnimations = [
      ravenFly,
      ravenDive,
      ravenSoar,
      ravenCircle,
      ravenSpiral,
    ];
    const selectedAnimation = flightAnimations[props.$flightPattern || 0];

    return css`
      animation: ${selectedAnimation} ${props.$duration}s linear infinite;
    `;
  }}

  animation-delay: ${(props) => props.$delay}s;
  top: ${(props) => props.$topPosition};
  opacity: ${(props) => props.$opacity || 0};

  /* 🌟 GIANT RAVEN SPECIAL EFFECTS */
  ${(props) =>
    props.$isGiant &&
    css`
      filter: drop-shadow(0 0 15px ${GOTHIC_PALETTE.purpleVelvet})
        drop-shadow(0 0 25px ${GOTHIC_PALETTE.bloodRed}) brightness(1.2);
      z-index: 10;
      font-weight: bold;

      &:hover {
        animation-play-state: paused;
        transform: scale(1.3);
        cursor: pointer;
        filter: drop-shadow(0 0 25px ${GOTHIC_PALETTE.gothicGold})
          drop-shadow(0 0 35px ${GOTHIC_PALETTE.purpleVelvet});
      }
    `}

  ${(props) =>
    props.$isSpecial &&
    css`
      filter: drop-shadow(0 0 12px ${GOTHIC_PALETTE.gothicGold})
        drop-shadow(0 0 20px ${GOTHIC_PALETTE.moonSilver});
      animation-duration: ${props.$specialDuration || 7}s;
      transform-origin: center;
      z-index: 15;

      &:hover {
        animation-play-state: paused;
        transform: scale(1.4);
        cursor: pointer;
        filter: drop-shadow(0 0 30px ${GOTHIC_PALETTE.gothicGold})
          drop-shadow(0 0 40px ${GOTHIC_PALETTE.moonSilver});
      }
    `}
    
  /* 🎭 DRAMATIC SCALING FOR DIFFERENT SIZES */
  ${(props) => {
    const size = parseFloat(props.$size);
    if (size >= 4) {
      return css`
        filter: brightness(1.1) contrast(1.2)
          drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
        z-index: 8;
      `;
    } else if (size >= 3) {
      return css`
        filter: brightness(1.05) drop-shadow(0 0 6px rgba(0, 0, 0, 0.6));
        z-index: 6;
      `;
    }
    return css`
      filter: brightness(0.9) drop-shadow(0 0 3px rgba(0, 0, 0, 0.4));
      z-index: 4;
    `;
  }}
`;

// 🕷️ CRAWLING SPIDERS WITH NEON SILK TRAILS
const SpiderSwarm = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
`;

const CrawlingSpider = styled.div<{
  $delay: number;
  $speed: number;
  $size: string;
  $trailColor: string;
  $yPosition: string;
}>`
  position: absolute;
  font-size: ${(props) => props.$size};
  top: ${(props) => props.$yPosition};
  left: -50px;
  ${(props) =>
    css`
      animation: ${spiderCrawl} ${props.$speed}s infinite linear;
    `}
  animation-delay: ${(props) => props.$delay}s;
  z-index: 4;

  &::before {
    content: "🕷️";
    display: block;
    ${css`
      animation: ${spiderLegWiggle} 0.3s infinite ease-in-out;
    `}
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -100px;
    width: 100px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${(props) => props.$trailColor}88 50%,
      transparent 100%
    );
    ${(props) =>
      css`
        animation: ${neonSilkTrail} ${props.$speed}s infinite linear;
      `}
    animation-delay: ${(props) => props.$delay}s;
    transform-origin: left center;
    border-radius: 1px;
    box-shadow: 0 0 5px ${(props) => props.$trailColor}66;
  }
`;

// 🕸️ COBWEBS EVERYWHERE
const CobwebLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.7;
`;

const Cobweb = styled.div<{
  $size: string;
  $position: { top: string; left: string };
  $rotation: number;
  $intensity: number;
}>`
  position: absolute;
  top: ${(props) => props.$position.top};
  left: ${(props) => props.$position.left};
  font-size: ${(props) => props.$size};
  transform: rotate(${(props) => props.$rotation}deg);
  ${(props) =>
    css`
      animation: ${cobwebSway} ${3 + props.$intensity}s infinite ease-in-out;
    `}
  opacity: ${(props) => 0.3 + props.$intensity * 0.1};

  &::before {
    content: "🕸️";
    display: block;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.2));
  }
`;

// ⚰️ GRAVEYARD MIST
const GraveyardMist = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const MistLayer = styled.div<{
  $height: string;
  $opacity: number;
  $speed: number;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120%;
  height: ${(props) => props.$height};
  background: linear-gradient(
    0deg,
    rgba(138, 43, 226, ${(props) => props.$opacity * 0.1}) 0%,
    rgba(72, 61, 139, ${(props) => props.$opacity * 0.05}) 50%,
    transparent 100%
  );
  ${(props) =>
    css`
      animation: ${graveyardMist} ${props.$speed}s infinite ease-in-out;
    `}
  border-radius: 50% 50% 0 0;
`;

// 🪦 GRAVEYARD TOMBSTONES
const GraveyardTombstones = styled.div`
  position: absolute;
  bottom: 5%;
  left: 0;
  width: 100%;
  height: 40%;
  pointer-events: none;
  z-index: 2;
`;

const Tombstone = styled.div<{
  $size: string;
  $position: { bottom: string; left: string };
  $tilt: number;
  $animationDuration: number;
}>`
  position: absolute;
  bottom: ${(props) => props.$position.bottom};
  left: ${(props) => props.$position.left};
  font-size: ${(props) => props.$size};
  transform: rotate(${(props) => props.$tilt}deg);
  animation: ${tombstoneWaver} ${(props) => props.$animationDuration}s infinite
    ease-in-out;
  opacity: 0.7;
  cursor: pointer;

  &::before {
    content: "🪦";
    display: block;
    filter: drop-shadow(0 0 5px rgba(70, 70, 70, 0.8));
  }

  &:hover {
    animation-play-state: paused;
    transform: scale(1.2) rotate(${(props) => props.$tilt + 5}deg);
    filter: drop-shadow(0 0 15px ${GOTHIC_PALETTE.ghostWhite});
  }
`;

// 👻 FLOATING GHOSTS
const GhostLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
`;

const FloatingGhost = styled.div<{
  $size: string;
  $position: { top: string; left: string };
  $speed: number;
}>`
  position: absolute;
  top: ${(props) => props.$position.top};
  left: ${(props) => props.$position.left};
  font-size: ${(props) => props.$size};
  ${(props) =>
    css`
      animation: ${ghostDrift} ${props.$speed}s infinite ease-in-out;
    `}
  opacity: 0.3;

  &::before {
    content: "👻";
    display: block;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }
`;

// 🦇 BAT SWARM
const BatSwarm = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
  overflow: hidden;
`;

const FlyingBat = styled.div<{
  $delay: number;
  $speed: number;
  $size: string;
  $yPosition: string;
}>`
  position: absolute;
  font-size: ${(props) => props.$size};
  top: ${(props) => props.$yPosition};
  left: -50px;
  ${(props) =>
    css`
      animation: ${batFly} ${props.$speed}s infinite linear;
    `}
  animation-delay: ${(props) => props.$delay}s;
  opacity: 0;

  &::before {
    content: "🦇";
    display: block;
    filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.8));
  }
`;

const GothicTitle = styled.h1`
  font-size: 4rem;
  text-align: center;
  color: ${GOTHIC_PALETTE.ghostWhite};
  ${css`
    animation: ${shadowPulse} 3s ease-in-out infinite;
  `}
  font-family: "Cinzel Decorative", "Old English Text MT", cursive;
  margin-bottom: 1rem;
  position: relative;
  z-index: 10;

  &::before {
    content: "🐦‍⬛";
    position: absolute;
    left: -3rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    ${css`
      animation: ${candleFlicker} 2s ease-in-out infinite;
    `}
  }

  &::after {
    content: "🐦‍⬛";
    position: absolute;
    right: -3rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    ${css`
      animation: ${candleFlicker} 2s ease-in-out infinite reverse;
    `}
  }
`;

const PoeQuote = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-style: italic;
  color: ${GOTHIC_PALETTE.moonSilver};
  margin-bottom: 3rem;
  opacity: 0.9;
  position: relative;
  z-index: 10;

  &::before {
    content: "“";
    font-size: 3rem;
    color: ${GOTHIC_PALETTE.purpleVelvet};
    position: absolute;
    left: -2rem;
    top: -1rem;
  }

  &::after {
    content: "”ish";
    font-size: 3rem;
    color: ${GOTHIC_PALETTE.purpleVelvet};
    position: absolute;
    right: -2rem;
    bottom: -2rem;
  }
`;

// 🌫️ ATMOSPHERIC MOOD COMPONENTS - Dynamic Realm Atmosphere
const AtmosphericOverlay = styled.div<{ $mood: GothicMood }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${(props) => props.$mood.backgroundGradient};
  filter: ${(props) => props.$mood.lightingFilter};
  ${css`
    animation: ${moodTransition} 0.8s ease-in-out;
  `}
  z-index: 0;
  pointer-events: none;
`;

const DynamicMist = styled.div<{ $mood: GothicMood }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120%;
  height: 60%;
  background: linear-gradient(
    0deg,
    ${(props) => props.$mood.mistColor} 0%,
    rgba(0, 0, 0, 0.1) 50%,
    transparent 100%
  );
  opacity: ${(props) => props.$mood.mistOpacity};
  ${css`
    animation: ${fogRoll} 8s infinite ease-in-out;
  `}
  border-radius: 50% 50% 0 0;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.6s ease-in-out;
`;

const TreeLine = styled.div<{ $mood: GothicMood }>`
  position: absolute;
  bottom: 10%;
  left: 0;
  width: 100%;
  height: 40%;
  opacity: ${(props) => props.$mood.treeVisibility};
  ${css`
    animation: ${treeSway} 6s infinite ease-in-out;
  `}
  z-index: 2;
  pointer-events: none;
  --tree-visibility: ${(props) => props.$mood.treeVisibility};
  transition: opacity 0.6s ease-in-out;
`;

const Tree = styled.div<{
  $position: { bottom: string; left: string };
  $size: string;
}>`
  position: absolute;
  bottom: ${(props) => props.$position.bottom};
  left: ${(props) => props.$position.left};
  font-size: ${(props) => props.$size};
  color: ${GOTHIC_PALETTE.shadowGray};
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.8));
`;

// 🪄 WAND GLOW TRACKING SYSTEM - Mysterious illuminating aura
const WandGlowOverlay = styled.div<{
  $x: number;
  $y: number;
  $hoveredElement: string | null;
}>`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 50;

  &::before {
    content: "";
    position: absolute;
    left: ${(props) => props.$x - 100}px;
    top: ${(props) => props.$y - 100}px;
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      rgba(218, 165, 32, 0.3) 0%,
      rgba(138, 43, 226, 0.2) 30%,
      rgba(74, 20, 140, 0.1) 60%,
      transparent 100%
    );
    border-radius: 50%;
    transition: all 0.15s ease-out;
    filter: blur(8px);
  }

  /* Enhanced glow for different hovered elements */
  ${(props) =>
    props.$hoveredElement === "shadow-effects" &&
    css`
      &::before {
        background: radial-gradient(
          circle,
          rgba(0, 0, 0, 0.8) 0%,
          rgba(138, 43, 226, 0.4) 30%,
          rgba(0, 0, 0, 0.2) 60%,
          transparent 100%
        );
        filter: blur(12px);
        width: 300px;
        height: 300px;
        left: ${props.$x - 150}px;
        top: ${props.$y - 150}px;
      }
    `}

  ${(props) =>
    props.$hoveredElement === "raven-swarm" &&
    css`
      &::before {
        background: radial-gradient(
          circle,
          rgba(74, 20, 140, 0.6) 0%,
          rgba(138, 43, 226, 0.3) 40%,
          rgba(218, 165, 32, 0.2) 70%,
          transparent 100%
        );
        filter: blur(10px);
        width: 250px;
        height: 250px;
        left: ${props.$x - 125}px;
        top: ${props.$y - 125}px;
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "moonlit-themes" &&
    css`
      &::before {
        background: radial-gradient(
          circle,
          rgba(192, 192, 192, 0.5) 0%,
          rgba(248, 248, 255, 0.3) 40%,
          rgba(218, 165, 32, 0.1) 70%,
          transparent 100%
        );
        filter: blur(15px);
        width: 280px;
        height: 280px;
        left: ${props.$x - 140}px;
        top: ${props.$y - 140}px;
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "poe-poetry" &&
    css`
      &::before {
        background: radial-gradient(
          circle,
          rgba(139, 0, 0, 0.4) 0%,
          rgba(218, 165, 32, 0.3) 40%,
          rgba(74, 20, 140, 0.2) 70%,
          transparent 100%
        );
        filter: blur(12px);
        width: 260px;
        height: 260px;
        left: ${props.$x - 130}px;
        top: ${props.$y - 130}px;
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "gothic-typography" &&
    css`
      &::before {
        background: radial-gradient(
          circle,
          rgba(218, 165, 32, 0.5) 0%,
          rgba(192, 192, 192, 0.3) 40%,
          rgba(74, 20, 140, 0.2) 70%,
          transparent 100%
        );
        filter: blur(10px);
        width: 240px;
        height: 240px;
        left: ${props.$x - 120}px;
        top: ${props.$y - 120}px;
      }
    `}
`;

// 🌟 Hidden content revealed by wand proximity
const HiddenContent = styled.div<{
  $revealed: boolean;
  $hoveredElement: string | null;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: ${(props) => (props.$revealed ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
  z-index: 15;

  /* Different hidden content for different tiles */
  ${(props) =>
    props.$hoveredElement === "shadow-effects" &&
    css`
      &::before {
        content: "🕯️💀⚰️🌫️";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
      }
    `}

  ${(props) =>
    props.$hoveredElement === "raven-swarm" &&
    css`
      &::before {
        content: "🐦‍⬛👁️🔮🌙";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(74, 20, 140, 0.8);
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "moonlit-themes" &&
    css`
      &::before {
        content: "🌙✨🕊️💫";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(192, 192, 192, 0.8);
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "gothic-architecture" &&
    css`
      &::before {
        content: "🏰⛪🗿🕳️";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(218, 165, 32, 0.8);
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "poe-poetry" &&
    css`
      &::before {
        content: "📜🖋️💀🕯️";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(139, 0, 0, 0.8);
      }
    `}
  
  ${(props) =>
    props.$hoveredElement === "gothic-typography" &&
    css`
      &::before {
        content: "✒️📖🔤👁️";
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(218, 165, 32, 0.8);
      }
    `}
`;

const GothicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`;

const DarkTile = styled(motion.div)<{
  $theme: string;
  $visualEffect?: VisualEffectKey;
}>`
  background: linear-gradient(
    145deg,
    ${GOTHIC_PALETTE.deepBlack} 0%,
    #000000 30%,
    ${GOTHIC_PALETTE.ravenBlack} 60%,
    #000000 100%
  );
  border: ${(props) =>
      props.$visualEffect && VISUAL_EFFECTS[props.$visualEffect]
        ? VISUAL_EFFECTS[props.$visualEffect].borderWidth
        : "4px"}
    solid
    ${(props) =>
      props.$theme === "raven"
        ? GOTHIC_PALETTE.shadowGray
        : props.$theme === "moon"
        ? GOTHIC_PALETTE.stormCloud
        : props.$theme === "blood"
        ? GOTHIC_PALETTE.shadowGray
        : GOTHIC_PALETTE.stormCloud};
  border-radius: 15px;
  padding: 3rem; /* More padding for reserved border areas */
  margin: 1rem; /* Space for encroachment effects */
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: visible; /* Allow encroachment to spill outside */

  /* �️ RESERVED BORDER ZONE - Space for cobwebs and spiders */
  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      transparent 0%,
      ${GOTHIC_PALETTE.deepBlack}90 5%,
      transparent 8%,
      ${GOTHIC_PALETTE.shadowGray}60 12%,
      transparent 16%,
      ${GOTHIC_PALETTE.deepBlack}80 20%,
      transparent 24%,
      ${GOTHIC_PALETTE.shadowGray}40 28%,
      transparent 32%,
      ${GOTHIC_PALETTE.deepBlack}70 36%,
      transparent 40%,
      ${GOTHIC_PALETTE.shadowGray}50 44%,
      transparent 48%,
      ${GOTHIC_PALETTE.deepBlack}60 52%,
      transparent 56%,
      ${GOTHIC_PALETTE.shadowGray}30 60%,
      transparent 64%,
      ${GOTHIC_PALETTE.deepBlack}80 68%,
      transparent 72%,
      ${GOTHIC_PALETTE.shadowGray}40 76%,
      transparent 80%,
      ${GOTHIC_PALETTE.deepBlack}90 84%,
      transparent 88%,
      ${GOTHIC_PALETTE.shadowGray}20 92%,
      transparent 96%,
      ${GOTHIC_PALETTE.deepBlack}60 100%
    );
    mask: radial-gradient(ellipse at 10% 20%, transparent 1px, black 2px),
      radial-gradient(ellipse at 30% 50%, transparent 2px, black 3px),
      radial-gradient(ellipse at 50% 10%, transparent 1px, black 2px),
      radial-gradient(ellipse at 70% 80%, transparent 2px, black 3px),
      radial-gradient(ellipse at 90% 30%, transparent 1px, black 2px),
      radial-gradient(ellipse at 20% 90%, transparent 2px, black 3px),
      radial-gradient(ellipse at 60% 60%, transparent 1px, black 2px),
      radial-gradient(ellipse at 80% 40%, transparent 2px, black 3px);
    mask-composite: subtract;
    opacity: 0.2;
    animation: ${jaggedEtching} 8s ease-in-out infinite alternate,
      ${etchingCreep} 15s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
  }

  /* 🕸️ COBWEB ENCROACHMENT - Sprawling around tile edges */
  &::after {
    content: "";
    position: absolute;
    top: -12px;
    left: -12px;
    right: -12px;
    bottom: -12px;
    border-radius: inherit;
    background: radial-gradient(
        circle at 5% 5%,
        ${GOTHIC_PALETTE.mistGray}40 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 95% 5%,
        ${GOTHIC_PALETTE.mistGray}30 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 5% 95%,
        ${GOTHIC_PALETTE.mistGray}35 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 95% 95%,
        ${GOTHIC_PALETTE.mistGray}25 1px,
        transparent 2px
      ),
      linear-gradient(
        45deg,
        transparent 0%,
        ${GOTHIC_PALETTE.mistGray}20 2%,
        transparent 4%,
        transparent 96%,
        ${GOTHIC_PALETTE.mistGray}15 98%,
        transparent 100%
      ),
      linear-gradient(
        -45deg,
        transparent 0%,
        ${GOTHIC_PALETTE.mistGray}15 2%,
        transparent 4%,
        transparent 96%,
        ${GOTHIC_PALETTE.mistGray}20 98%,
        transparent 100%
      );
    opacity: 0.3;
    animation: ${cobwebSway} 12s ease-in-out infinite,
      ${jaggedEtching} 10s ease-in-out infinite reverse;
    pointer-events: none;
    z-index: 2;
  }

  /* 🕷️ CRAWLING SPIDER TRAILS - Occasional movement around edges */
  &:nth-child(odd)::before {
    animation: ${jaggedEtching} 8s ease-in-out infinite alternate,
      ${etchingCreep} 15s ease-in-out infinite,
      ${spiderCrawl} 20s linear infinite;
  }

  &:nth-child(even)::after {
    animation: ${cobwebSway} 12s ease-in-out infinite,
      ${jaggedEtching} 10s ease-in-out infinite reverse,
      ${spiderCrawl} 25s linear infinite reverse;
  }

  /* 🎨 Apply Declarative Visual Effects */
  ${(props) =>
    props.$visualEffect && VISUAL_EFFECTS[props.$visualEffect]
      ? css`
          animation: ${VISUAL_EFFECTS[props.$visualEffect].animation};
          ${VISUAL_EFFECTS[props.$visualEffect].additionalStyles}
        `
      : ""}

  &:hover {
    /* 🪄 WAND HOVER UNLOCK SPELL ANIMATION - Deep Gothic Shadows */
    ${css`
      animation: ${wandSpellCast} 0.6s ease-out,
        ${magicalExpansion} 0.8s ease-out;
    `}
    transform: translateY(-1px) scale(1.005);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.95),
      inset 0 0 8px
        ${(props) =>
          props.$theme === "raven"
            ? "rgba(10, 5, 15, 0.8)"
            : props.$theme === "moon"
            ? "rgba(15, 15, 15, 0.8)"
            : props.$theme === "blood"
            ? "rgba(15, 5, 5, 0.8)"
            : "rgba(15, 12, 8, 0.8)"},
      0 0 6px ${GOTHIC_PALETTE.deepBlack}99,
      0 0 12px ${GOTHIC_PALETTE.shadowGray}77;
    border-color: ${(props) =>
      props.$theme === "raven"
        ? GOTHIC_PALETTE.deepBlack
        : props.$theme === "moon"
        ? GOTHIC_PALETTE.shadowGray
        : props.$theme === "blood"
        ? GOTHIC_PALETTE.deepBlack
        : GOTHIC_PALETTE.shadowGray};

    /* 🎨 Enhanced hover effects for visual effects */
    ${(props) =>
      props.$visualEffect && VISUAL_EFFECTS[props.$visualEffect]
        ? `
          filter: brightness(1.3) contrast(1.2) drop-shadow(0 0 20px ${GOTHIC_PALETTE.gothicGold});
          animation-duration: 1.2s;
          border-width: 4px;
        `
        : `
          filter: brightness(1.2) contrast(1.1);
          border-width: 3px;
        `}

    /* 🌟 Magical Particle Effects */
    .spell-particles::before {
      content: "✨⭐💫";
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.5rem;
      ${css`
        animation: ${spellParticles} 1.2s infinite;
      `}
      z-index: 10;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      ${(props) =>
          props.$theme === "raven"
            ? "rgba(74, 20, 140, 0.1)"
            : props.$theme === "moon"
            ? "rgba(192, 192, 192, 0.1)"
            : props.$theme === "blood"
            ? "rgba(139, 0, 0, 0.1)"
            : "rgba(218, 165, 32, 0.1)"}
        0%,
      transparent 70%
    );
    ${css`
      animation: ${mistFloat} 8s ease-in-out infinite;
    `}
    pointer-events: none;
  }
`;

// 🪄 MAGICAL WAND EFFECT COMPONENTS
const WandTrail = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${GOTHIC_PALETTE.gothicGold}aa,
    transparent
  );
  z-index: 15;
  opacity: 0;
`;

const UnlockRunes = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  opacity: 0;
  z-index: 15;

  &::before {
    content: "🔮";
    display: block;
  }
`;

const SpellParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 12;

  &::before {
    content: "✨";
    position: absolute;
    top: 15%;
    left: 20%;
    font-size: 1.5rem;
    opacity: 0;
  }

  &::after {
    content: "⭐";
    position: absolute;
    bottom: 20%;
    right: 25%;
    font-size: 1.2rem;
    opacity: 0;
  }
`;

const TileIcon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
  ${css`
    animation: ${candleFlicker} 3s ease-in-out infinite;
  `}
`;

const TileTitle = styled.h3`
  font-size: 1.8rem;
  color: ${GOTHIC_PALETTE.ghostWhite};
  text-align: center;
  margin-bottom: 1rem;
  font-family: "Cinzel", serif;
`;

const TileDescription = styled.p`
  color: ${GOTHIC_PALETTE.moonSilver};
  text-align: center;
  line-height: 1.6;
  font-size: 1rem;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: linear-gradient(
    145deg,
    ${GOTHIC_PALETTE.shadowGray},
    ${GOTHIC_PALETTE.ravenBlack}
  );
  color: ${GOTHIC_PALETTE.ghostWhite};
  border: 2px solid ${GOTHIC_PALETTE.purpleVelvet};
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-family: "Cinzel", serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  z-index: 20;

  &:hover {
    background: linear-gradient(
      145deg,
      ${GOTHIC_PALETTE.purpleVelvet},
      ${GOTHIC_PALETTE.bloodRed}
    );
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(74, 20, 140, 0.4);
  }
`;

// ✨ HYPNOTIC SHADOW ARTISTRY COMPONENTS - Dynamic Elemental Gothic Swirling Mess ✨

const ShadowVortex = styled.div`
  position: absolute;
  top: 20%;
  right: 15%;
  width: 120px;
  height: 120px;
  background: conic-gradient(
    from 0deg,
    ${GOTHIC_PALETTE.purpleVelvet},
    ${GOTHIC_PALETTE.shadowGray},
    ${GOTHIC_PALETTE.bloodRed},
    ${GOTHIC_PALETTE.purpleVelvet},
    ${GOTHIC_PALETTE.purpleVelvet}
  );
  border-radius: 50%;
  animation: shadowSwirl 8s infinite linear;
  opacity: 0.7;
  mix-blend-mode: multiply;
  filter: blur(2px) contrast(1.2);
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(
      circle,
      ${GOTHIC_PALETTE.ravenBlack} 30%,
      transparent 70%
    );
    border-radius: 50%;
    animation: vortexSpin 6s infinite reverse;
  }
`;

const ElementalSwirl = styled.div`
  position: absolute;
  bottom: 25%;
  left: 10%;
  width: 200px;
  height: 60px;
  background: linear-gradient(
    90deg,
    ${GOTHIC_PALETTE.ghostWhite},
    ${GOTHIC_PALETTE.purpleVelvet},
    ${GOTHIC_PALETTE.bloodRed},
    ${GOTHIC_PALETTE.purpleVelvet}
  );
  border-radius: 30px;
  animation: elementalBlend 12s infinite ease-in-out;
  opacity: 0.6;
  mix-blend-mode: color-burn;
  filter: hue-rotate(45deg) saturate(1.3);
  transform: rotate(-15deg);
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: -10px;
    left: -20px;
    width: 240px;
    height: 80px;
    background: linear-gradient(
      -90deg,
      transparent,
      ${GOTHIC_PALETTE.shadowGray}20,
      transparent
    );
    border-radius: 40px;
    animation: elementalBlend 15s infinite reverse;
    mix-blend-mode: overlay;
  }
`;

const MorphingShadow = styled.div`
  position: absolute;
  top: 60%;
  right: 25%;
  width: 150px;
  height: 150px;
  background: radial-gradient(
    ellipse at center,
    ${GOTHIC_PALETTE.purpleVelvet}80,
    ${GOTHIC_PALETTE.shadowGray}40,
    transparent
  );
  animation: shadowMorphosis 20s infinite ease-in-out;
  mix-blend-mode: darken;
  filter: blur(3px) opacity(0.8);
  pointer-events: none;
  clip-path: polygon(
    30% 0%,
    70% 0%,
    100% 30%,
    100% 70%,
    70% 100%,
    30% 100%,
    0% 70%,
    0% 30%
  );
`;

const FloatingOrb = styled(motion.div)<{
  $isDragging?: boolean;
  $tileInteraction?: string;
}>`
  position: absolute;
  width: 50px;
  height: 50px;
  background: ${(props) =>
    props.$tileInteraction === "mystical"
      ? `conic-gradient(from 270deg, ${GOTHIC_PALETTE.purpleVelvet}, ${GOTHIC_PALETTE.purpleVelvet}, ${GOTHIC_PALETTE.deepBlack}, ${GOTHIC_PALETTE.purpleVelvet})`
      : props.$tileInteraction === "elemental"
      ? `conic-gradient(from 90deg, ${GOTHIC_PALETTE.gothicGold}, ${GOTHIC_PALETTE.bloodRed}, ${GOTHIC_PALETTE.deepBlack}, ${GOTHIC_PALETTE.gothicGold})`
      : props.$tileInteraction === "ancient"
      ? `conic-gradient(from 180deg, ${GOTHIC_PALETTE.ghostWhite}, ${GOTHIC_PALETTE.moonSilver}, ${GOTHIC_PALETTE.deepBlack}, ${GOTHIC_PALETTE.ghostWhite})`
      : `conic-gradient(
        from 180deg,
        ${GOTHIC_PALETTE.gothicGold},
        ${GOTHIC_PALETTE.ghostWhite},
        ${GOTHIC_PALETTE.purpleVelvet},
        ${GOTHIC_PALETTE.gothicGold}
      )`};
  border-radius: 50%;
  animation: ${(props) =>
    props.$isDragging
      ? "none"
      : "gentleFloat 25s infinite ease-in-out, shadowSwirl 8s infinite linear"};
  opacity: ${(props) => (props.$isDragging ? "0.85" : "0.95")};
  mix-blend-mode: ${(props) => (props.$isDragging ? "luminosity" : "screen")};
  filter: ${(props) =>
    props.$isDragging
      ? `brightness(1.8) contrast(1.5) drop-shadow(0 0 25px ${
          GOTHIC_PALETTE.gothicGold
        }) hue-rotate(${props.$tileInteraction ? "45deg" : "0deg"})`
      : `brightness(1.3) contrast(1.2) drop-shadow(0 0 15px ${GOTHIC_PALETTE.gothicGold})`};
  pointer-events: all;
  cursor: ${(props) => (props.$isDragging ? "grabbing" : "grab")};
  transition: ${(props) => (props.$isDragging ? "none" : "all 0.3s ease")};
  box-shadow: ${(props) =>
    props.$isDragging
      ? `0 0 45px ${GOTHIC_PALETTE.gothicGold}90, inset 0 0 25px ${GOTHIC_PALETTE.ghostWhite}80, 0 0 80px ${GOTHIC_PALETTE.purpleVelvet}60`
      : `0 0 25px ${GOTHIC_PALETTE.gothicGold}80, inset 0 0 15px ${GOTHIC_PALETTE.ghostWhite}60, 0 0 40px ${GOTHIC_PALETTE.purpleVelvet}40`};
  z-index: ${(props) => (props.$isDragging ? "25" : "15")};
  transform-origin: center;
  /* Performance optimization */
  will-change: ${(props) =>
    props.$isDragging ? "transform, filter, box-shadow" : "transform"};
  /* Reduce layout thrashing */
  contain: ${(props) => (props.$isDragging ? "layout style paint" : "layout")};

  /* 🌟 MYSTICAL TRAIL WHEN DRAGGING */
  &::before {
    content: ${(props) => (props.$isDragging ? '"✨"' : '"◐◑"')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${(props) => (props.$isDragging ? "20px" : "16px")};
    color: ${GOTHIC_PALETTE.ravenBlack};
    animation: ${(props) =>
      props.$isDragging
        ? "mysticalSpin 1s infinite linear"
        : "vortexSpin 12s infinite linear"};
    mix-blend-mode: difference;
    transition: all 0.3s ease;
  }

  /* 🔮 TILE INTERACTION GLOW */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${(props) =>
      props.$tileInteraction ? "120px" : props.$isDragging ? "80px" : "70px"};
    height: ${(props) =>
      props.$tileInteraction ? "120px" : props.$isDragging ? "80px" : "70px"};
    background: ${(props) =>
      props.$tileInteraction === "mystical"
        ? `radial-gradient(circle, ${GOTHIC_PALETTE.purpleVelvet}40, transparent)`
        : props.$tileInteraction === "elemental"
        ? `radial-gradient(circle, ${GOTHIC_PALETTE.bloodRed}40, transparent)`
        : props.$tileInteraction === "ancient"
        ? `radial-gradient(circle, ${GOTHIC_PALETTE.moonSilver}40, transparent)`
        : props.$isDragging
        ? `radial-gradient(circle, ${GOTHIC_PALETTE.gothicGold}30, ${GOTHIC_PALETTE.purpleVelvet}20, transparent)`
        : `radial-gradient(circle, ${GOTHIC_PALETTE.gothicGold}20, transparent)`};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
    z-index: -1;
    animation: ${(props) =>
      props.$tileInteraction
        ? "tileResonance 3s infinite ease-in-out"
        : props.$isDragging
        ? "mysticalPulse 2s infinite ease-in-out"
        : "orbPulse 4s infinite ease-in-out"};
    opacity: ${(props) =>
      props.$tileInteraction ? "0.8" : props.$isDragging ? "0.6" : "0.3"};
  }

  &:hover {
    transform: ${(props) => (props.$isDragging ? "none" : "scale(1.2)")};
    opacity: ${(props) => (props.$isDragging ? "0.85" : "1")};
    filter: ${(props) =>
      props.$isDragging
        ? `brightness(1.8) contrast(1.5) drop-shadow(0 0 25px ${
            GOTHIC_PALETTE.gothicGold
          }) hue-rotate(${props.$tileInteraction ? "45deg" : "0deg"})`
        : `brightness(1.6) contrast(1.4) drop-shadow(0 0 25px ${GOTHIC_PALETTE.gothicGold})`};
    box-shadow: ${(props) =>
      props.$isDragging
        ? `0 0 45px ${GOTHIC_PALETTE.gothicGold}90, inset 0 0 25px ${GOTHIC_PALETTE.ghostWhite}80, 0 0 80px ${GOTHIC_PALETTE.purpleVelvet}60`
        : `0 0 40px ${GOTHIC_PALETTE.gothicGold}90, inset 0 0 20px ${GOTHIC_PALETTE.ghostWhite}80, 0 0 60px ${GOTHIC_PALETTE.purpleVelvet}60`};
    animation-duration: ${(props) =>
      props.$isDragging ? "none" : "20s, 6s"}; /* Speed up on hover */
  }

  @keyframes mysticalPulse {
    0%,
    100% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  @keyframes tileResonance {
    0%,
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }
    50% {
      opacity: 0.7;
      transform: translate(-50%, -50%) scale(1.1) rotate(180deg);
    }
  }

  @keyframes mysticalSpin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

// 📜 Mystical Story Display - Positioned directly attached to orb
const OrbStoryDisplay = styled(motion.div)<{ $orbX: string; $orbY: string }>`
  position: absolute;
  top: ${(props) =>
    `calc(${props.$orbY} + 25px)`}; /* Attached to bottom of orb (orb is 50px height) */
  left: ${(props) => props.$orbX};
  transform: translateX(-50%); /* Center horizontally on orb */
  background: linear-gradient(
    145deg,
    ${GOTHIC_PALETTE.deepBlack}dd,
    ${GOTHIC_PALETTE.purpleVelvet}aa
  );
  color: ${GOTHIC_PALETTE.gothicGold};
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid ${GOTHIC_PALETTE.ghostWhite}40;
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
  max-width: 350px;
  min-width: 200px;
  z-index: 100;
  box-shadow: 0 10px 30px ${GOTHIC_PALETTE.ravenBlack}80,
    inset 0 0 20px ${GOTHIC_PALETTE.purpleVelvet}30;
  backdrop-filter: blur(10px);
  animation: gentleFloat 8s infinite ease-in-out;

  /* 📜 Remove the arrow - story is now directly attached */
  &::before {
    display: none;
  }

  /* 🔮 Mystical glow at connection point */
  &::after {
    content: "";
    position: absolute;
    top: -2px; /* Overlap with orb bottom */
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 4px;
    background: linear-gradient(
      to right,
      transparent,
      ${GOTHIC_PALETTE.gothicGold}80,
      transparent
    );
    border-radius: 2px;
    animation: mysticalPulse 2s infinite ease-in-out;
  }
`;

const MysticalRevelationDisplay = styled(motion.div)`
  position: fixed;
  top: 20%;
  right: 5%;
  max-width: 300px;
  background: linear-gradient(
    135deg,
    ${GOTHIC_PALETTE.deepBlack}95,
    ${GOTHIC_PALETTE.purpleVelvet}90
  );
  border: 2px solid ${GOTHIC_PALETTE.gothicGold}60;
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  z-index: 30;
  box-shadow: 0 0 30px ${GOTHIC_PALETTE.gothicGold}50,
    inset 0 0 20px ${GOTHIC_PALETTE.ghostWhite}20;

  h4 {
    color: ${GOTHIC_PALETTE.gothicGold};
    font-size: 1.2rem;
    margin: 0 0 10px 0;
    text-align: center;
    text-shadow: 0 0 10px ${GOTHIC_PALETTE.gothicGold}80;
  }

  p {
    color: ${GOTHIC_PALETTE.ghostWhite};
    font-size: 0.9rem;
    margin: 8px 0;
    opacity: 0.9;
    line-height: 1.4;
    animation: mysticalGlow 3s ease-in-out infinite;
  }

  @keyframes mysticalGlow {
    0%,
    100% {
      text-shadow: 0 0 5px ${GOTHIC_PALETTE.ghostWhite}50;
    }
    50% {
      text-shadow: 0 0 15px ${GOTHIC_PALETTE.gothicGold}70;
    }
  }
`;

// 🏆 SQUISHY BADGE COMPONENTS - Each uniquely modular and interactive!
const SquishyBadgeContainer = styled.div<{ $badgeType: BadgeType }>`
  position: absolute;
  top: ${(props) =>
    props.$badgeType === "error-crusher"
      ? "10px"
      : props.$badgeType === "lore-keeper"
      ? "10px"
      : props.$badgeType === "shadow-weaver"
      ? "50px"
      : props.$badgeType === "raven-whisperer"
      ? "90px"
      : "130px"};
  right: ${(props) =>
    props.$badgeType === "error-crusher"
      ? "10px"
      : props.$badgeType === "lore-keeper"
      ? "70px"
      : props.$badgeType === "shadow-weaver"
      ? "10px"
      : props.$badgeType === "raven-whisperer"
      ? "70px"
      : "10px"};
  width: 50px;
  height: 50px;
  background: linear-gradient(
    135deg,
    ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].color}ee,
    ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].color}aa
  );
  border: 3px solid
    ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].glowColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 15;
  transition: all 0.3s ease;

  /* 🗿 JAGGED ETCHING OVERLAY - Creeping Gothic Details */
  &::after {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: inherit;
    background: linear-gradient(
      45deg,
      transparent 0%,
      ${GOTHIC_PALETTE.shadowGray}40 10%,
      transparent 15%,
      ${GOTHIC_PALETTE.deepBlack}60 25%,
      transparent 35%,
      ${GOTHIC_PALETTE.shadowGray}30 45%,
      transparent 55%,
      ${GOTHIC_PALETTE.deepBlack}50 65%,
      transparent 75%,
      ${GOTHIC_PALETTE.shadowGray}20 85%,
      transparent 100%
    );
    mask: radial-gradient(circle at 15% 25%, transparent 2px, black 3px),
      radial-gradient(circle at 35% 45%, transparent 1px, black 2px),
      radial-gradient(circle at 65% 15%, transparent 2px, black 3px),
      radial-gradient(circle at 85% 75%, transparent 1px, black 2px),
      radial-gradient(circle at 25% 85%, transparent 2px, black 3px);
    mask-composite: subtract;
    opacity: 0.15;
    animation: ${jaggedEtching} 4s ease-in-out infinite alternate,
      ${etchingCreep} 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
  }

  /* Apply unique squishy animation */
  ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].squishAnimation}

  /* Unique visual personality per badge type */
  ${(props) => {
    switch (props.$badgeType) {
      case "error-crusher":
        return css`
          box-shadow: 0 0 8px ${GOTHIC_PALETTE.shadowGray}80,
            inset 0 0 6px ${GOTHIC_PALETTE.deepBlack}60;
          &::before {
            content: "💥";
            position: absolute;
            font-size: 0.8rem;
            top: -5px;
            right: -5px;
            opacity: 0.4;
          }
        `;
      case "lore-keeper":
        return css`
          box-shadow: 0 0 6px ${GOTHIC_PALETTE.stormCloud}70,
            inset 0 0 4px ${GOTHIC_PALETTE.shadowGray}50;
          border-style: dashed;
          &::before {
            content: "✨";
            position: absolute;
            font-size: 0.6rem;
            bottom: -3px;
            left: -3px;
            opacity: 0.3;
          }
        `;
      case "shadow-weaver":
        return css`
          box-shadow: 0 0 8px ${GOTHIC_PALETTE.deepBlack}90,
            inset 0 0 4px ${GOTHIC_PALETTE.shadowGray}70;
          border-style: double;
          filter: drop-shadow(0 0 4px ${GOTHIC_PALETTE.shadowGray}60);
        `;
      case "raven-whisperer":
        return css`
          box-shadow: 0 0 6px ${GOTHIC_PALETTE.ravenBlack}90,
            inset 0 0 3px ${GOTHIC_PALETTE.deepBlack}80;
          border-style: groove;
          transform: rotate(-5deg);
          &::before {
            content: "🪶";
            position: absolute;
            font-size: 0.7rem;
            top: -8px;
            left: -8px;
            opacity: 0.3;
          }
        `;
      case "code-necromancer":
        return css`
          box-shadow: 0 0 10px ${GOTHIC_PALETTE.stormCloud}80,
            inset 0 0 5px ${GOTHIC_PALETTE.deepBlack}70;
          border-style: ridge;
          border-width: 4px;
          &::before {
            content: "⚒️";
            position: absolute;
            font-size: 0.5rem;
            bottom: -6px;
            right: -6px;
            opacity: 0.4;
          }
        `;
      default:
        return css``;
    }
  }}

  &:hover {
    transform: scale(1.05)
      ${(props) =>
        props.$badgeType === "raven-whisperer"
          ? "rotate(-6deg)"
          : "rotate(1deg)"};
    filter: brightness(1.1) contrast(1.05);
    animation-duration: ${(props) =>
      props.$badgeType === "error-crusher"
        ? "1s"
        : props.$badgeType === "lore-keeper"
        ? "1.5s"
        : props.$badgeType === "shadow-weaver"
        ? "1.2s"
        : props.$badgeType === "raven-whisperer"
        ? "0.8s"
        : "2s"};

    /* Subtle hover personalities */
    ${(props) => {
      switch (props.$badgeType) {
        case "error-crusher":
          return css`
            box-shadow: 0 0 10px ${GOTHIC_PALETTE.shadowGray}90,
              inset 0 0 8px ${GOTHIC_PALETTE.deepBlack}80;
          `;
        case "lore-keeper":
          return css`
            box-shadow: 0 0 8px ${GOTHIC_PALETTE.stormCloud}90,
              inset 0 0 6px ${GOTHIC_PALETTE.shadowGray}70;
          `;
        case "shadow-weaver":
          return css`
            box-shadow: 0 0 12px ${GOTHIC_PALETTE.deepBlack}95,
              inset 0 0 8px ${GOTHIC_PALETTE.shadowGray}90;
          `;
        case "raven-whisperer":
          return css`
            box-shadow: 0 0 8px ${GOTHIC_PALETTE.ravenBlack}98,
              inset 0 0 5px ${GOTHIC_PALETTE.deepBlack}90;
          `;
        case "code-necromancer":
          return css`
            box-shadow: 0 0 14px ${GOTHIC_PALETTE.stormCloud}95,
              inset 0 0 8px ${GOTHIC_PALETTE.deepBlack}80;
          `;
        default:
          return css``;
      }
    }}
  }

  &:active {
    transform: scale(0.98)
      ${(props) =>
        props.$badgeType === "raven-whisperer"
          ? "rotate(-6deg)"
          : "rotate(-1deg)"};
    /* Subtle press feedback */
    ${css`
      animation: ${squishyBounce} 0.3s ease-out;
    `}
  }
`;

const BadgeTooltip = styled.div<{ $badgeType: BadgeType }>`
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    145deg,
    ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].color}dd,
    ${GOTHIC_PALETTE.deepBlack}cc
  );
  color: ${GOTHIC_PALETTE.ghostWhite};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: "Cinzel", serif;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 20;
  border: 1px solid
    ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].glowColor}60;
  box-shadow: 0 5px 15px ${GOTHIC_PALETTE.deepBlack}80;

  &::before {
    content: "";
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid
      ${(props) => ULTIMATE_SQUISHY_BADGES[props.$badgeType].color}dd;
  }

  ${SquishyBadgeContainer}:hover & {
    opacity: 1;
    visibility: visible;
    bottom: -70px;
  }
`;

// � Our Custom Pigeon Mascot (AI-generated art representation)
const PIGEON_MASCOT = `
   ◉  ◉
    \\/
  ╭─╮ ╭─╮
 ╱   ╲╱   ╲
╱           ╲
╲     🐦    ╱
 ╲         ╱
  ╲   ___  ╱
   ╲ (◕‿◕) ╱
    ╲     ╱
     ╰───╯
`;
const POE_QUOTES = [
  "Once upon a midnight dreary, while I pondered, weak and weary...",
  "All that we see or seem is but a dream within a dream.",
  "I became insane, with long intervals of horrible sanity.",
  "The boundaries which divide Life from Death are at best shadowy and vague.",
  "Deep into that darkness peering, long I stood there wondering, fearing...",
  "And lo! A pigeon wandered through, lost among the ravens true. ◐◑",
];

// 🌟 Hidden Orb Stories - Revealed when clicked at the right moment
const ORB_STORIES = [
  "The pigeon whispers: 'I once carried messages between the living and the dead...'",
  "◐◑ 'In my past life, I was Poe's faithful companion, watching him write by candlelight...'",
  "'They say I'm just a pigeon, but I remember when ravens ruled the sky and shadows danced...'",
  "◐◑ 'Every night at midnight, I transform back into the raven I once was...'",
  "'The golden orb you see? It's my soul, trapped between two worlds of feather and shadow...'",
  "◐◑ 'Click me again when the moon is full in your heart, and I'll tell you the secret of eternal flight...'",
];

// 🐦‍⬛ Gothic Features
interface GothicFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  theme: string;
  visualEffect: VisualEffectKey;
  badges: BadgeType[]; // Each feature can have multiple badges!
}

const GOTHIC_FEATURES: GothicFeature[] = [
  {
    id: "raven-swarm",
    icon: "🐦‍⬛",
    title: "Raven Swarm",
    description:
      "Endless flocks of ravens dancing across gothic interfaces with obsessive detail.",
    theme: "raven",
    visualEffect: "shadow-crawl", // Living shadows crawl around the border edges
    badges: ["raven-whisperer", "error-crusher"], // Perfect for obsessive perfectionists who crush bugs
  },
  {
    id: "moonlit-themes",
    icon: "🌙",
    title: "Moonlit Themes",
    description:
      "Deep purples, midnight blacks, and silver highlights for the darkest of souls.",
    theme: "moon",
    visualEffect: "spectral-shimmer", // Ghostly shimmer effect with color shifting
    badges: ["shadow-weaver", "code-necromancer"], // Artistic architects of dark beauty
  },
  {
    id: "poe-poetry",
    icon: "📜",
    title: "Poe Poetry",
    description:
      "Haunting quotes appearing as mystical UI elements throughout the experience.",
    theme: "blood",
    visualEffect: "blood-drip", // Crimson essence drips down from the top border
    badges: ["lore-keeper"], // Guardians of ancient wisdom and dark poetry
  },
  {
    id: "gothic-typography",
    icon: "✒️",
    title: "Gothic Typography",
    description:
      "Ornate, Victorian-inspired fonts that whisper tales of darkness.",
    theme: "gold",
    visualEffect: "ornate-flicker", // Border styles flicker between ornate gothic patterns
    badges: ["code-necromancer", "lore-keeper"], // Master builders and wisdom keepers
  },
  {
    id: "shadow-effects",
    icon: "🕯️",
    title: "Shadow Effects",
    description:
      "Deep shadows and mysterious glowing elements that dance with candlelight.",
    theme: "raven",
    visualEffect: "gothic-pulse", // Borders gently pulse with ethereal gothic light
    badges: ["shadow-weaver", "error-crusher"], // Mystical shadow artists and bug crushers
  },
  {
    id: "gothic-architecture",
    icon: "🏰",
    title: "Gothic Architecture",
    description:
      "Ornate borders, arched windows, and stone textures from ancient manors.",
    theme: "moon",
    visualEffect: "ornate-flicker", // Ornate architectural border patterns
    badges: ["code-necromancer", "raven-whisperer", "shadow-weaver"], // Master builders with obsessive detail
  },
];

interface PoesCornerProps {
  onBack?: () => void;
}

const PoesCorner: React.FC<PoesCornerProps> = ({ onBack }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [orbStory, setOrbStory] = useState<string | null>(null);
  const [orbClickCount, setOrbClickCount] = useState(0);
  const [currentMood, setCurrentMood] = useState<string>("shadow-effects");
  const [wandPosition, setWandPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tilesScattered, setTilesScattered] = useState(false);
  const [showSacredCone, setShowSacredCone] = useState(false);
  const [orbIsDragging, setOrbIsDragging] = useState(false);
  const [orbPosition, setOrbPosition] = useState({ x: "60%", y: "35%" });
  const [currentTileInteraction, setCurrentTileInteraction] = useState<
    string | null
  >(null);
  const [mysticalRevelations, setMysticalRevelations] = useState<string[]>([]);
  const [ravens, setRavens] = useState<
    Array<{
      id: number;
      delay: number;
      size: string;
      emoji: string;
      isSpecial: boolean;
      opacity: number;
      flightPattern: number;
      isGiant: boolean;
      duration: number;
      topPosition: string;
      specialDuration?: number;
    }>
  >([]);

  // 👻 Ghost Performance Optimization - Pre-generated static data
  const [ghosts] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() > 0.6 ? "1.8rem" : "1.4rem",
      position: {
        top: `${20 + i * 15 + Math.random() * 10}%`,
        left: `${Math.random() * 80 + 10}%`,
      },
      speed: 6 + Math.random() * 4,
    }))
  );

  // 🦇 Bat Performance Optimization - Pre-generated static data
  const [bats] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: i * 3 + Math.random() * 4,
      speed: 8 + Math.random() * 6,
      size: Math.random() > 0.7 ? "1.2rem" : "1rem",
      yPosition: `${15 + i * 8 + Math.random() * 12}%`,
    }))
  );

  // 🕷️ Spider Performance Optimization - Pre-generated static data
  const [spiders] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 2 + Math.random() * 3,
      speed: 12 + Math.random() * 8,
      size: Math.random() > 0.6 ? "1.5rem" : "1rem",
      trailColor: [
        "#00ff88",
        "#ff0088",
        "#8800ff",
        "#00ffff",
        "#ffff00",
        "#ff4400",
      ][i % 6],
      yPosition: `${10 + i * 12 + Math.random() * 10}%`,
    }))
  );

  // 🕸️ Cobweb Performance Optimization - Pre-generated static data
  const [cobwebs] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() > 0.5 ? "2rem" : "1.5rem",
      position: {
        top: `${Math.random() * 80 + 5}%`,
        left: `${Math.random() * 90 + 5}%`,
      },
      rotation: Math.random() * 360,
      intensity: Math.random() * 3,
    }))
  );

  // 🪦 Tombstone Performance Optimization - Pre-generated static data
  const [tombstones] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.random() > 0.5 ? "2.5rem" : "2rem",
      position: {
        bottom: `${Math.random() * 15 + 5}%`,
        left: `${15 + i * 12 + Math.random() * 8}%`,
      },
      tilt: Math.random() * 20 - 10,
      animationDuration: 4 + Math.random() * 6,
    }))
  );

  // 🐦‍⬛ Generate Ravens Obsessively (with occasional pigeon cameo)
  const generateRavens = useCallback(() => {
    // 20% chance for a coordinated flock behavior
    const isFlockFormation = Math.random() < 0.2;

    if (isFlockFormation) {
      // Generate a coordinated flock of 8-12 ravens
      const flockSize = 8 + Math.floor(Math.random() * 5);
      const baseDelay = Math.random() * 5;
      const flockPattern = Math.floor(Math.random() * 5); // All same pattern

      const newRavens = Array.from({ length: flockSize }, (_, i) => ({
        id: Date.now() + i,
        delay: baseDelay + i * 0.3, // Staggered slightly for flock effect
        size: "2rem", // Uniform flock size
        emoji: "🐦‍⬛",
        isSpecial: false,
        opacity: 0.8,
        flightPattern: flockPattern,
        isGiant: false,
        duration: 8 + Math.random() * 4,
        topPosition: `${Math.random() * 60 + 10}%`,
        specialDuration: undefined,
      }));

      setRavens(newRavens);
      return;
    }

    // Regular diverse raven generation (25 ravens)
    const newRavens = Array.from({ length: 25 }, (_, i) => {
      // 3% chance for a pigeon cameo among the ravens
      const isPigeonCameo = Math.random() < 0.03;

      // Different raven types with varying characteristics
      const ravenTypes = [
        { emoji: "🐦‍⬛", size: "2rem", opacity: 0.8 }, // Standard raven
        { emoji: "🦅", size: "3.5rem", opacity: 0.6 }, // Large eagle-raven
        { emoji: "🕊️", size: "1.8rem", opacity: 0.9 }, // Dark dove variant
        { emoji: "🐦", size: "1.5rem", opacity: 0.7 }, // Small corvid
        { emoji: "🦆", size: "2.2rem", opacity: 0.5 }, // Mysterious waterfowl
      ];

      const ravenType =
        ravenTypes[Math.floor(Math.random() * ravenTypes.length)];

      // Special size variations for dramatic effect
      const sizeVariations = [
        "1rem", // Tiny distant ravens
        "1.5rem", // Small ravens
        "2rem", // Medium ravens
        "2.5rem", // Large ravens
        "3rem", // Huge ravens
        "4rem", // Massive ravens
        "5rem", // Giant ravens (rare)
      ];

      const randomSize =
        sizeVariations[Math.floor(Math.random() * sizeVariations.length)];
      const finalSize = Math.random() > 0.85 ? randomSize : ravenType.size;

      return {
        id: Date.now() + i,
        delay: Math.random() * 15, // Longer delays for more spread
        size: finalSize,
        emoji: isPigeonCameo ? "◐◑" : ravenType.emoji,
        isSpecial: isPigeonCameo,
        opacity: isPigeonCameo ? 1 : ravenType.opacity,
        flightPattern: Math.floor(Math.random() * 5), // 5 different flight patterns now
        isGiant: finalSize === "5rem", // Mark giant ravens
        duration:
          finalSize === "5rem" ? 12 + Math.random() * 6 : 8 + Math.random() * 4,
        topPosition: `${Math.random() * 60 + 10}%`,
        specialDuration: isPigeonCameo ? 6 + Math.random() * 2 : undefined,
      };
    });
    setRavens(newRavens);
  }, []);

  // 📜 Cycle Poe Quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % POE_QUOTES.length);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, []);

  // 🐦‍⬛ Generate Ravens Continuously - More frequent for dramatic effect
  useEffect(() => {
    generateRavens();
    const ravenInterval = setInterval(generateRavens, 8000); // Faster regeneration for more activity

    return () => clearInterval(ravenInterval);
  }, [generateRavens]);

  // 🌫️ Handle Return to Light - Matching Back to Dashboard behavior
  const handleReturnToLight = () => {
    // Reset all gothic state with proper feedback
    console.log("🌅 Returning to the light... leaving the gothic realm behind");

    // Reset atmospheric mood to default
    setCurrentMood("shadow-effects");

    // Reset orb interactions
    setOrbStory(null);
    setOrbClickCount(0);

    // Reset hover states
    setHoveredElement(null);

    // Brief delay for state cleanup, then call the onBack prop
    setTimeout(() => {
      if (onBack) {
        onBack();
      }
    }, 200);
  };

  // � Handle Sacred Cone Crash - Gothic Typography Destruction!
  const handleConeSmash = async () => {
    console.log("� Sacred cone crash incoming! Tiles scattering...");

    // Show the sacred cone
    setShowSacredCone(true);

    // After cone appears, scatter the tiles with THUNK sound effect
    setTimeout(() => {
      // 🔊 Play the cone-thunk.mp3 sound when sacred cone hits tiles
      try {
        const audio = new Audio("/sounds/cone-thunk.mp3");
        audio.volume = 0.7; // Moderate volume for dramatic effect
        audio.play().catch((error) => {
          console.log("🔇 Audio play blocked by browser policy:", error);
        });
      } catch (error) {
        console.log("🔇 Audio loading error:", error);
      }

      setTilesScattered(true);
      console.log(
        "💥 THUNK! Tiles scattered by the sacred cone with sound effect!"
      );
    }, 400);

    // Hide particle burst after longer duration
    setTimeout(() => {
      setShowSacredCone(false);
    }, 1200);

    // Reassemble everything after the effect
    setTimeout(() => {
      setTilesScattered(false);
      console.log("🌟 Gothic tiles reassembled to original positions");
    }, 3500);
  }; // 🎯 Handle Tile Click with Gothic Typography Special Effect
  const handleTileClick = (tileId: string, event?: React.MouseEvent) => {
    if (tileId === "gothic-typography") {
      handleConeSmash();
    } else {
      // 🌫️ GOTHIC MOOD TRANSITIONS - Atmospheric Realm Transformations
      console.log(`Entering the ${tileId} realm of darkness...`);

      // Map feature IDs to mood IDs for atmospheric transitions
      const featureToMoodMap: Record<string, string> = {
        "shadow-effects": "shadow-effects",
        "gothic-architecture": "gothic-architecture",
        "raven-swarm": "raven-whispers", // Ravens bring mysterious whispers
        "moonlit-themes": "mystical-pigeon", // Moonlight brings ethereal wisdom
        "poe-poetry": "raven-whispers", // Poetry brings corvid mysteries
        "gothic-typography": "gothic-architecture", // Typography connects to cathedral solemnity
      };

      const moodId = featureToMoodMap[tileId] || "shadow-effects";

      if (GOTHIC_MOODS[moodId]) {
        console.log(`Shifting to ${GOTHIC_MOODS[moodId].name} mood...`);
        setCurrentMood(moodId);
      }
    }
  };

  // 🌟 Handle Mystical Orb Click - Stories revealed at the right moment
  const handleOrbClick = () => {
    const newClickCount = orbClickCount + 1;
    setOrbClickCount(newClickCount);

    // Show story with increasing probability based on clicks and timing
    const currentSecond = new Date().getSeconds();
    const isRightMoment =
      currentSecond % 13 === 0 || // Every 13 seconds (lucky number)
      currentSecond % 17 === 0 || // Every 17 seconds (mystical)
      newClickCount % 3 === 0; // Every 3rd click

    if (isRightMoment || newClickCount >= 5) {
      const storyIndex = Math.floor(Math.random() * ORB_STORIES.length);
      setOrbStory(ORB_STORIES[storyIndex]);

      // Clear story after 5 seconds
      setTimeout(() => {
        setOrbStory(null);
      }, 5000);

      // Reset click count after revealing story
      setOrbClickCount(0);
    }
  };

  // 🔮 Update orb position when orb element is available (for story positioning)
  useEffect(() => {
    const updateOrbPosition = () => {
      const orbElement = document.querySelector(
        '[title*="MYSTICAL PIGEON ORB"]'
      );
      const container = document.querySelector(".gothic-realm");
      if (orbElement && container) {
        const orbRect = orbElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeX =
          ((orbRect.left + orbRect.width / 2 - containerRect.left) /
            containerRect.width) *
          100;
        const relativeY =
          ((orbRect.top + orbRect.height / 2 - containerRect.top) /
            containerRect.height) *
          100;
        setOrbPosition({
          x: `${Math.max(15, Math.min(85, relativeX))}%`,
          y: `${Math.max(10, Math.min(75, relativeY))}%`,
        });
      }
    };

    // Update position when a story is shown or on initial load
    if (orbStory) {
      // Small delay to ensure DOM is updated
      setTimeout(updateOrbPosition, 100);
    }
  }, [orbStory]);

  // 🔮 ORB DRAGGING AND MYSTICAL TILE INTERACTIONS - Performance Optimized
  const dragThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const lastTileInteractionRef = useRef<string | null>(null);

  const handleOrbDragStart = useCallback(() => {
    setOrbIsDragging(true);
    setMysticalRevelations((prev) => [
      ...prev,
      "✨ The orb awakens... ancient energies stir...",
    ]);
  }, []);

  const handleOrbDragEnd = useCallback(() => {
    setOrbIsDragging(false);
    setCurrentTileInteraction(null);
    lastTileInteractionRef.current = null;

    // Clear drag throttle
    if (dragThrottleRef.current) {
      clearTimeout(dragThrottleRef.current);
      dragThrottleRef.current = null;
    }

    // Clear mystical revelations after a delay
    setTimeout(() => {
      setMysticalRevelations([]);
    }, 3000);
  }, []);

  const handleOrbDrag = useCallback(
    (event: MouseEvent, info: { point: { x: number; y: number } }) => {
      // Throttle ALL drag operations to prevent jittering
      if (dragThrottleRef.current) return;

      dragThrottleRef.current = setTimeout(() => {
        dragThrottleRef.current = null;

        // Update orb position for story positioning - simplified calculation
        const container = document.querySelector(".gothic-realm");
        if (container && info.point) {
          const containerRect = container.getBoundingClientRect();
          const relativeX =
            ((info.point.x - containerRect.left) / containerRect.width) * 100;
          const relativeY =
            ((info.point.y - containerRect.top) / containerRect.height) * 100;
          setOrbPosition({
            x: `${Math.max(15, Math.min(85, relativeX))}%`,
            y: `${Math.max(10, Math.min(75, relativeY))}%`,
          });
        }

        // Optimized collision detection with reduced DOM queries
        const { x, y } = info.point;
        const elements = document.elementsFromPoint(x, y);
        const tileElement = elements.find((el) =>
          el.getAttribute("data-tile-id")
        );

        if (tileElement) {
          const tileId = tileElement.getAttribute("data-tile-id");
          const feature = GOTHIC_FEATURES.find((f) => f.id === tileId);

          // Only update if tile interaction actually changed
          if (feature && lastTileInteractionRef.current !== feature.theme) {
            lastTileInteractionRef.current = feature.theme;
            setCurrentTileInteraction(feature.theme);

            // Batch revelation updates to reduce re-renders
            const revelation =
              feature.theme === "mystical"
                ? "🌙 The orb resonates with mystical energies... ancient secrets whisper..."
                : feature.theme === "blood"
                ? "🩸 Crimson visions flow through the orb... shadows of the past emerge..."
                : feature.theme === "gold"
                ? "✨ Golden light emanates... the orb channels divine inspiration..."
                : feature.theme === "raven"
                ? "🐦‍⬛ The raven's wisdom flows... dark knowledge unfolds..."
                : feature.theme === "moon"
                ? "🌕 Lunar energies pulse... night's mysteries reveal themselves..."
                : "🔮 The orb tingles with unknown power...";

            setMysticalRevelations((prev) => [...prev.slice(-2), revelation]);
          }
        } else if (lastTileInteractionRef.current) {
          lastTileInteractionRef.current = null;
          setCurrentTileInteraction(null);
        }
      }, 100); // Throttle to 10fps for drag detection
    },
    []
  );

  // 🪄 WAND POSITION TRACKING - Optimized with throttling to prevent excessive re-renders
  useEffect(() => {
    let wandThrottle: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (wandThrottle) return;

      wandThrottle = setTimeout(() => {
        setWandPosition({ x: e.clientX, y: e.clientY });
        wandThrottle = null;
      }, 16); // Throttle to ~60fps instead of unlimited
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (wandThrottle) clearTimeout(wandThrottle);
    };
  }, []);

  // Cleanup drag throttle on unmount
  useEffect(() => {
    return () => {
      if (dragThrottleRef.current) {
        clearTimeout(dragThrottleRef.current);
      }
    };
  }, []);

  return (
    <GothicRealm className="gothic-realm">
      {/* 🪄 WAND GLOW TRACKING SYSTEM - Optimized during orb drag */}
      <WandGlowOverlay
        $x={wandPosition.x}
        $y={wandPosition.y}
        $hoveredElement={orbIsDragging ? null : hoveredElement}
      />

      {/* 🌫️ ATMOSPHERIC MOOD SYSTEM - Dynamic Realm Transformations */}
      <AtmosphericOverlay $mood={GOTHIC_MOODS[currentMood]} />
      <DynamicMist $mood={GOTHIC_MOODS[currentMood]} />
      <TreeLine $mood={GOTHIC_MOODS[currentMood]}>
        {Array.from({ length: 8 }, (_, i) => (
          <Tree
            key={`tree-${i}`}
            $position={{
              bottom: `${Math.random() * 15 + 5}%`,
              left: `${10 + i * 11 + Math.random() * 8}%`,
            }}
            $size={Math.random() > 0.6 ? "3rem" : "2.5rem"}
          >
            🌲
          </Tree>
        ))}
      </TreeLine>

      <BackButton onClick={handleReturnToLight}>← Return to Light</BackButton>

      {/* ✨ HYPNOTIC SHADOW ARTISTRY - Dynamic Elemental Gothic Swirling Mess ✨ */}
      <ShadowVortex />
      <ElementalSwirl />
      <MorphingShadow />
      <FloatingOrb
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={false}
        onDragStart={handleOrbDragStart}
        onDragEnd={handleOrbDragEnd}
        onDrag={handleOrbDrag}
        onClick={handleOrbClick}
        initial={{ top: "35%", left: "60%" }}
        animate={{
          scale: orbIsDragging ? 1.1 : 1,
          // Disable complex animations while dragging for performance
          ...(orbIsDragging ? {} : {}),
        }}
        whileHover={{ scale: orbIsDragging ? 1.1 : 1.2 }}
        whileDrag={{
          scale: 1.15,
          rotate: 10,
          transition: { duration: 0.1 }, // Faster drag transitions
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.8,
        }}
        $isDragging={orbIsDragging}
        $tileInteraction={currentTileInteraction || undefined}
        title="🔮 MYSTICAL PIGEON ORB ◐◑ - Drag me across the tiles to unlock ancient mysteries! 🌟"
        style={{
          position: "absolute",
          top: "35%",
          left: "60%",
          // Optimize rendering performance
          willChange: orbIsDragging ? "transform" : "auto",
        }}
      />

      {/* 📜 Mystical Story Revelation - Positioned relative to orb */}
      <AnimatePresence>
        {orbStory && (
          <OrbStoryDisplay
            $orbX={orbPosition.x}
            $orbY={orbPosition.y}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {orbStory}
          </OrbStoryDisplay>
        )}
      </AnimatePresence>

      {/* 🔮 MYSTICAL ORB REVELATIONS - Ancient Secrets Unveiled */}
      <AnimatePresence>
        {mysticalRevelations.length > 0 && (
          <MysticalRevelationDisplay
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h4>🔮 Mystical Visions</h4>
            {mysticalRevelations.slice(-3).map((revelation, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.4 }}
              >
                {revelation}
              </motion.p>
            ))}
          </MysticalRevelationDisplay>
        )}
      </AnimatePresence>

      {/* 🐦‍⬛ RAVEN SWARM - Reduced during orb drag for performance */}
      {!orbIsDragging && (
        <RavenSwarm>
          {ravens.map((raven) => (
            <Raven
              key={raven.id}
              $delay={raven.delay}
              $size={raven.size}
              $isSpecial={raven.isSpecial}
              $opacity={raven.opacity}
              $flightPattern={raven.flightPattern}
              $isGiant={raven.isGiant}
              $duration={raven.duration}
              $topPosition={raven.topPosition}
              $specialDuration={raven.specialDuration}
              title={
                raven.isSpecial
                  ? "A lost pigeon among the ravens... ◐◑"
                  : raven.isGiant
                  ? `Giant ${raven.emoji} soars across the gothic realm!`
                  : `Flight Pattern ${raven.flightPattern + 1}: ${raven.emoji}`
              }
            >
              {raven.emoji}
            </Raven>
          ))}
        </RavenSwarm>
      )}

      {/* 🕷️ CRAWLING SPIDERS - Reduced during orb drag for performance */}
      {!orbIsDragging && (
        <SpiderSwarm>
          {spiders.map((spider) => (
            <CrawlingSpider
              key={`spider-${spider.id}`}
              $delay={spider.delay}
              $speed={spider.speed}
              $size={spider.size}
              $trailColor={spider.trailColor}
              $yPosition={spider.yPosition}
            />
          ))}
        </SpiderSwarm>
      )}

      {/* 🕸️ COBWEBS APLENTY - Performance Optimized */}
      <CobwebLayer>
        {cobwebs.map((cobweb) => (
          <Cobweb
            key={`cobweb-${cobweb.id}`}
            $size={cobweb.size}
            $position={cobweb.position}
            $rotation={cobweb.rotation}
            $intensity={cobweb.intensity}
          />
        ))}
      </CobwebLayer>

      {/* ⚰️ GRAVEYARD MIST LAYERS */}
      <GraveyardMist>
        <MistLayer $height="25%" $opacity={0.8} $speed={15} />
        <MistLayer $height="40%" $opacity={0.6} $speed={20} />
        <MistLayer $height="60%" $opacity={0.4} $speed={25} />
      </GraveyardMist>

      {/* 🪦 SPOOKY GRAVEYARD TOMBSTONES - Performance Optimized */}
      <GraveyardTombstones>
        {tombstones.map((tombstone) => (
          <Tombstone
            key={`tombstone-${tombstone.id}`}
            $size={tombstone.size}
            $position={tombstone.position}
            $tilt={tombstone.tilt}
            $animationDuration={tombstone.animationDuration}
            title="RIP: Another dead bug... 🪦"
          />
        ))}
      </GraveyardTombstones>

      {/* 👻 FLOATING ETHEREAL GHOSTS - Performance Optimized */}
      <GhostLayer>
        {ghosts.map((ghost) => (
          <FloatingGhost
            key={`ghost-${ghost.id}`}
            $size={ghost.size}
            $position={ghost.position}
            $speed={ghost.speed}
          />
        ))}
      </GhostLayer>

      {/* 🦇 NOCTURNAL BAT SWARM - Performance Optimized */}
      <BatSwarm>
        {bats.map((bat) => (
          <FlyingBat
            key={`bat-${bat.id}`}
            $delay={bat.delay}
            $speed={bat.speed}
            $size={bat.size}
            $yPosition={bat.yPosition}
          />
        ))}
      </BatSwarm>

      <GothicTitle>Poe&apos;s Corner</GothicTitle>

      <PoeQuote>{POE_QUOTES[currentQuote]}</PoeQuote>

      <GothicGrid>
        {GOTHIC_FEATURES.map((feature, index) => (
          <DarkTile
            key={feature.id}
            data-tile-id={feature.id}
            $theme={feature.theme}
            $visualEffect={feature.visualEffect}
            onClick={(event) => handleTileClick(feature.id, event)}
            onMouseEnter={() => setHoveredElement(feature.id)}
            onMouseLeave={() => setHoveredElement(null)}
            title={`${feature.title} - Visual Effect: ${
              VISUAL_EFFECTS[feature.visualEffect].name
            } | 🪄 Wand hover for spell effects and hidden content! | 🔮 Drag the orb here for mystical revelations!`}
            animate={
              tilesScattered
                ? {
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 600,
                    rotate: (Math.random() - 0.5) * 360,
                    scale: 0.7,
                  }
                : {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 1,
                  }
            }
            transition={{
              duration: tilesScattered ? 0.6 : 0.8,
              delay: tilesScattered ? index * 0.1 : 0,
              ease: "easeInOut",
            }}
            whileHover={tilesScattered ? undefined : "hover"}
          >
            {/* 🪄 MAGICAL WAND EFFECT LAYERS */}
            <WandTrail className="wand-trail" />
            <UnlockRunes className="unlock-runes" />
            <SpellParticles className="spell-particles" />

            {/* 🌟 HIDDEN CONTENT REVEALED BY WAND PROXIMITY */}
            <HiddenContent
              $revealed={hoveredElement === feature.id}
              $hoveredElement={hoveredElement}
            />

            <TileIcon>{feature.icon}</TileIcon>
            <TileTitle>{feature.title}</TileTitle>
            <TileDescription>{feature.description}</TileDescription>
          </DarkTile>
        ))}
      </GothicGrid>

      {/* � SACRED CONE CRASH EFFECT - Direct UI Impact with Sound */}
      <AnimatePresence>
        {showSacredCone && (
          <ConeParticleSystem $x={wandPosition.x} $y={wandPosition.y}>
            {Array.from({ length: 8 }, (_, i) => {
              // Pre-calculate positions for performance - slower, wider spread
              const baseDistance = 150;
              const randomOffset = [40, 70, 25, 100, 50, 80, 35, 90][i] || 60;
              const distance = baseDistance + randomOffset;
              const angle = (i / 8) * Math.PI * 2;
              const randomRotation =
                [15, 45, 75, 105, 135, 165, 195, 225][i] || 0;

              return (
                <ConeParticle
                  key={`cone-particle-${i}`}
                  initial={{
                    opacity: 0,
                    scale: 0.2,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: [0, 0.9, 1, 0.7, 0],
                    scale: [0.2, 0.8, 1.3, 1.0, 0.1],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotate: i * 45 + randomRotation,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: i * 0.05,
                  }}
                >
                  <img src="/cone.png" alt="Sacred Cone Particle" />
                </ConeParticle>
              );
            })}
          </ConeParticleSystem>
        )}
      </AnimatePresence>
    </GothicRealm>
  );
};

export default PoesCorner;
