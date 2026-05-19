import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

let model = null;

export const loadModel = async () => {
  if (model) return model;
  try {
      console.log("🧠 Loading MobileNet...");
      // Load MobileNet - version 2, alpha 1.0 for balance of speed/accuracy
      model = await mobilenet.load({ version: 2, alpha: 1.0 });
      console.log("✅ MobileNet Loaded");
      return model;
  } catch (error) {
      console.error("Failed to load MobileNet", error);
      throw error;
  }
};

export const extractImageEmbedding = async (imgElement) => {
  const net = await loadModel();
  // infer(img, embedding=true) returns the 1024-dimensional embedding
  const activation = net.infer(imgElement, true);
  const embedding = activation.arraySync()[0];
  activation.dispose(); // clean up tensor
  return embedding;
};
// NEW: Expose classification
export const classifyImage = async (imgElement) => {
  const net = await loadModel();
  // Classify returns array of { className, probability }
  const predictions = await net.classify(imgElement);
  return predictions;
};
