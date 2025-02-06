import React from 'react';
import { FaceData } from '../types';
import { generateColorFromId } from '../utils/colors';

interface VideoOverlayProps {
  faces: FaceData[];
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  currentFrame: number;
  maxFaces: number;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  faces,
  originalWidth,
  originalHeight,
  displayWidth,
  displayHeight,
  currentFrame,
  maxFaces,
}) => {
  const scaleX = displayWidth / originalWidth;
  const scaleY = displayHeight / originalHeight;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {faces.map((face, index) => {
        // Scale the coordinates
        const scaledX1 = face.x1 * scaleX;
        const scaledY1 = face.y1 * scaleY;
        const scaledWidth = (face.x2 - face.x1) * scaleX;
        const scaledHeight = (face.y2 - face.y1) * scaleY;

        return (
          <div
            key={`${face.face_id}-${index}`}
            style={{
              position: 'absolute',
              left: `${scaledX1}px`,
              top: `${scaledY1}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              border: `2px solid ${generateColorFromId(face.face_id)}`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
      
      {/* Overlay information */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px' }}>
        <div>Frame: {currentFrame}</div>
        <div>Faces: {faces.length} / {maxFaces}</div>
      </div>
    </div>
  );
};

export default VideoOverlay;