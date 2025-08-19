import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";

// Types for feature announcements
interface FeatureAnnouncement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  techHighlights: string[];
  personalitiesOrComponents?: string[];
  experience: string[];
  vision: string;
  celebrationLevel: "success" | "amazing" | "legendary" | "impossible";
  emoji: string;
  branch: string;
  timestamp: Date;
}

interface FeatureAnnouncementModalProps {
  announcement: FeatureAnnouncement | null;
  isVisible: boolean;
  onClose: () => void;
}

// Animations
const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100vh) scale(0.3);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const confetti = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

const celebration = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 122, 24, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 122, 24, 0.8);
  }
`;

// Styled Components
const ModalOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  visibility: ${(props) => (props.$isVisible ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const ModalContainer = styled.div<{ $level: string }>`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 20px;
  padding: 3rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 3px solid
    ${(props) =>
      props.$level === "impossible"
        ? "#ff4757"
        : props.$level === "legendary"
        ? "#ffd700"
        : props.$level === "amazing"
        ? "#4ecdc4"
        : "#2ed573"};
  animation: ${modalSlideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  ${(props) =>
    props.$level === "legendary" &&
    css`
      animation: ${celebration} 2s ease-in-out infinite;
    `}

  ${(props) =>
    props.$level === "impossible" &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const ConfettiPiece = styled.div<{ $delay: number; $color: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${(props) => props.$color};
  animation: ${confetti} 3s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;
  left: ${() => Math.random() * 100}%;
  top: -10px;
`;

const SparkleEffect = styled.div<{ $delay: number }>`
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #ffd700, transparent);
  border-radius: 50%;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;
  left: ${() => Math.random() * 100}%;
  top: ${() => Math.random() * 100}%;
  pointer-events: none;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MainTitle = styled.h1<{ $level: string }>`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: ${(props) =>
    props.$level === "impossible"
      ? "linear-gradient(45deg, #ff4757, #ff6b7a, #ff4757)"
      : props.$level === "legendary"
      ? "linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)"
      : props.$level === "amazing"
      ? "linear-gradient(45deg, #4ecdc4, #44a08d, #4ecdc4)"
      : "linear-gradient(45deg, #2ed573, #1dd1a1, #2ed573)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 100%;
  animation: ${shimmer} 2s ease-in-out infinite;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Subtitle = styled.h2`
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  color: #bbb;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3<{ $icon: string }>`
  color: #4ecdc4;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "${(props) => props.$icon}";
    font-size: 1.8rem;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const FeatureItem = styled.li`
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 1rem;
  color: #fff;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ecdc4;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
  }

  &::before {
    content: "✨";
    position: absolute;
    left: -5px;
    top: -5px;
    background: #4ecdc4;
    color: #000;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
  }
`;

const VisionBox = styled.div`
  background: linear-gradient(
    135deg,
    rgba(78, 205, 196, 0.1),
    rgba(68, 160, 141, 0.1)
  );
  border: 2px solid #4ecdc4;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
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
      rgba(78, 205, 196, 0.2),
      transparent
    );
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

const VisionText = styled.p`
  color: #fff;
  font-size: 1.3rem;
  font-style: italic;
  line-height: 1.6;
  position: relative;
  z-index: 2;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
  color: #888;
  font-size: 0.9rem;
`;

const BranchTag = styled.span`
  background: #333;
  color: #4ecdc4;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-family: monospace;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const ActionButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 1rem 2rem;
  background: ${(props) =>
    props.$variant === "primary"
      ? "linear-gradient(135deg, #4ecdc4, #44a08d)"
      : "transparent"};
  color: ${(props) => (props.$variant === "primary" ? "#000" : "#4ecdc4")};
  border: ${(props) =>
    props.$variant === "primary" ? "none" : "2px solid #4ecdc4"};
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
    background: ${(props) =>
      props.$variant === "primary"
        ? "linear-gradient(135deg, #44a08d, #4ecdc4)"
        : "#4ecdc4"};
    color: #000;
  }
`;

// Main Component
const FeatureAnnouncementModal: React.FC<FeatureAnnouncementModalProps> = ({
  announcement,
  isVisible,
  onClose,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && announcement) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, announcement]);

  if (!announcement) return null;

  const confettiColors = [
    "#ff4757",
    "#ffd700",
    "#4ecdc4",
    "#2ed573",
    "#ff6b7a",
    "#44a08d",
  ];

  return (
    <ModalOverlay $isVisible={isVisible} onClick={onClose}>
      <ModalContainer
        $level={announcement.celebrationLevel}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>×</CloseButton>

        {/* Confetti Effect */}
        {showConfetti &&
          Array.from({ length: 20 }, (_, i) => (
            <ConfettiPiece
              key={i}
              $delay={i * 0.1}
              $color={confettiColors[i % confettiColors.length]}
            />
          ))}

        {/* Sparkle Effects */}
        {announcement.celebrationLevel === "legendary" &&
          Array.from({ length: 10 }, (_, i) => (
            <SparkleEffect key={i} $delay={i * 0.2} />
          ))}

        <Header>
          <MainTitle $level={announcement.celebrationLevel}>
            {announcement.emoji} {announcement.title}
          </MainTitle>
          <Subtitle>{announcement.subtitle}</Subtitle>
          <Description>{announcement.description}</Description>
        </Header>

        <Section>
          <SectionTitle $icon="🌟">What We&apos;ve Built</SectionTitle>
          <FeatureList>
            {announcement.features.map((feature, index) => (
              <FeatureItem key={index}>{feature}</FeatureItem>
            ))}
          </FeatureList>
        </Section>

        <Section>
          <SectionTitle $icon="⚡">Technical Excellence</SectionTitle>
          <FeatureList>
            {announcement.techHighlights.map((tech, index) => (
              <FeatureItem key={index}>{tech}</FeatureItem>
            ))}
          </FeatureList>
        </Section>

        {announcement.personalitiesOrComponents && (
          <Section>
            <SectionTitle $icon="🎭">Components & Personalities</SectionTitle>
            <FeatureList>
              {announcement.personalitiesOrComponents.map((item, index) => (
                <FeatureItem key={index}>{item}</FeatureItem>
              ))}
            </FeatureList>
          </Section>
        )}

        <Section>
          <SectionTitle $icon="🎪">The Experience</SectionTitle>
          <FeatureList>
            {announcement.experience.map((exp, index) => (
              <FeatureItem key={index}>{exp}</FeatureItem>
            ))}
          </FeatureList>
        </Section>

        <VisionBox>
          <VisionText>&ldquo;{announcement.vision}&rdquo;</VisionText>
        </VisionBox>

        <ActionButtons>
          <ActionButton $variant="primary" onClick={onClose}>
            🚀 Continue Building!
          </ActionButton>
          <ActionButton
            onClick={() => window.open("http://localhost:3000", "_blank")}
          >
            🌟 View Live Application
          </ActionButton>
        </ActionButtons>

        <MetaInfo>
          <BranchTag>git:{announcement.branch}</BranchTag>
          <span>
            Celebration Level: {announcement.celebrationLevel.toUpperCase()}
          </span>
          <span>{announcement.timestamp.toLocaleDateString()}</span>
        </MetaInfo>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default FeatureAnnouncementModal;
