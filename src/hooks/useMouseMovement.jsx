import React from "react";

const useMouseMovement = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  //updated with a useEffect subscription to the mouse move event
  //use cleanup function to remove mouse event subscription on hook dismount
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      //retrieve client cursor position x and y
      //update mousePosition state x and y values with new client x and y
      const nextMousePosition = { x: e.clientX, y: e.clientY };
      setMousePosition(nextMousePosition);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
};

export default useMouseMovement;
