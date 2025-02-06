import React, { useRef, useState, useEffect } from "react";
import { ParsedFaceData, PlayerOptions, VideoState } from "../types";
import VideoOverlay from "./VideoOverlay";

interface VideoPlayerProps {
  videoUrl: string;
  faceData: ParsedFaceData;
  videoState: VideoState;
  options: PlayerOptions;
  onFrameUpdate: (frame: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  faceData,
  videoState,
  options,
  onFrameUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const { videoWidth, videoHeight } = video;
      setVideoDimensions({
        width: videoWidth,
        height: videoHeight,
      });
      updateDisplayDimensions();
    };

    const updateDisplayDimensions = () => {
      if (video) {
        setDisplayDimensions({
          width: video.offsetWidth,
          height: video.offsetHeight,
        });
      }
    };

    // Handle window resize
    window.addEventListener("resize", updateDisplayDimensions);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      window.removeEventListener("resize", updateDisplayDimensions);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;
    let lastTime = 0;

    const updateFrame = () => {
      if (lastTime !== video.currentTime) {
        const currentFrame = Math.floor(video.currentTime * videoState.fps) + 1;
        onFrameUpdate(currentFrame);
        lastTime = video.currentTime;
      }
      animationFrameId = requestAnimationFrame(updateFrame);
    };

    animationFrameId = requestAnimationFrame(updateFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onFrameUpdate, videoState.fps]);

  return (
    <div
      ref={containerRef}
      className="video-container"
      style={{ position: "relative" }}
    >
      <div className="video-player" style={{ backgroundColor: "black" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nofullscreen"
          loop
          playsInline
          style={{
            display: "block",
            visibility: options.showVideo ? "visible" : "hidden",
            width: "100%",
          }}
        />
        {videoDimensions.width > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <VideoOverlay
              faces={faceData[videoState.currentFrame] || []}
              originalWidth={videoDimensions.width}
              originalHeight={videoDimensions.height}
              displayWidth={displayDimensions.width}
              displayHeight={displayDimensions.height}
              videoState={videoState}
              options={options}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
