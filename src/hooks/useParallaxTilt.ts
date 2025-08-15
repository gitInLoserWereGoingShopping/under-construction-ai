import { useState, useEffect } from "react";

// Custom hook for cursor-based tilt + depth
export default function useParallaxTilt(maxTilt = 15) {
  const [transform, setTransform] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const rotateX = (y * maxTilt).toFixed(2);
      const rotateY = (-x * maxTilt).toFixed(2);
      setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [maxTilt]);

  return { transform };
}
