import styled from "styled-components";
import useMouseMovement from "@/hooks/useMouseMovement";
import getTiltTransform from "@/utils/getTiltTransform";
import { useWindowSize } from "@/hooks/useWindowSize";
// import useParallaxTilt from "../hooks/useParallaxTilt";

const Stage = styled.div`
  perspective: 1200px;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: grid;
  place-items: center;
`;

const Container = styled.div<{ transform: string }>`
  transform-style: preserve-3d;
  transform: ${({ transform }) => transform};
  transition: transform 0.1s ease;
`;

export default function ParallaxStage({
  children,
}: {
  children: React.ReactNode;
}) {
  const mouse = useMouseMovement();
  const { width, height } = useWindowSize();
  const transform = getTiltTransform(
    mouse.x,
    mouse.y,
    width,
    height,
    15 // maxTilt is 15
  );

  return (
    <Stage>
      <Container transform={transform}>{children}</Container>
    </Stage>
  );
}
