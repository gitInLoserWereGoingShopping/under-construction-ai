//cursor-based mysticism
export default function getTiltTransform(
  x: number,
  y: number,
  width: number,
  height: number,
  maxTilt: number = 15
): string {
  const offsetX = x / width - 0.5;
  const offsetY = y / height - 0.5;
  const rotateX = (offsetY * maxTilt).toFixed(2);
  const rotateY = (-offsetX * maxTilt).toFixed(2);
  return `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}
