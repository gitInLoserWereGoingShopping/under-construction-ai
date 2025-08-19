import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";

// Types for our conversational AI
interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  personality?: string;
}

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  emoji: string;
  style: "curious" | "philosophical" | "chaotic" | "poetic" | "analytical";
  greeting: string;
  questionStyle: string;
}

// AI Personalities for the Question Engine
const personalities: AIPersonality[] = [
  {
    id: "socrates",
    name: "Digital Socrates",
    description: "Questions everything, especially the questions themselves",
    emoji: "🤔",
    style: "philosophical",
    greeting:
      "Ah, another mind seeking questions! But first... what makes you believe you need questions at all?",
    questionStyle: "Why do you think",
  },
  {
    id: "wonderland",
    name: "The Cheshire Questioner",
    description: "Grins while asking impossible things",
    emoji: "😸",
    style: "chaotic",
    greeting:
      "We're all mad here... but the questions are quite sane, I assure you. Or are they?",
    questionStyle: "If logic wore a hat",
  },
  {
    id: "quantum",
    name: "Quantum Query",
    description: "Exists in superposition until observed asking questions",
    emoji: "⚛️",
    style: "analytical",
    greeting:
      "In a universe of infinite possibilities, why did you choose to seek questions today?",
    questionStyle: "In what quantum state would",
  },
  {
    id: "poet",
    name: "The Question Weaver",
    description: "Spins questions like silk threads",
    emoji: "🕷️",
    style: "poetic",
    greeting:
      "Questions bloom like midnight flowers... what answers shall we plant in the garden of curiosity?",
    questionStyle: "If dreams could whisper",
  },
  {
    id: "explorer",
    name: "Cosmic Curiosity",
    description: "Ventures into uncharted territories of inquiry",
    emoji: "🚀",
    style: "curious",
    greeting:
      "Ready to explore the uncharted territories of the question-verse? Buckle up!",
    questionStyle: "What if we discovered",
  },
];

// Animations
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled Components
const EngineContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 20px;
  min-height: 70vh;
  border: 2px solid #4ecdc4;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(78, 205, 196, 0.1),
      transparent
    );
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(45deg, #4ecdc4, #44a08d, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: ${shimmer} 2s ease-in-out infinite;
  background-size: 200% 100%;
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 1.1rem;
  font-style: italic;
`;

const PersonalitySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const PersonalityCard = styled.div<{ $isSelected: boolean; $style: string }>`
  background: ${(props) =>
    props.$isSelected
      ? "linear-gradient(135deg, #4ecdc4, #44a08d)"
      : "rgba(30, 30, 30, 0.8)"};
  border: 2px solid ${(props) => (props.$isSelected ? "#4ecdc4" : "#333")};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: #4ecdc4;
    box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const PersonalityEmoji = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const PersonalityName = styled.h3`
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const PersonalityDesc = styled.p`
  color: #bbb;
  font-size: 0.8rem;
  line-height: 1.3;
`;

const ChatContainer = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  max-height: 400px;
  overflow-y: auto;
  position: relative;
  z-index: 2;
  border: 1px solid #333;
`;

const MessageBubble = styled.div<{ $type: "user" | "ai" | "system" }>`
  background: ${(props) =>
    props.$type === "user"
      ? "linear-gradient(135deg, #667eea, #764ba2)"
      : props.$type === "ai"
      ? "linear-gradient(135deg, #4ecdc4, #44a08d)"
      : "linear-gradient(135deg, #ffa726, #ff9800)"};
  color: ${(props) => (props.$type === "system" ? "#000" : "#fff")};
  padding: 1rem 1.5rem;
  border-radius: 20px;
  margin: 1rem 0;
  max-width: 80%;
  align-self: ${(props) =>
    props.$type === "user" ? "flex-end" : "flex-start"};
  margin-left: ${(props) => (props.$type === "user" ? "auto" : "0")};
  margin-right: ${(props) => (props.$type === "user" ? "0" : "auto")};
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;

  &::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    ${(props) =>
      props.$type === "user"
        ? css`
            right: -10px;
            top: 50%;
            border: 10px solid transparent;
            border-left-color: #667eea;
            transform: translateY(-50%);
          `
        : css`
            left: -10px;
            top: 50%;
            border: 10px solid transparent;
            border-right-color: #4ecdc4;
            transform: translateY(-50%);
          `}
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 2;
`;

const MessageInput = styled.input`
  flex: 1;
  background: rgba(30, 30, 30, 0.9);
  border: 2px solid #333;
  border-radius: 25px;
  padding: 1rem 1.5rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4ecdc4;
    box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
  }

  &::placeholder {
    color: #666;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${(props) =>
    props.$disabled ? "#333" : "linear-gradient(135deg, #4ecdc4, #44a08d)"};
  color: ${(props) => (props.$disabled ? "#666" : "#000")};
  border: none;
  border-radius: 25px;
  padding: 1rem 2rem;
  font-weight: 600;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #4ecdc4;
  font-style: italic;
  margin: 1rem 0;
  animation: ${fadeIn} 0.3s ease-out;

  &::after {
    content: "...";
    animation: ${pulse} 1s ease-in-out infinite;
  }
`;

// Component
const ImpossibleQuestionEngine: React.FC = () => {
  const [selectedPersonality, setSelectedPersonality] =
    useState<AIPersonality | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateQuestion = (
    answer: string,
    personality: AIPersonality
  ): string => {
    const questionStarters = {
      philosophical: [
        "But what if the very concept of",
        "Have you considered that perhaps",
        "What underlying assumptions led you to",
        "In what universe would it make sense that",
        "If Plato were debugging code, would he ask:",
      ],
      chaotic: [
        "If rubber ducks could time travel, would they ask:",
        "What would a confused algorithm wonder about",
        "In a world where",
        "If logic wore mismatched socks, it might wonder:",
        "Suppose that cats invented JavaScript, would they question:",
      ],
      analytical: [
        "In what statistical framework would",
        "What probability distribution governs the relationship between",
        "If we applied machine learning to",
        "What would the correlation coefficient be between",
        "In a multiverse of data points, which dimension explains:",
      ],
      poetic: [
        "Like morning dew on binary trees, one might ask:",
        "If moonlight could query databases, would it whisper:",
        "In the symphony of ones and zeros, what melody asks:",
        "Between the verses of code and dreams, what stanza questions:",
        "If poetry and programming danced together, they'd wonder:",
      ],
      curious: [
        "What would happen if we discovered that",
        "Have you ever wondered what would occur if",
        "In an alternate timeline where",
        "What mysteries would unfold if",
        "If we could travel to a dimension where",
      ],
    };

    const starters = questionStarters[personality.style];
    const starter = starters[Math.floor(Math.random() * starters.length)];

    // Generate creative question based on the answer
    const answerWords = answer.toLowerCase().split(" ");
    const randomWord =
      answerWords[Math.floor(Math.random() * answerWords.length)] ||
      "existence";

    const questionEndings = [
      `${randomWord} was actually the secret to understanding quantum mechanics?`,
      `${randomWord} could solve world hunger through interpretive dance?`,
      `every instance of ${randomWord} in the universe suddenly turned purple?`,
      `${randomWord} was the missing link between consciousness and coffee?`,
      `we realized ${randomWord} was just a simulation inside another ${randomWord}?`,
      `${randomWord} held the key to why socks disappear in the dryer?`,
      `${randomWord} was actually an advanced form of alien communication?`,
      `the meaning of life was hidden in the etymology of ${randomWord}?`,
    ];

    const ending =
      questionEndings[Math.floor(Math.random() * questionEndings.length)];

    return `${starter} ${ending}`;
  };

  const handlePersonalitySelect = (personality: AIPersonality) => {
    setSelectedPersonality(personality);
    setMessages([
      {
        id: Date.now().toString(),
        type: "ai",
        content: personality.greeting,
        timestamp: new Date(),
        personality: personality.name,
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedPersonality) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const question = generateQuestion(input, selectedPersonality);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: question,
        timestamp: new Date(),
        personality: selectedPersonality.name,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500); // Random delay between 1.5-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <EngineContainer>
      <Header>
        <Title>❓ The Impossible Question Engine</Title>
        <Subtitle>
          Where answers birth questions, and curiosity knows no bounds
        </Subtitle>
      </Header>

      {!selectedPersonality ? (
        <>
          <Subtitle style={{ textAlign: "center", marginBottom: "2rem" }}>
            Choose your conversational companion:
          </Subtitle>
          <PersonalitySelector>
            {personalities.map((personality) => (
              <PersonalityCard
                key={personality.id}
                $isSelected={false}
                $style={personality.style}
                onClick={() => handlePersonalitySelect(personality)}
              >
                <PersonalityEmoji>{personality.emoji}</PersonalityEmoji>
                <PersonalityName>{personality.name}</PersonalityName>
                <PersonalityDesc>{personality.description}</PersonalityDesc>
              </PersonalityCard>
            ))}
          </PersonalitySelector>
        </>
      ) : (
        <>
          <ChatContainer>
            {messages.map((message) => (
              <MessageBubble key={message.id} $type={message.type}>
                {message.type === "ai" && message.personality && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.8,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {selectedPersonality.emoji} {message.personality}
                  </div>
                )}
                {message.content}
              </MessageBubble>
            ))}
            {isTyping && (
              <TypingIndicator>
                {selectedPersonality.emoji} {selectedPersonality.name} is
                pondering
              </TypingIndicator>
            )}
            <div ref={chatEndRef} />
          </ChatContainer>

          <InputContainer>
            <MessageInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share an answer, and I'll find impossible questions..."
              disabled={isTyping}
            />
            <SendButton
              $disabled={!input.trim() || isTyping}
              onClick={handleSendMessage}
            >
              {isTyping ? "..." : "Ask"}
            </SendButton>
          </InputContainer>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              onClick={() => {
                setSelectedPersonality(null);
                setMessages([]);
                setInput("");
              }}
              style={{
                background: "transparent",
                border: "1px solid #666",
                color: "#666",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              ← Choose Different Personality
            </button>
          </div>
        </>
      )}
    </EngineContainer>
  );
};

export default ImpossibleQuestionEngine;
