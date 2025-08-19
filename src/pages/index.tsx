import { useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import Image from "next/image";
import { NewFeatureComponent } from "../components/NewFeatureComponent";

/* 🧠 Utility: Generate Today’s Cone Code */
function getCode() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const full = `undercone-${today}`;
  let hash = 0;
  for (let i = 0; i < full.length; i++) {
    hash = (hash << 5) - hash + full.charCodeAt(i);
    hash |= 0;
  }
  return `CONE-${today}-${Math.abs(hash)
    .toString(36)
    .slice(0, 6)
    .toUpperCase()}`;
}

/* 💥 Sassy Cone Wisdom */
const wisdom = [
  "Incorrect. The cone has rejected your vibes.",
  "Safety tip: try again, emotionally grounded this time.",
  "That code belongs to a different multiverse.",
  "Cone says: 'mm-mm, no.'",
  "Try again, but with less chaos in your soul.",
  "Close, but no hard hat.",
  "Is this code from yesterday? That’s so retro.",
  "Honk once for emotional clarity. Twice for retry.",
];

/* 🎶 Play SFX (must be in /public/sounds) */
function playSound(path: string) {
  if (typeof window !== "undefined") {
    const sfx = new Audio(path);
    sfx.play().catch(() => {});
  }
}

/* 💅 Animations */
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-4px); }
`;

const slap = keyframes`
  0%   { transform: translate(-100vw, -50vh) rotate(0deg); opacity: 0; }
  40%  { transform: translate(-10vw, -10vh) rotate(60deg); opacity: 1; }
  60%  { transform: translate(0, 0) rotate(90deg); opacity: 1; }
  100% { transform: translate(80vw, -20vh) rotate(180deg); opacity: 0; }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* 🧱 Styled Components */
const Page = styled.main`
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: #101114;
  color: #fff;
`;

const Card = styled.div`
  width: min(600px, 90vw);
  padding: 2rem;
  background: #1a1b20;
  border: 2px dashed #333;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StyledForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Input = styled.input<{ $shake: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ff7a18;
  background: #0f1013;
  color: #eaeaea;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 0 0px rgba(255, 122, 24, 0);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  ${({ $shake }) =>
    $shake &&
    css`
      animation: ${shake} 0.4s ease;
    `}

  &:focus {
    border-color: #ff7a18;
    box-shadow: 0 0 0 3px rgba(255, 122, 24, 0.35);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  background: linear-gradient(180deg, #ff8e2b, #ff7a18);
  color: #0b0c0f;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.06s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 122, 24, 0.25);

  &:hover {
    box-shadow: 0 6px 18px rgba(255, 122, 24, 0.35);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Cone = styled.div`
  position: absolute;
  top: 20%;
  left: 40%;
  width: 80px;
  z-index: 100;
  animation: ${slap} 2s ease forwards;
`;

const Message = styled.div`
  margin-top: 1rem;
  min-height: 2rem;
  font-style: italic;
  opacity: 0.9;
`;

const Hint = styled.div`
  margin-top: 1rem;
  font-size: 0.85rem;
  opacity: 0.6;
  user-select: text;

  code {
    background: #222;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
  }
`;

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

/* 🚧 THE MAIN PAGE */
export default function Home() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [slap, setSlap] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctCode = getCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code.trim() === correctCode) {
      setMessage("✅ Access granted. Loading feature dashboard...");
      // Transition to the dashboard after a short delay
      setTimeout(() => {
        setAccessGranted(true);
      }, 1500);
    } else {
      const sass = wisdom[Math.floor(Math.random() * wisdom.length)];
      setMessage(sass);
      setShake(true);
      setSlap(true);
      playSound("/sounds/cone-thunk.mp3");

      setTimeout(() => setShake(false), 500);
      setTimeout(() => setSlap(false), 2000);
      inputRef.current?.focus();
    }
  };

  const handleBackToConstruction = () => {
    // Reset all state with flair
    setAccessGranted(false);
    setCode("");
    setMessage("🔄 Returning to construction zone...");
    setShake(false);
    setSlap(false);
    
    // Clear the message after a brief moment and focus input
    setTimeout(() => {
      setMessage("");
      inputRef.current?.focus();
    }, 800);
  };

  return (
    <Page>
      {accessGranted ? (
        // Feature Dashboard - shows all available features as tiles
        <DashboardContainer>
          <NewFeatureComponent onBack={handleBackToConstruction} />
        </DashboardContainer>
      ) : (
        // Construction Page - the daily code entry
        <Card>
          <Title>🚧 Under Construction AI</Title>
          <p>Enter the daily code or be corrected by a sacred cone.</p>

          <StyledForm onSubmit={handleSubmit}>
            <Input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CONE-YYYYMMDD-ABC123"
              $shake={shake}
            />
            <Button type="submit">Submit</Button>
          </StyledForm>

          <Message>{message}</Message>

          <Hint>
            For demo/testing: today's code is <code>{correctCode}</code>
          </Hint>

          {slap && (
            <Cone>
              <Image
                src="/cone.png"
                width={80}
                height={80}
                alt="Cone Slap"
                priority
              />
            </Cone>
          )}
        </Card>
      )}
    </Page>
  );
}
