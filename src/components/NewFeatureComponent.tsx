import React, { useState } from "react";
import styled from "styled-components";
import ReservoirDreamscape from "./ReservoirDreamscape";
import AIAssistant from "./AIAssistant";
import PoesCorner from "./PoesCorner";

// Types for features
interface Feature {
  id: string;
  title: string;
  description: string;
  branch: string;
  icon: string;
  status: "active" | "development" | "concept" | "implemented";
  component?: React.FC<any>; // Allow any props - components can accept onBack if they support it
}

interface NewFeatureProps {
  onBack?: () => void;
}

// Sample features data (this could eventually come from a config or API)
const featuresData: Feature[] = [
  {
    id: "reservoir-dreamscape",
    title: "Reservoir Dreamscape",
    description:
      "✅ Fully implemented petroleum engineering visualization tool!",
    branch: "reservoir-dreamscape",
    icon: "🌊",
    status: "implemented",
    component: ReservoirDreamscape,
  },
  {
    id: "job-board",
    title: "Job Board",
    description: "A revolutionary job posting and application system.",
    branch: "job-board",
    icon: "💼",
    status: "development",
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description:
      "🧪 Mad Science Lab for weird AI experiments and creative chaos!",
    branch: "ai-assistant",
    icon: "🤖",
    status: "active",
    component: AIAssistant,
  },
  {
    id: "poe-gothic-ravens",
    title: "Poe's Corner",
    description:
      "🐦‍⬛ Obsession-level gothic realm where ravens reign supreme and darkness dwells in every shadow. Nevermore shall beauty be mundane.",
    branch: "poe-gothic-ravens",
    icon: "🐦‍⬛",
    status: "active",
    component: PoesCorner,
  },
  {
    id: "data-viz",
    title: "Data Visualization",
    description: "Interactive charts and analytics dashboard.",
    branch: "data-viz",
    icon: "📊",
    status: "concept",
  },
];

// Styled Components
const DashboardWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  color: #ff7a18;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ff7a18, #ff8e2b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DashboardSubtitle = styled.p`
  color: #aaa;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureTile = styled.div<{ $status: string }>`
  background: #1a1b20;
  border: 2px solid
    ${(props) =>
      props.$status === "active"
        ? "#ff7a18"
        : props.$status === "development"
        ? "#4CAF50"
        : props.$status === "implemented"
        ? "#10B981"
        : "#666"};
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    border-color: ${(props) =>
      props.$status === "active"
        ? "#ff8e2b"
        : props.$status === "development"
        ? "#66BB6A"
        : props.$status === "implemented"
        ? "#34D399"
        : "#888"};
  }

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
      rgba(255, 122, 24, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: #fff;
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: #bbb;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const FeatureMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const BranchTag = styled.span`
  background: #333;
  color: #ff7a18;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: monospace;
`;

const StatusBadge = styled.span<{ $status: string }>`
  background: ${(props) =>
    props.$status === "active"
      ? "#ff7a18"
      : props.$status === "development"
      ? "#4CAF50"
      : props.$status === "implemented"
      ? "#10B981"
      : "#666"};
  color: ${(props) => (props.$status === "concept" ? "#fff" : "#000")};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const ActionsSection = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #333;
`;

const ActionButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 0.75rem 2rem;
  margin: 0 0.5rem;
  background: ${(props) =>
    props.$variant === "primary"
      ? "linear-gradient(135deg, #ff7a18, #ff8e2b)"
      : "transparent"};
  color: ${(props) => (props.$variant === "primary" ? "#000" : "#ff7a18")};
  border: ${(props) =>
    props.$variant === "primary" ? "none" : "2px solid #ff7a18"};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 122, 24, 0.3);
    background: ${(props) =>
      props.$variant === "primary"
        ? "linear-gradient(135deg, #ff8e2b, #ffa040)"
        : "#ff7a18"};
    color: ${(props) => (props.$variant === "primary" ? "#000" : "#000")};
  }
`;

// Main Component
export const NewFeatureComponent: React.FC<NewFeatureProps> = ({ onBack }) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    // Here you could navigate to the specific feature or load its component
    console.log(`Navigating to feature: ${feature.title} (${feature.branch})`);
  };

  const handleCreateNewFeature = () => {
    // This could open a modal or navigate to a feature creation flow
    console.log("Creating new feature...");
  };

  if (selectedFeature) {
    // If a feature is selected, render its component
    const FeatureComponent = selectedFeature.component;

    return (
      <DashboardWrapper>
        <DashboardHeader>
          <DashboardTitle>
            {selectedFeature.icon} {selectedFeature.title}
          </DashboardTitle>
          <DashboardSubtitle>
            Branch: <code>{selectedFeature.branch}</code> • Status:{" "}
            {selectedFeature.status}
          </DashboardSubtitle>
        </DashboardHeader>

        {/* Render the actual feature component */}
        {FeatureComponent ? (
          <FeatureComponent onBack={() => setSelectedFeature(null)} />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            <p>Component not yet implemented for this feature.</p>
            <p>Create the component and add it to the feature configuration.</p>
          </div>
        )}

        <ActionsSection>
          <ActionButton onClick={() => setSelectedFeature(null)}>
            ← Back to Dashboard
          </ActionButton>
          {onBack && (
            <ActionButton $variant="secondary" onClick={onBack}>
              ← Back to Construction
            </ActionButton>
          )}
        </ActionsSection>
      </DashboardWrapper>
    );
  }
  return (
    <DashboardWrapper>
      <DashboardHeader>
        <DashboardTitle>🚀 Feature Dashboard</DashboardTitle>
        <DashboardSubtitle>
          Manage and explore your AI features. Each tile represents a different
          branch/feature you can work on. Click to dive into a specific feature!
        </DashboardSubtitle>
      </DashboardHeader>

      <FeaturesGrid>
        {featuresData.map((feature) => (
          <FeatureTile
            key={feature.id}
            $status={feature.status}
            onClick={() => handleFeatureClick(feature)}
          >
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>

            <FeatureMeta>
              <BranchTag>git:{feature.branch}</BranchTag>
              <StatusBadge $status={feature.status}>
                {feature.status}
              </StatusBadge>
            </FeatureMeta>
          </FeatureTile>
        ))}
      </FeaturesGrid>

      <ActionsSection>
        <ActionButton $variant="primary" onClick={handleCreateNewFeature}>
          ✨ Create New Feature
        </ActionButton>
        {onBack && (
          <ActionButton onClick={onBack}>
            ← Back to Construction Page
          </ActionButton>
        )}
      </ActionsSection>
    </DashboardWrapper>
  );
};

export default NewFeatureComponent;
