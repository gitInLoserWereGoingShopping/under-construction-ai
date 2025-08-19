import React, { useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";

// Types for emotional color analysis
interface Emotion {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  gradientColors: string[];
  intensity: number;
  category: "warm" | "cool" | "neutral" | "vibrant";
  emoji: string;
}

interface ColorPalette {
  primary: string;
  light: string;
  dark: string;
  complement: string;
  analogous: string[];
  triadic: string[];
  gradient: string[];
}

interface EmotionalColorResult {
  emotion: string;
  palette: ColorPalette;
  mood: string;
  description: string;
  energyLevel: number;
  suggestions: string[];
}

// Predefined emotion mappings
const emotionDatabase: Emotion[] = [
  {
    id: "joy",
    name: "Joy",
    description: "Pure happiness and celebration",
    primaryColor: "#FFD700",
    gradientColors: ["#FFD700", "#FFA500", "#FF8C00"],
    intensity: 85,
    category: "warm",
    emoji: "😊"
  },
  {
    id: "calm",
    name: "Calm",
    description: "Peaceful tranquility and serenity",
    primaryColor: "#87CEEB",
    gradientColors: ["#87CEEB", "#98D8E8", "#B0E0E6"],
    intensity: 30,
    category: "cool",
    emoji: "😌"
  },
  {
    id: "love",
    name: "Love",
    description: "Warmth, affection, and connection",
    primaryColor: "#FF69B4",
    gradientColors: ["#FF69B4", "#FF1493", "#DC143C"],
    intensity: 90,
    category: "warm",
    emoji: "💕"
  },
  {
    id: "focus",
    name: "Focus",
    description: "Clear concentration and determination",
    primaryColor: "#4169E1",
    gradientColors: ["#4169E1", "#0000FF", "#191970"],
    intensity: 70,
    category: "cool",
    emoji: "🎯"
  },
  {
    id: "creativity",
    name: "Creativity",
    description: "Imaginative flow and artistic inspiration",
    primaryColor: "#9370DB",
    gradientColors: ["#9370DB", "#8A2BE2", "#FF00FF"],
    intensity: 75,
    category: "vibrant",
    emoji: "🎨"
  },
  {
    id: "melancholy",
    name: "Melancholy",
    description: "Gentle sadness and reflection",
    primaryColor: "#708090",
    gradientColors: ["#708090", "#2F4F4F", "#191970"],
    intensity: 40,
    category: "cool",
    emoji: "😔"
  },
  {
    id: "energy",
    name: "Energy",
    description: "Vibrant power and enthusiasm",
    primaryColor: "#FF4500",
    gradientColors: ["#FF4500", "#FF6347", "#FFD700"],
    intensity: 95,
    category: "vibrant",
    emoji: "⚡"
  },
  {
    id: "wisdom",
    name: "Wisdom",
    description: "Deep understanding and insight",
    primaryColor: "#800080",
    gradientColors: ["#800080", "#4B0082", "#2E2B5F"],
    intensity: 60,
    category: "neutral",
    emoji: "🦉"
  }
];

// Smooth animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gentlePulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.95;
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled Components
const TranslatorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 25px;
  min-height: 80vh;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 30% 20%,
      rgba(255, 182, 193, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 80%,
      rgba(173, 216, 230, 0.1) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(
    45deg,
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #96ceb4,
    #fecca7,
    #ff8a80
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 6s ease-in-out infinite;
  margin-bottom: 1rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
`;

const Subtitle = styled.p`
  color: #b8b8b8;
  font-size: 1.3rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const InputSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  z-index: 2;
`;

const EmotionInput = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: rgba(78, 205, 196, 0.6);
    box-shadow: 
      0 0 20px rgba(78, 205, 196, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
`;

const QuickEmotions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
`;

const EmotionChip = styled.button<{ $emotion: Emotion; $isSelected: boolean }>`
  background: ${props => props.$isSelected ? 
    `linear-gradient(135deg, ${props.$emotion.gradientColors.join(', ')})` :
    'rgba(255, 255, 255, 0.08)'
  };
  border: 2px solid ${props => props.$isSelected ? 
    'rgba(255, 255, 255, 0.3)' : 
    'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$isSelected ? '#000' : '#fff'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "${props => props.$emotion.emoji}";
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, ${props => props.$emotion.gradientColors.join(', ')});
    color: #000;
    border-color: rgba(255, 255, 255, 0.4);
  }

  ${props => props.$isSelected && css`
    animation: ${gentlePulse} 3s ease-in-out infinite;
  `}
`;

const AnalyzeButton = styled.button<{ $isAnalyzing: boolean }>`
  background: linear-gradient(135deg, #4ecdc4, #44a08d, #667eea);
  background-size: 200% 200%;
  border: none;
  border-radius: 50px;
  padding: 1.25rem 3rem;
  color: #000;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 2rem auto;
  display: block;
  position: relative;
  overflow: hidden;
  
  ${props => props.$isAnalyzing && css`
    animation: ${gradientShift} 2s ease-in-out infinite;
  `}

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 35px rgba(78, 205, 196, 0.4);
    background-position: 100% 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled.div`
  position: relative;
  z-index: 2;
`;

const PaletteDisplay = styled.div<{ $colors: string[] }>`
  background: linear-gradient(135deg, ${props => props.$colors.join(', ')});
  background-size: 400% 400%;
  border-radius: 20px;
  padding: 3rem;
  margin: 2rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.8s ease-out, ${gradientShift} 8s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(1px);
    border-radius: 18px;
  }
`;

const PaletteContent = styled.div`
  position: relative;
  z-index: 2;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const EmotionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
`;

const MoodDescription = styled.p`
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ColorSwatches = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const ColorSwatch = styled.div<{ $color: string; $label: string }>`
  background: ${props => props.$color};
  height: 100px;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-8px) scale(1.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &::after {
    content: "${props => props.$label}";
    position: absolute;
    bottom: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const EnergyMeter = styled.div<{ $level: number }>`
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 10px;
  margin: 1rem 0;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$level}%;
    background: linear-gradient(90deg, #4ecdc4, #44a08d, #667eea);
    border-radius: 10px;
    transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${gradientShift} 3s ease-in-out infinite;
  }
`;

const Suggestions = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SuggestionItem = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-left-color: #4ecdc4;
    transform: translateX(10px);
  }
`;

// Helper functions
const generateColorPalette = (primaryColor: string): ColorPalette => {
  // Simple color manipulation - in a real app you'd use a color library
  const lightenColor = (color: string, amount: number) => {
    return color + Math.floor(255 * amount / 100).toString(16).padStart(2, '0');
  };
  
  const darkenColor = (color: string, amount: number) => {
    // Simplified darkening
    return color.replace(/[A-F0-9]/gi, (match) => {
      const value = parseInt(match, 16);
      const darkened = Math.max(0, value - amount);
      return darkened.toString(16).toUpperCase();
    });
  };

  return {
    primary: primaryColor,
    light: lightenColor(primaryColor, 30),
    dark: darkenColor(primaryColor, 40),
    complement: primaryColor, // Simplified
    analogous: [primaryColor, lightenColor(primaryColor, 20), darkenColor(primaryColor, 20)],
    triadic: [primaryColor, lightenColor(primaryColor, 40), darkenColor(primaryColor, 30)],
    gradient: [primaryColor, lightenColor(primaryColor, 25), darkenColor(primaryColor, 15)]
  };
};

// Main Component
const EmotionalColorTranslator: React.FC = () => {
  const [input, setInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmotionalColorResult | null>(null);

  const analyzeEmotion = async () => {
    if (!input.trim() && !selectedEmotion) return;

    setIsAnalyzing(true);
    
    // Simulate analysis delay for smooth UX
    setTimeout(() => {
      let detectedEmotion: Emotion;
      
      if (selectedEmotion) {
        detectedEmotion = selectedEmotion;
      } else {
        // Simple emotion detection based on keywords
        const lowerInput = input.toLowerCase();
        detectedEmotion = emotionDatabase.find(emotion => 
          lowerInput.includes(emotion.name.toLowerCase()) ||
          lowerInput.includes(emotion.description.toLowerCase())
        ) || emotionDatabase.find(e => e.id === "calm") || emotionDatabase[0];
      }

      const palette = generateColorPalette(detectedEmotion.primaryColor);
      
      const analysis: EmotionalColorResult = {
        emotion: detectedEmotion.name,
        palette,
        mood: detectedEmotion.description,
        description: `Your emotional state resonates with ${detectedEmotion.name.toLowerCase()}, creating a beautiful harmony of ${detectedEmotion.category} tones.`,
        energyLevel: detectedEmotion.intensity,
        suggestions: [
          `Use ${detectedEmotion.name.toLowerCase()} colors in your workspace to enhance this mood`,
          `Try incorporating ${detectedEmotion.gradientColors[0]} as an accent color`,
          `Consider wearing colors in this palette to maintain emotional alignment`,
          `Use these colors in digital interfaces to create emotional resonance`
        ]
      };

      setResult(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(selectedEmotion?.id === emotion.id ? null : emotion);
    setInput(emotion.name);
  };

  const displayColors = useMemo(() => {
    if (!result) return [];
    return selectedEmotion?.gradientColors || [result.palette.primary];
  }, [result, selectedEmotion]);

  return (
    <TranslatorContainer>
      <Header>
        <Title>🎨 Emotional Color Translator</Title>
        <Subtitle>
          Transform your feelings into beautiful colors. Discover the palette that resonates with your emotional state.
        </Subtitle>
      </Header>

      <InputSection>
        <EmotionInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you're feeling... or choose from the emotions below"
        />
        
        <QuickEmotions>
          {emotionDatabase.map(emotion => (
            <EmotionChip
              key={emotion.id}
              $emotion={emotion}
              $isSelected={selectedEmotion?.id === emotion.id}
              onClick={() => handleEmotionSelect(emotion)}
            >
              {emotion.name}
            </EmotionChip>
          ))}
        </QuickEmotions>

        <AnalyzeButton
          $isAnalyzing={isAnalyzing}
          onClick={analyzeEmotion}
          disabled={isAnalyzing || (!input.trim() && !selectedEmotion)}
        >
          {isAnalyzing ? "🎨 Translating Emotions..." : "✨ Translate to Colors"}
        </AnalyzeButton>
      </InputSection>

      {result && (
        <ResultsContainer>
          <PaletteDisplay $colors={displayColors}>
            <PaletteContent>
              <EmotionTitle>{result.emotion}</EmotionTitle>
              <MoodDescription>{result.description}</MoodDescription>
              
              <div>
                <h3>Energy Level: {result.energyLevel}%</h3>
                <EnergyMeter $level={result.energyLevel} />
              </div>
            </PaletteContent>
          </PaletteDisplay>

          <ColorSwatches>
            <ColorSwatch $color={result.palette.primary} $label="Primary" />
            <ColorSwatch $color={result.palette.light} $label="Light" />
            <ColorSwatch $color={result.palette.dark} $label="Dark" />
            <ColorSwatch $color={result.palette.complement} $label="Complement" />
          </ColorSwatches>

          <Suggestions>
            <h3 style={{ color: '#4ecdc4', marginBottom: '1rem' }}>💡 Color Suggestions</h3>
            {result.suggestions.map((suggestion, index) => (
              <SuggestionItem key={index}>
                {suggestion}
              </SuggestionItem>
            ))}
          </Suggestions>
        </ResultsContainer>
      )}
    </TranslatorContainer>
  );
};

export default EmotionalColorTranslator;
