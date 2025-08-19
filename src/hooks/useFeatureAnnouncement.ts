import { useState, useCallback } from "react";

// Types for feature announcements
export interface FeatureAnnouncement {
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

// Predefined announcement templates
export const announcementTemplates = {
  impossibleQuestionEngine: {
    id: "impossible-question-engine",
    title: "AMAZING SUCCESS!",
    subtitle: "The Impossible Question Engine is LIVE!",
    description:
      "We've successfully created a conversational AI experience that transforms answers into mind-bending questions!",
    features: [
      "5 Unique AI Personalities with distinct questioning styles",
      "Real-time conversational chat interface",
      "Dynamic question generation based on user input",
      "Personality-driven response patterns",
      "Smooth animations and typing indicators",
    ],
    techHighlights: [
      "Modular Component Architecture",
      "TypeScript with full type safety",
      "Responsive design with styled-components",
      "State management with React hooks",
      "Clean build with zero compilation errors",
    ],
    personalitiesOrComponents: [
      "🤔 Digital Socrates - Philosophical questioning",
      "😸 Cheshire Questioner - Chaotic wonderland logic",
      "⚛️ Quantum Query - Scientific analytical approach",
      "🕷️ Question Weaver - Poetic inquiry style",
      "🚀 Cosmic Curiosity - Exploratory questioning",
    ],
    experience: [
      "Choose your AI companion from 5 personalities",
      "Start with unique personality-driven greetings",
      "Share answers and receive impossible questions",
      "Build ongoing conversations with realistic timing",
      "Experience dynamic, non-static AI interactions",
    ],
    vision:
      "This perfectly embodies the concept of 'grabbing a slice of state and working on something as a new feature.' We've transformed a simple experiment into a full conversational AI playground that feels alive and dynamic.",
    celebrationLevel: "amazing" as const,
    emoji: "🤖✨",
    branch: "ai-assistant-question-engine",
    timestamp: new Date(),
  },

  featureAnnouncementModal: {
    id: "feature-announcement-modal",
    title: "LEGENDARY ACHIEVEMENT!",
    subtitle: "Dynamic Feature Celebration System is LIVE!",
    description:
      "We've created a spectacular announcement system that celebrates successful feature implementations with style!",
    features: [
      "Dynamic celebration modals with multiple styles",
      "Confetti and sparkle effects for legendary features",
      "Responsive celebration levels (success/amazing/legendary/impossible)",
      "Shimmer effects and animated backgrounds",
      "Structured feature showcase format",
    ],
    techHighlights: [
      "Reusable modal component architecture",
      "Advanced CSS animations and keyframes",
      "TypeScript interfaces for structured announcements",
      "Portal-based modal rendering",
      "Customizable celebration themes",
    ],
    personalitiesOrComponents: [
      "🎊 Confetti animation system",
      "✨ Sparkle effects for legendary achievements",
      "🌟 Shimmer text animations",
      "🎪 Multi-level celebration themes",
      "🚀 Action buttons for continued engagement",
    ],
    experience: [
      "Automatic modal triggering on feature completion",
      "Visual celebration matching achievement level",
      "Structured presentation of feature accomplishments",
      "Interactive elements to continue development",
      "Professional yet fun celebration experience",
    ],
    vision:
      "This creates a systematic way to celebrate development milestones and feature completions, turning the joy of successful compilation and feature delivery into a delightful, shareable experience.",
    celebrationLevel: "legendary" as const,
    emoji: "🎉🏆",
    branch: "new-feature-announcement",
    timestamp: new Date(),
  },
};

// Custom hook for managing feature announcements
export const useFeatureAnnouncement = () => {
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<FeatureAnnouncement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAnnouncement = useCallback((announcement: FeatureAnnouncement) => {
    setCurrentAnnouncement(announcement);
    setIsVisible(true);
  }, []);

  const showTemplateAnnouncement = useCallback(
    (templateKey: keyof typeof announcementTemplates) => {
      const template = announcementTemplates[templateKey];
      showAnnouncement(template);
    },
    [showAnnouncement]
  );

  const hideAnnouncement = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setCurrentAnnouncement(null), 300); // Wait for fade out
  }, []);

  const createCustomAnnouncement = useCallback(
    (
      title: string,
      subtitle: string,
      description: string,
      features: string[],
      techHighlights: string[],
      celebrationLevel: FeatureAnnouncement["celebrationLevel"] = "success",
      emoji: string = "🎉",
      branch: string = "main"
    ) => {
      const announcement: FeatureAnnouncement = {
        id: `custom-${Date.now()}`,
        title,
        subtitle,
        description,
        features,
        techHighlights,
        experience: [
          "Seamless user experience",
          "Intuitive interface design",
          "Responsive functionality",
          "Smooth interactions",
        ],
        vision:
          "Another step forward in building amazing user experiences and pushing the boundaries of what's possible.",
        celebrationLevel,
        emoji,
        branch,
        timestamp: new Date(),
      };

      showAnnouncement(announcement);
    },
    [showAnnouncement]
  );

  return {
    currentAnnouncement,
    isVisible,
    showAnnouncement,
    showTemplateAnnouncement,
    hideAnnouncement,
    createCustomAnnouncement,
  };
};

export default useFeatureAnnouncement;
