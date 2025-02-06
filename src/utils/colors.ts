export const generateColorFromId = (faceId: number): string => {
  const hue = (faceId * 50) % 360;
  return `hsl(${hue}, 80%, 50%)`;
};