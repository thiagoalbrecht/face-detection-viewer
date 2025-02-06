import React, { useState, useCallback } from "react";
import mediaInfoFactory from "mediainfo.js";
import { ParsedFaceData, FaceData, VideoState, PlayerOptions } from "./types";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<ParsedFaceData>({});
  const [csvDataErrors, setCsvDataErrors] = useState<string[]>([]);
  const [videoState, setVideoState] = useState<VideoState>({
    currentFrame: 1,
    maxFrame: 0,
    maxFaces: 0,
    fps: 0,
  });

  // New state for VideoPlayer options
  const [videoOptions, setVideoOptions] = useState<PlayerOptions>({
    showInfoOverlay: true,
    showVideo: true,
    colorCodedBoxes: true,
  });

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const mediainfo = await mediaInfoFactory();

    try {
      const readChunk = (size: number, offset: number): Promise<Uint8Array> => {
        return new Promise<Uint8Array>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result instanceof ArrayBuffer) {
              resolve(new Uint8Array(e.target.result as ArrayBuffer));
            } else {
              reject(new Error("Failed to read chunk"));
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file.slice(offset, offset + size));
        });
      };

      const result = await mediainfo.analyzeData(() => file.size, readChunk);

      // Parse frame rate from MediaInfo
      const videoTrack = result.media?.track.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (track: any) => track["@type"] === "Video"
      );
      const fps =
        videoTrack && "FrameRate" in videoTrack && videoTrack.FrameRate
          ? parseFloat(String(videoTrack.FrameRate))
          : 0;

      setVideoState(
        (prev: VideoState): VideoState => ({
          ...prev,
          fps,
        })
      );

      const url = URL.createObjectURL(file);
      setVideoFile(url);
    } finally {
      mediainfo.close();
    }
  };

  const handleCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCsvDataErrors([]);
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const parsedData: ParsedFaceData = {};
    let maxFrame = 0;
    let maxFaceId = -1;

    lines.slice(1).forEach((line, index) => {
      if (!line.trim()) return;

      const values = line.split(",").map((v) => v.trim());
      const frame = parseInt(values[headers.indexOf("frame")]);
      const face_id = parseInt(values[headers.indexOf("face_id")]);
      const x1 = parseInt(values[headers.indexOf("x1")]);
      const y1 = parseInt(values[headers.indexOf("y1")]);
      const x2 = parseInt(values[headers.indexOf("x2")]);
      const y2 = parseInt(values[headers.indexOf("y2")]);

      // Skip if any of the required values are NaN or invalid
      if (
        isNaN(frame) ||
        isNaN(face_id) ||
        isNaN(x1) ||
        isNaN(y1) ||
        isNaN(x2) ||
        isNaN(y2)
      ) {
        setCsvDataErrors((prev) => [
          ...prev,
          `Invalid face data on line ${index + 2}: ${line}`,
        ]);
        return;
      }

      const data: FaceData = { frame, face_id, x1, y1, x2, y2 };

      maxFrame = Math.max(maxFrame, frame);
      maxFaceId = Math.max(maxFaceId, face_id);

      if (!parsedData[frame]) {
        parsedData[frame] = [];
      }
      parsedData[frame].push(data);
    });

    setCsvData(parsedData);
    setVideoState(
      (prev: VideoState): VideoState => ({
        ...prev,
        maxFrame,
        maxFaces: maxFaceId + 1,
      })
    );
  };

  const handleFrameUpdate = useCallback((frame: number) => {
    setVideoState(
      (prev: VideoState): VideoState => ({
        ...prev,
        currentFrame: frame,
      })
    );
  }, []);

  return (
    <div className="app">
      <div>
        <h1>Face Detection Viewer</h1>
      </div>

      <div className="form-controls">
        <div>
          <label>Video File: </label>
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
        </div>

        <div>
          <label>Face Detection CSV: </label>
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
        </div>

        {/* option checkboxes */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={videoOptions.showInfoOverlay}
              onChange={(e) =>
                setVideoOptions((prev) => ({
                  ...prev,
                  showInfoOverlay: e.target.checked,
                }))
              }
            />
            Show Info
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={videoOptions.showVideo}
              onChange={(e) =>
                setVideoOptions((prev) => ({
                  ...prev,
                  showVideo: e.target.checked,
                }))
              }
            />
            Show Video
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={videoOptions.colorCodedBoxes}
              onChange={(e) =>
                setVideoOptions((prev) => ({
                  ...prev,
                  colorCodedBoxes: e.target.checked,
                }))
              }
            />
            Color Coded Boxes
          </label>
        </div>
      </div>

      {videoFile && Object.keys(csvData).length > 0 && (
        <div>
          <VideoPlayer
            videoUrl={videoFile}
            faceData={csvData}
            videoState={videoState}
            options={videoOptions}
            onFrameUpdate={handleFrameUpdate}
          />
        </div>
      )}
      {csvDataErrors.length > 0 && (
        <div className="error-box">
          Your CSV file is (partially) invalid.
          <br /> <br />
          {csvDataErrors.map((error, index) => (
            <div style={{ fontWeight: "normal" }} key={index}>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
