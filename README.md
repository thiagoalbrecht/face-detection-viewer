# Face Detection Viewer

This project is a simple React application that overlays face detection data on a video, which will be used in an upcoming project of mine.

## CSV File Structure

The CSV file should have the following columns (with a header row):

- **frame**: The frame number in the video.
- **face_id**: A unique identifier for each detected face.
- **x1, y1, x2, y2**: The coordinates describing the bounding box of the detected face.

Example:

```csv
frame, face_id, x1,  y1,  x2,  y2 
1,     0,       100, 50,  150, 100 
1,     1,       200, 80,  250, 130 
2,     0,       105, 55,  155, 105 
...
```

## Generating Face Detection CSVs

A demo Python Jupyter notebook (`face_detect.ipynb`) is provided to help you generate CSV files with face detection data. This notebook uses a wrapper library for the `RetinaFace` model to analyze a video and export face detections as a CSV file. Run the notebook to process your videos and output a CSV file that is compatible with this viewer.
