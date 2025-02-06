export interface FaceData {
  frame: number;
  face_id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ParsedFaceData {
  [frame: number]: FaceData[];
}

export interface VideoState {
  currentFrame: number;
  maxFrame: number;
  maxFaces: number;
  fps: number;
}

export interface PlayerOptions {
  showInfoOverlay?: boolean;
  showVideo?: boolean;
  colorCodedBoxes?: boolean;
}