import React from "react";
import { FaceData, PlayerOptions, VideoState } from "../types";
import { generateColorFromId } from "../utils/colors";

interface VideoOverlayProps {
  faces: FaceData[];
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  videoState: VideoState;
  options: PlayerOptions;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  faces,
  originalWidth,
  originalHeight,
  displayWidth,
  displayHeight,
  videoState,
  options,
}) => {
  const scaleX = displayWidth / originalWidth;
  const scaleY = displayHeight / originalHeight;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
              position: "absolute",
              left: `${scaledX1}px`,
              top: `${scaledY1}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              border: `2px solid ${options.colorCodedBoxes ? generateColorFromId(face.face_id) : 'red'}`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {options.showInfoOverlay && (
      <div className="overlay-info">
        <div>{videoState.fps.toFixed(2)} FPS</div>
        <div>
          Frame: {videoState.currentFrame}{" "}
          {videoState.currentFrame > videoState.maxFrame ? (
            <span> &gt; {videoState.maxFrame}</span>
          ) : (
            ""
          )}
        </div>
        {videoState.currentFrame > videoState.maxFrame ? (
          <div className="error-text">Face data is out of bounds</div>
        ) : (
          <div>
            Faces: {faces.length} / {videoState.maxFaces}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default VideoOverlay;
