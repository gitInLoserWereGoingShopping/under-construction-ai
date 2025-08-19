import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import ImpossibleQuestionEngine from "./ImpossibleQuestionEngine";

// Types for our weird AI experiments
interface AIExperiment {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "text" | "visual" | "audio" | "data" | "chaos";
  weirdness: number; // 1-10 scale of how weird this gets
  status: "stable" | "experimental" | "chaotic" | "forbidden" | "legendary";
  component?: React.FC; // Optional dedicated component
}

interface AIAssistantProps {
  onBack?: () => void;
}

// The Collection of Weird AI Experiments
const experiments: AIExperiment[] = [
  {
    id: "dream-code",
    name: "Dream Code Generator",
    description:
      "AI writes code based on your dreams. Describe a dream, get functional code.",
    icon: "🌙",
    category: "text",
    weirdness: 7,
    status: "experimental",
  },
  {
    id: "color-emotion",
    name: "Emotional Color Translator",
    description:
      "Transform emotions into hex colors and generate mood palettes.",
    icon: "🎨",
    category: "visual",
    weirdness: 5,
    status: "stable",
  },
  {
    id: "reverse-search",
    name: "Impossible Question Engine",
    description:
      "🌟 ACTIVE: Conversational AI personalities that transform your answers into mind-bending questions. Choose your companion!",
    icon: "❓",
    category: "text",
    weirdness: 8,
    status: "chaotic",
    component: ImpossibleQuestionEngine,
  },
  {
    id: "data-poetry",
    name: "Dataset Poetry Slam",
    description: "Transforms CSV files into beautiful haikus and spoken word.",
    icon: "📊",
    category: "data",
    weirdness: 9,
    status: "experimental",
  },
  {
    id: "ai-therapy",
    name: "AI Therapist for AIs",
    description:
      "An AI that provides therapy to other AI systems. Meta-healing.",
    icon: "🤖",
    category: "text",
    weirdness: 10,
    status: "forbidden",
  },
  {
    id: "sound-taste",
    name: "Synesthetic Sound Taster",
    description:
      "Describes what colors and flavors sound like. Upload audio, get taste profiles.",
    icon: "👅",
    category: "audio",
    weirdness: 8,
    status: "experimental",
  },
  {
    id: "time-travel-chat",
    name: "Temporal Chat Room",
    description:
      "Chat with AI versions of yourself from different time periods.",
    icon: "⏰",
    category: "text",
    weirdness: 9,
    status: "chaotic",
  },
  {
    id: "chaos-oracle",
    name: "The Chaos Oracle",
    description: "Gives completely random but somehow accurate life advice.",
    icon: "🔮",
    category: "chaos",
    weirdness: 10,
    status: "forbidden",
  },
  {
    id: "victory-celebration",
    name: "🎉 Team Victory Celebration Engine",
    description:
      "A special celebration for achieving the impossible - clean builds, working code, and beautiful architecture working in harmony!",
    icon: "🏆",
    category: "chaos",
    weirdness: 11,
    status: "legendary",
  },
];

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

// Styled Components
const LabContainer = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 80vh;
  border-radius: 20px;
  padding: 2rem;
  color: #fff;
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
        circle at 20% 80%,
        rgba(120, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(255, 119, 198, 0.15) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
`;

const LabHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
`;

const LabTitle = styled.h1`
  font-size: 3rem;
  background: linear-gradient(
    45deg,
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #96ceb4,
    #fecca7
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${pulse} 3s ease-in-out infinite;
  margin-bottom: 1rem;
`;

const LabSubtitle = styled.p`
  font-size: 1.2rem;
  color: #b8b8b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const WeirdnessIndicator = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 15px;
  border: 1px solid #333;
`;

const ExperimentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const ExperimentCard = styled.div<{ $weirdness: number; $status: string }>`
  background: rgba(20, 20, 30, 0.8);
  border: 2px solid
    ${(props) =>
      props.$status === "forbidden"
        ? "#ff4757"
        : props.$status === "chaotic"
        ? "#ff6348"
        : props.$status === "experimental"
        ? "#ffa502"
        : "#2ed573"};
  border-radius: 15px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${(props) =>
    props.$weirdness > 8
      ? css`
          ${float} 3s ease-in-out infinite
        `
      : "none"};

  &:hover {
    transform: ${(props) =>
      props.$status === "forbidden"
        ? `scale(1.05) ${props.$weirdness > 9 ? "rotate(1deg)" : ""}`
        : "translateY(-10px) scale(1.02)"};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-color: ${(props) =>
      props.$status === "forbidden"
        ? "#ff3742"
        : props.$status === "chaotic"
        ? "#ff5438"
        : props.$status === "experimental"
        ? "#ff9502"
        : "#25d366"};

    ${(props) =>
      props.$status === "forbidden" &&
      css`
        animation: ${glitch} 0.3s ease-in-out;
      `}
  }

  ${(props) =>
    props.$status === "chaotic" &&
    css`
      &::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent,
          rgba(255, 99, 72, 0.1),
          transparent
        );
        animation: spin 8s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}
`;

const ExperimentIcon = styled.div<{ $weirdness: number }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: ${(props) =>
    props.$weirdness > 7
      ? css`
          ${pulse} 2s ease-in-out infinite
        `
      : "none"};
`;

const ExperimentName = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const ExperimentDescription = styled.p`
  color: #bbb;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const ExperimentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const WeirdnessMeter = styled.div<{ $level: number }>`
  display: flex;
  gap: 2px;

  span {
    width: 8px;
    height: 20px;
    background: ${(props) =>
      props.$level > 8 ? "#ff4757" : props.$level > 5 ? "#ffa502" : "#2ed573"};
    border-radius: 2px;
    opacity: ${(props) => props.$level / 10};
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) =>
    props.$status === "legendary"
      ? "linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)"
      : props.$status === "forbidden"
      ? "#ff4757"
      : props.$status === "chaotic"
      ? "#ff6348"
      : props.$status === "experimental"
      ? "#ffa502"
      : "#2ed573"};
  color: ${(props) => (props.$status === "legendary" ? "#000" : "#000")};
  box-shadow: ${(props) =>
    props.$status === "legendary" ? "0 0 10px rgba(255, 215, 0, 0.5)" : "none"};
  animation: ${(props) =>
    props.$status === "legendary" ? "pulse 2s ease-in-out infinite" : "none"};
`;

const ActiveExperiment = styled.div`
  background: rgba(10, 10, 10, 0.9);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  border: 2px solid #4ecdc4;
  position: relative;
`;

const ExperimentInterface = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputArea = styled.textarea`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 1rem;
  color: #fff;
  resize: vertical;
  min-height: 100px;
  font-family: "Courier New", monospace;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
  }
`;

const ActionButton = styled.button<{ $variant?: "primary" | "danger" }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) =>
    props.$variant === "danger"
      ? "#ff4757"
      : "linear-gradient(135deg, #4ecdc4, #45b7d1)"};
  color: #000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    background: ${(props) =>
      props.$variant === "danger"
        ? "#ff3742"
        : "linear-gradient(135deg, #45b7d1, #4ecdc4)"};
  }
`;

const OutputArea = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid #4ecdc4;
  font-family: "Courier New", monospace;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

// Main Component
const AIAssistant: React.FC<AIAssistantProps> = () => {
  const [selectedExperiment, setSelectedExperiment] =
    useState<AIExperiment | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExperimentSelect = (experiment: AIExperiment) => {
    if (experiment.status === "forbidden") {
      // Add some theatrical warning
      setOutput(
        "⚠️ WARNING: This experiment is classified as FORBIDDEN.\n\nSide effects may include: existential dread, temporal paradoxes, or accidentally creating sentient memes.\n\nProceed at your own risk..."
      );
    }
    setSelectedExperiment(experiment);
    setInput("");
  };

  const processExperiment = async () => {
    if (!selectedExperiment || !input.trim()) return;

    setIsProcessing(true);

    // Simulate processing with theatrical delay
    setTimeout(() => {
      let result = "";

      switch (selectedExperiment.id) {
        case "dream-code":
          result = `// Dream-Generated Code\n// Based on dream: "${input}"\n\nfunction dreamReality() {\n  const imagination = new Promise((resolve) => {\n    setTimeout(() => resolve("${input.slice(
            0,
            20
          )}..."), Math.random() * 3000);\n  });\n  \n  return imagination.then(dream => {\n    console.log("Dream materialized:", dream);\n    return dream.split('').reverse().join('');\n  });\n}\n\ndreamReality().then(console.log);`;
          break;

        case "color-emotion":
          const emotions = input.toLowerCase();
          const colors = emotions.includes("happy")
            ? "#FFD700"
            : emotions.includes("sad")
            ? "#4169E1"
            : emotions.includes("angry")
            ? "#DC143C"
            : emotions.includes("calm")
            ? "#20B2AA"
            : "#9370DB";
          result = `🎨 Emotional Color Analysis:\n\nInput emotion: "${input}"\nPrimary color: ${colors}\nComplementary palette:\n- Base: ${colors}\n- Light: ${colors}AA\n- Dark: ${colors}DD\n\nMood rating: ${Math.floor(
            Math.random() * 100
          )}% intensity`;
          break;

        case "reverse-search":
          result = `🤔 Impossible Questions Generated:\n\nAnswer: "${input}"\n\nPossible Questions:\n1. What would a time-traveling rubber duck ask about quantum mechanics?\n2. If ${input} was a conspiracy theory, which sandwich would debunk it?\n3. How many dimensions would it take to properly explain why ${input}?\n4. What sound does ${input} make when nobody's listening?\n5. In what universe is ${input} the secret to happiness?`;
          break;

        case "chaos-oracle":
          const predictions = [
            "The universe suggests you befriend a houseplant today.",
            "Your future contains exactly 47% more sparkles than expected.",
            "A rubber duck holds the key to your next breakthrough.",
            "The answer you seek is hidden in your browser's search history.",
            "Tomorrow, wear mismatched socks for optimal cosmic alignment.",
          ];
          result = `🔮 The Chaos Oracle Speaks:\n\n"${
            predictions[Math.floor(Math.random() * predictions.length)]
          }"\n\nChaos Level: ${Math.floor(
            Math.random() * 100
          )}%\nReliability: -∞ to ∞\nSide effects: Temporary enlightenment, random giggling`;
          break;

        case "victory-celebration":
          result = `🎉🏆 LEGENDARY ACHIEVEMENT UNLOCKED! 🏆🎉

🚀 TEAM VICTORY REPORT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ZERO compilation errors (A MIRACLE!)
✅ Clean build process (WITCHCRAFT!)
✅ Beautiful component architecture (PURE ART!)
✅ TypeScript harmony achieved (IMPOSSIBLE!)
✅ ESLint satisfaction level: 100% (LEGENDARY!)

🎊 What we've accomplished together:
• Feature dashboard system: ARCHITECTED ✨
• Reservoir Dreamscape: ENGINEERED 🌊
• AI Mad Science Lab: UNLEASHED 🧪
• Git workflow: MASTERED 🔀
• React Hook dependencies: CONQUERED 💪

🎪 Special Recognition:
"For successfully turning chaos into code, dreams into features, and compilation errors into distant memories. This team has achieved the developer equivalent of turning lead into gold."

💫 Achievement Rarity: MYTHICAL
🔥 Teamwork Level: OVER 9000
🎯 Architecture Quality: CHEF'S KISS
⚡ Problem-solving Speed: LIGHTNING

Message from the Code Universe:
"When TypeScript smiles, React dances, and ESLint purrs - you know something magical has happened. Thank you for bringing order to the beautiful chaos of creation!"

🎈 Celebration Mode: MAXIMUM
🍾 Victory Status: COMPLETE
🌟 Next Adventure: AWAITING...`;
          break;

        default:
          result = `🧪 Experiment "${selectedExperiment.name}" activated!\n\nInput: "${input}"\n\nProcessing through ${selectedExperiment.weirdness}/10 weirdness filters...\n\n✨ Result: This is where the magic would happen!\n\n(This is a demo - imagine the wildest AI processing here)`;
      }

      setOutput(result);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <LabContainer>
      <LabHeader>
        <LabTitle>🧪 AI Mad Science Lab</LabTitle>
        <LabSubtitle>
          Welcome to the playground for weird AI experiments. Where logic meets
          chaos and beautiful things happen. Pick an experiment and let&apos;s
          break some rules together.
        </LabSubtitle>
      </LabHeader>

      <WeirdnessIndicator>
        <span>Weirdness Level:</span>
        <WeirdnessMeter $level={selectedExperiment?.weirdness || 0}>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              style={{
                opacity: i < (selectedExperiment?.weirdness || 0) ? 1 : 0.2,
              }}
            />
          ))}
        </WeirdnessMeter>
      </WeirdnessIndicator>

      {!selectedExperiment ? (
        <ExperimentsGrid>
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              $weirdness={experiment.weirdness}
              $status={experiment.status}
              onClick={() => handleExperimentSelect(experiment)}
            >
              <ExperimentIcon $weirdness={experiment.weirdness}>
                {experiment.icon}
              </ExperimentIcon>
              <ExperimentName>{experiment.name}</ExperimentName>
              <ExperimentDescription>
                {experiment.description}
              </ExperimentDescription>

              <ExperimentMeta>
                <WeirdnessMeter $level={experiment.weirdness}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      style={{
                        opacity: i < experiment.weirdness ? 1 : 0.2,
                      }}
                    />
                  ))}
                </WeirdnessMeter>
                <StatusBadge $status={experiment.status}>
                  {experiment.status}
                </StatusBadge>
              </ExperimentMeta>
            </ExperimentCard>
          ))}
        </ExperimentsGrid>
      ) : (
        <ActiveExperiment>
          <h2>
            🧪 {selectedExperiment.icon} {selectedExperiment.name}
          </h2>
          <p style={{ color: "#bbb", marginBottom: "2rem" }}>
            {selectedExperiment.description}
          </p>

          {/* Check if experiment has a dedicated component */}
          {selectedExperiment.component ? (
            <div style={{ marginTop: "2rem" }}>
              <selectedExperiment.component />
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <ActionButton
                  $variant="danger"
                  onClick={() => setSelectedExperiment(null)}
                >
                  ← Back to Lab
                </ActionButton>
              </div>
            </div>
          ) : (
            <ExperimentInterface>
              <InputArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter your ${selectedExperiment.category} input for the AI to process...`}
              />

              <div style={{ display: "flex", gap: "1rem" }}>
                <ActionButton
                  onClick={processExperiment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "🧪 Processing..." : "✨ Run Experiment"}
                </ActionButton>
                <ActionButton
                  $variant="danger"
                  onClick={() => setSelectedExperiment(null)}
                >
                  ← Back to Lab
                </ActionButton>
              </div>

              {output && <OutputArea>{output}</OutputArea>}
            </ExperimentInterface>
          )}
        </ActiveExperiment>
      )}
    </LabContainer>
  );
};

export default AIAssistant;
