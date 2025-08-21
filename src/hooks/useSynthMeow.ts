import { useCallback, useRef, useState } from "react";

// 🐱 Synth Meow Audio Engine
interface MeowConfig {
  baseFreq: number;
  duration: number;
  pitchBend: number[];
  harmonic: number;
  noiseAmount: number;
  wubIntensity: number; // 0-1 for wub wub effect strength
  wubRate: number; // Hz for wobble frequency
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

interface SynthMeowHook {
  playMeow: (type: string) => void;
  playWubBass: () => void; // New function for wub bass
  startLooping: (type: string) => void;
  startDualTrackLoop: (type: string) => void; // New dual-track loop
  stopLooping: () => void;
  setHoverModulation: (zoneId: string | null) => void;
  cleanup: () => void; // New cleanup function for audio stop
  isLooping: boolean;
  isDualTrack: boolean; // New state for dual-track mode
  currentLoopType: string | null;
}

const useSynthMeow = (): SynthMeowHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wubLoopIntervalRef = useRef<NodeJS.Timeout | null>(null); // Separate interval for wub bass
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Idle timeout for auto-stop
  const [isLooping, setIsLooping] = useState(false);
  const [isDualTrack, setIsDualTrack] = useState(false); // New dual-track state
  const [currentLoopType, setCurrentLoopType] = useState<string | null>(null);
  const [hoverModulation, setHoverModulation] = useState<string | null>(null);

  // Auto-stop after inactivity (30 seconds)
  const IDLE_TIMEOUT = 30000; // 30 seconds

  // Initialize Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      // Type-safe AudioContext initialization
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  // Reset idle timer - called on any audio activity
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = setTimeout(() => {
      // Auto-stop all audio after idle timeout
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
      if (wubLoopIntervalRef.current) {
        clearInterval(wubLoopIntervalRef.current);
        wubLoopIntervalRef.current = null;
      }
      setIsLooping(false);
      setIsDualTrack(false);
      setCurrentLoopType(null);
      console.log("🔇 Audio auto-stopped after idle timeout");
    }, IDLE_TIMEOUT);
  }, [IDLE_TIMEOUT]);

  // Cleanup function - stops all audio immediately
  const cleanup = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (wubLoopIntervalRef.current) {
      clearInterval(wubLoopIntervalRef.current);
      wubLoopIntervalRef.current = null;
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }

    // Close audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsLooping(false);
    setIsDualTrack(false);
    setCurrentLoopType(null);
    setHoverModulation(null);
    console.log("🔇 All audio cleaned up");
  }, []);

  // Generate unique meow variations based on type
  const getMeowConfig = useCallback(
    (type: string): MeowConfig => {
      const randomness = () => 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
      const randomBend = () => (Math.random() - 0.5) * 0.3; // -0.15 to +0.15

      const baseConfigs = {
        "classic-meow": {
          baseFreq: 300 * randomness(),
          duration: 0.6 + Math.random() * 0.4,
          pitchBend: [
            0,
            0.2 + randomBend(),
            -0.1 + randomBend(),
            0.1 + randomBend(),
          ],
          harmonic: 2 + Math.random(),
          noiseAmount: 0.1 + Math.random() * 0.1,
          wubIntensity: 0.2 + Math.random() * 0.3, // Light wub for classic meows
          wubRate: 4 + Math.random() * 4, // 4-8 Hz wobble
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.2 },
        },
        "purr-zone": {
          baseFreq: 80 * randomness(),
          duration: 1.2 + Math.random() * 0.8,
          pitchBend: [0, randomBend() * 0.5, randomBend() * 0.3, 0],
          harmonic: 1.5 + Math.random() * 0.5,
          noiseAmount: 0.3 + Math.random() * 0.2,
          wubIntensity: 0.7 + Math.random() * 0.3, // Heavy wub for purrs!
          wubRate: 2 + Math.random() * 3, // Slower, deeper wobble 2-5 Hz
          envelope: { attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.3 },
        },
        "kitten-chirp": {
          baseFreq: 600 * randomness(),
          duration: 0.3 + Math.random() * 0.3,
          pitchBend: [
            0,
            0.5 + randomBend(),
            0.3 + randomBend(),
            0.7 + randomBend(),
          ],
          harmonic: 3 + Math.random() * 2,
          noiseAmount: 0.05 + Math.random() * 0.1,
          wubIntensity: 0.1 + Math.random() * 0.2, // Subtle wub for chirps
          wubRate: 8 + Math.random() * 6, // Faster wobble 8-14 Hz
          envelope: { attack: 0.02, decay: 0.05, sustain: 0.6, release: 0.1 },
        },
        "vocal-fry": {
          baseFreq: 150 * randomness(),
          duration: 0.8 + Math.random() * 0.4,
          pitchBend: [
            0,
            randomBend() * 0.2,
            randomBend() * 0.3,
            randomBend() * 0.1,
          ],
          harmonic: 1.2 + Math.random() * 0.8,
          noiseAmount: 0.4 + Math.random() * 0.3,
          wubIntensity: 0.4 + Math.random() * 0.4, // Medium wub for vocal fry
          wubRate: 3 + Math.random() * 4, // 3-7 Hz wobble
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.25 },
        },
        "trill-zone": {
          baseFreq: 400 * randomness(),
          duration: 0.5 + Math.random() * 0.3,
          pitchBend: [
            0,
            0.3 + randomBend(),
            -0.2 + randomBend(),
            0.4 + randomBend(),
            0.1 + randomBend(),
          ],
          harmonic: 2.5 + Math.random() * 1.5,
          noiseAmount: 0.08 + Math.random() * 0.1,
          wubIntensity: 0.3 + Math.random() * 0.4, // Variable wub for trills
          wubRate: 6 + Math.random() * 8, // Fast wobble 6-14 Hz
          envelope: { attack: 0.03, decay: 0.08, sustain: 0.8, release: 0.15 },
        },
        "dj-cat-zone": {
          baseFreq: 200 * randomness(),
          duration: 0.8 + Math.random() * 0.6,
          pitchBend: [
            0,
            0.8 + randomBend(),
            -0.4 + randomBend(),
            1.2 + randomBend(),
            0.2 + randomBend(),
          ], // Dramatic electronic drops
          harmonic: 4 + Math.random() * 3, // Rich harmonics for electronic sound
          noiseAmount: 0.2 + Math.random() * 0.2,
          wubIntensity: 0.8 + Math.random() * 0.2, // MAXIMUM WUB for DJ effects
          wubRate: 16 + Math.random() * 16, // Ultra-fast 16-32 Hz for electronic feel
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.9, release: 0.4 }, // Quick attack like electronic music
        },
      };

      let baseConfig =
        baseConfigs[type as keyof typeof baseConfigs] ||
        baseConfigs["classic-meow"];

      // 🎵 Apply hover modulation if present during looping
      if (isLooping && hoverModulation && hoverModulation !== type) {
        const hoverConfig =
          baseConfigs[hoverModulation as keyof typeof baseConfigs];
        if (hoverConfig) {
          // Blend characteristics: 70% base, 30% hover influence
          baseConfig = {
            ...baseConfig,
            baseFreq: baseConfig.baseFreq * 0.7 + hoverConfig.baseFreq * 0.3,
            harmonic: baseConfig.harmonic * 0.7 + hoverConfig.harmonic * 0.3,
            noiseAmount:
              baseConfig.noiseAmount * 0.7 + hoverConfig.noiseAmount * 0.3,
            wubIntensity:
              baseConfig.wubIntensity * 0.7 + hoverConfig.wubIntensity * 0.3,
            wubRate: baseConfig.wubRate * 0.7 + hoverConfig.wubRate * 0.3,
            pitchBend: baseConfig.pitchBend.map(
              (bend, i) => bend * 0.7 + (hoverConfig.pitchBend[i] || 0) * 0.3
            ),
            envelope: {
              attack:
                baseConfig.envelope.attack * 0.7 +
                hoverConfig.envelope.attack * 0.3,
              decay:
                baseConfig.envelope.decay * 0.7 +
                hoverConfig.envelope.decay * 0.3,
              sustain:
                baseConfig.envelope.sustain * 0.7 +
                hoverConfig.envelope.sustain * 0.3,
              release:
                baseConfig.envelope.release * 0.7 +
                hoverConfig.envelope.release * 0.3,
            },
          };
        }
      }

      return baseConfig;
    },
    [isLooping, hoverModulation]
  );

  // Synthesize a dedicated wub bass track (separate from meows)
  const synthesizeWubBass = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Deep bass oscillator for pure wub foundation
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    // Sub-bass oscillator for extra depth
    const subBassOsc = ctx.createOscillator();
    const subBassGain = ctx.createGain();

    // Heavy wub filter system
    const wubFilter = ctx.createBiquadFilter();
    const wubLFO = ctx.createOscillator();
    const wubLFOGain = ctx.createGain();

    // Bass configuration
    const bassFreq = 60; // Deep bass frequency
    const duration = 2; // Longer bass notes

    bassOsc.type = "sawtooth";
    bassOsc.frequency.value = bassFreq;

    subBassOsc.type = "sine";
    subBassOsc.frequency.value = bassFreq / 2; // Sub-bass an octave lower

    // Heavy wub filter
    wubFilter.type = "lowpass";
    wubFilter.frequency.value = bassFreq * 6;
    wubFilter.Q.value = 20; // Extra resonance for crunch

    // Fast wub LFO for electronic feel
    wubLFO.type = "sine";
    wubLFO.frequency.value = 8 + Math.random() * 8; // 8-16 Hz rapid wobble
    wubLFOGain.gain.value = bassFreq * 4; // Deep modulation

    // Connect wub modulation
    wubLFO.connect(wubLFOGain);
    wubLFOGain.connect(wubFilter.frequency);

    // Bass envelope - punchy electronic style
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Instant attack
    bassGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    bassGain.gain.setValueAtTime(0.2, now + duration * 0.8);
    bassGain.gain.linearRampToValueAtTime(0, now + duration);

    // Sub-bass envelope (softer)
    subBassGain.gain.setValueAtTime(0, now);
    subBassGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    subBassGain.gain.linearRampToValueAtTime(0.1, now + 0.15);
    subBassGain.gain.setValueAtTime(0.1, now + duration * 0.9);
    subBassGain.gain.linearRampToValueAtTime(0, now + duration);

    // Connect bass track
    bassOsc.connect(wubFilter);
    subBassOsc.connect(subBassGain);
    wubFilter.connect(bassGain);
    bassGain.connect(ctx.destination);
    subBassGain.connect(ctx.destination);

    // Start the wub bass
    bassOsc.start(now);
    subBassOsc.start(now);
    wubLFO.start(now);

    bassOsc.stop(now + duration);
    subBassOsc.stop(now + duration);
    wubLFO.stop(now + duration);
  }, [getAudioContext]);

  // Synthesize a meow sound
  const synthesizeMeow = useCallback(
    (config: MeowConfig) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Main oscillator (meow tone)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Harmonic oscillator for richness
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      // Noise for texture (especially for purrs and vocal fry)
      const bufferSize = ctx.sampleRate * config.duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);

      // Generate filtered noise
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * config.noiseAmount;
      }

      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();

      noiseSource.buffer = noiseBuffer;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = config.baseFreq * 2;
      noiseFilter.Q.value = 2;

      // Setup oscillators
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(config.baseFreq, now);

      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(
        config.baseFreq * config.harmonic,
        now
      );

      // Pitch bending for natural meow contour
      const bendDuration = config.duration / (config.pitchBend.length - 1);
      config.pitchBend.forEach((bend, index) => {
        const time = now + index * bendDuration;
        const frequency = config.baseFreq * (1 + bend);
        osc.frequency.linearRampToValueAtTime(frequency, time);
        harmonicOsc.frequency.linearRampToValueAtTime(
          frequency * config.harmonic,
          time
        );
      });

      // ADSR Envelope
      const { attack, decay, sustain, release } = config.envelope;
      const sustainTime = config.duration - attack - decay - release;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + attack);
      gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gainNode.gain.setValueAtTime(sustain, now + attack + decay + sustainTime);
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

      // Harmonic envelope (softer)
      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(0.3, now + attack);
      harmonicGain.gain.linearRampToValueAtTime(0.2, now + attack + decay);
      harmonicGain.gain.setValueAtTime(0.2, now + attack + decay + sustainTime);
      harmonicGain.gain.linearRampToValueAtTime(0, now + config.duration);

      // Noise envelope
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(
        config.noiseAmount,
        now + attack * 2
      );
      noiseGain.gain.linearRampToValueAtTime(
        config.noiseAmount * 0.7,
        now + config.duration * 0.7
      );
      noiseGain.gain.linearRampToValueAtTime(0, now + config.duration);

      // 🎵 WUB WUB DUBSTEP FILTER SYSTEM
      const wubFilter = ctx.createBiquadFilter();
      const wubGain = ctx.createGain();
      const wubLFO = ctx.createOscillator();
      const wubLFOGain = ctx.createGain();

      // Configure wobble filter
      wubFilter.type = "lowpass";
      wubFilter.frequency.value = config.baseFreq * 4; // Base cutoff frequency
      wubFilter.Q.value = 15; // High resonance for that crunchy wub sound

      // LFO (Low Frequency Oscillator) for the wobble
      wubLFO.type = "sine";
      wubLFO.frequency.value = config.wubRate; // Wobble rate in Hz

      // Scale LFO amplitude based on wub intensity
      const wubDepth = config.wubIntensity * config.baseFreq * 3;
      wubLFOGain.gain.value = wubDepth;

      // Connect LFO to filter frequency for wobble effect
      wubLFO.connect(wubLFOGain);
      wubLFOGain.connect(wubFilter.frequency);

      // Start the wobble
      wubLFO.start(now);
      wubLFO.stop(now + config.duration);

      // Connect audio graph WITH WUB FILTER
      osc.connect(wubFilter);
      harmonicOsc.connect(harmonicGain);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);

      wubFilter.connect(gainNode);
      gainNode.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);

      // Start and stop
      osc.start(now);
      harmonicOsc.start(now);
      noiseSource.start(now);

      osc.stop(now + config.duration);
      harmonicOsc.stop(now + config.duration);
      noiseSource.stop(now + config.duration);
    },
    [getAudioContext]
  );

  // Play a single meow
  const playMeow = useCallback(
    (type: string) => {
      const config = getMeowConfig(type);
      synthesizeMeow(config);
      resetIdleTimer(); // Reset idle timer on any meow play
    },
    [getMeowConfig, synthesizeMeow, resetIdleTimer]
  );

  // Play wub bass track
  const playWubBass = useCallback(() => {
    synthesizeWubBass();
    resetIdleTimer(); // Reset idle timer on wub bass play
  }, [synthesizeWubBass, resetIdleTimer]);

  // Start dual-track looping (meows + wub bass)
  const startDualTrackLoop = useCallback(
    (type: string) => {
      // Stop any existing loops
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
      if (wubLoopIntervalRef.current) {
        clearInterval(wubLoopIntervalRef.current);
      }

      setIsLooping(true);
      setIsDualTrack(true);
      setCurrentLoopType(type);
      resetIdleTimer(); // Reset idle timer when starting loop

      // Start with both tracks
      playMeow(type);
      playWubBass();

      // Set up dual-track loops with different timing
      loopIntervalRef.current = setInterval(() => {
        playMeow(type);
      }, 2000 + Math.random() * 1000); // Meows every 2-3 seconds

      wubLoopIntervalRef.current = setInterval(() => {
        playWubBass();
      }, 2500); // Wub bass every 2.5 seconds for syncopation
    },
    [playMeow, playWubBass, resetIdleTimer]
  );

  // Start single-track looping (meows only)
  const startLooping = useCallback(
    (type: string) => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
      if (wubLoopIntervalRef.current) {
        clearInterval(wubLoopIntervalRef.current);
      }

      setIsLooping(true);
      setIsDualTrack(false);
      setCurrentLoopType(type);
      resetIdleTimer(); // Reset idle timer when starting loop

      // Initial meow
      playMeow(type);

      // Set up loop with slight randomization
      loopIntervalRef.current = setInterval(() => {
        playMeow(type);
      }, 1500 + Math.random() * 1000); // 1.5-2.5 second intervals
    },
    [playMeow, resetIdleTimer]
  );

  // Stop looping
  const stopLooping = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (wubLoopIntervalRef.current) {
      clearInterval(wubLoopIntervalRef.current);
      wubLoopIntervalRef.current = null;
    }
    setIsLooping(false);
    setIsDualTrack(false);
    setCurrentLoopType(null);
  }, []);

  return {
    playMeow,
    playWubBass,
    startLooping,
    startDualTrackLoop,
    stopLooping,
    setHoverModulation,
    cleanup,
    isLooping,
    isDualTrack,
    currentLoopType,
  };
};

export default useSynthMeow;
