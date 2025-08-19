import React from "react";
import styled from "styled-components";
import UnderConstructionAI from "./UnderConstructionAI";

// Styled components for your new feature
const FeatureWrapper = styled.div`
  padding: 0.5rem;
  text-align: center;
`;

const FeatureTitle = styled.h2`
  color: #ff7a18;
  margin-bottom: 1rem;
`;

const FeatureContent = styled.div`
  color: #eaeaea;
  line-height: 1.6;
`;

// Interface for component props (if needed)
interface NewFeatureProps {
  // Add your prop types here
  // example: userId?: string;
  // example: onAction?: () => void;
}

// Your new feature component
export const JobBoard: React.FC<NewFeatureProps> = (props) => {
  return (
    <FeatureWrapper>
      <FeatureTitle>🚀 Job Board</FeatureTitle>
      <FeatureContent>
        <UnderConstructionAI />
      </FeatureContent>
    </FeatureWrapper>
  );
};

export default JobBoard;
