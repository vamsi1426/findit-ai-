import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let detectionModel = null;

export const loadDetectionModel = async () => {
  if (detectionModel) return detectionModel;
  try {
    console.log("Loading COCO-SSD...");
    detectionModel = await cocoSsd.load();
    console.log("COCO-SSD Loaded");
    return detectionModel;
  } catch (err) {
    console.error("Failed to load COCO-SSD", err);
    throw err;
  }
};

export const detectObjects = async (imgElement, minScore = 0.3) => {
  const model = await loadDetectionModel();
  const predictions = await model.detect(imgElement, 20, minScore);
  // Predictions: [{bbox: [x,y,w,h], class: "person", score: 0.88}]
  
  // Extract unique tags
  const tags = [...new Set(predictions.map(p => p.class))];
  return { predictions, tags };
};

export const extractDominantColor = (imgElement) => {
  // Simple canvas averaging
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 100; // Resize for speed
  canvas.height = 100;
  ctx.drawImage(imgElement, 0, 0, 100, 100);
  
  const imageData = ctx.getImageData(0, 0, 100, 100).data;
  let r=0, g=0, b=0, count=0;
  
  for (let i=0; i<imageData.length; i+=4) {
    r += imageData[i];
    g += imageData[i+1];
    b += imageData[i+2];
    count++;
  }
  
  r = Math.floor(r/count);
  g = Math.floor(g/count);
  b = Math.floor(b/count);
  
  const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return { r, g, b, hex };
};
