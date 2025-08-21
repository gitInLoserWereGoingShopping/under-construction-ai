import { useState, useEffect } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface UseMousePositionOptions {
  throttleMs?: number;
  enableTouch?: boolean;
}

const useMousePosition = (options: UseMousePositionOptions = {}) => {
  const { throttleMs = 16, enableTouch = true } = options; // ~60fps default
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let throttleTimer: NodeJS.Timeout | null = null;

    const updateMousePosition = (clientX: number, clientY: number) => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        setMousePosition({ x: clientX, y: clientY });
        throttleTimer = null;
      }, throttleMs);
    };

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTracking) return;
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsTracking(true);
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsTracking(false);
    };

    // Touch events for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || !enableTouch) return;
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      if (touch) {
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!enableTouch) return;
      setIsTracking(true);
      const touch = e.touches[0];
      if (touch) {
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      if (!enableTouch) return;
      setIsTracking(false);
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    if (enableTouch) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      if (enableTouch) {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      }

      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [throttleMs, enableTouch, isTracking]);

  return {
    mousePosition,
    isTracking,
    startTracking: () => setIsTracking(true),
    stopTracking: () => setIsTracking(false),
  };
};

export default useMousePosition;
