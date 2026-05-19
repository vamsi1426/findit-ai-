import Fuse from 'fuse.js';

export const CONFIG = {
  IMAGE_WEIGHT: 50,
  TEXT_WEIGHT: 30,
  LOCATION_WEIGHT: 12,
  DATE_WEIGHT: 8,
  MAX_DISTANCE_KM: 50,
  MAX_DATE_DAYS: 30,
  MATCH_MIN_SCORE: 50,
  TOP_N: 5
};

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function haversineDistanceKm(c1, c2) {
  if (!c1 || !c2 || !c1.lat || !c2.lat) return 99999;
  const R = 6371; // Earth Radius
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(c2.lat - c1.lat);
  const dLon = toRad(c2.lng - c1.lng);
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

export const calculateMatchScore = (query, candidates) => {
    // 1. Text Matching with Fuse.js
    const fuse = new Fuse(candidates, {
        keys: [
            { name: "title", weight: 0.6 },
            { name: "description", weight: 0.3 },
            { name: "location.address", weight: 0.2 }, // Match structured address
            { name: "location", weight: 0.2 }, // Match legacy string location
            { name: "keywords", weight: 0.1 }
        ],
        includeScore: true,
        threshold: 0.5, // Relaxed from 0.4 to catch looser matches
        minMatchCharLength: 2,
        ignoreLocation: true
    });

    const searchText = `${query.title} ${query.description}`;
    const fuseResults = fuse.search(searchText);
    
    // Map ID -> Score (default 1 means bad match)
    const textScores = {};
    fuseResults.forEach(res => {
        textScores[res.item.id] = res.score;
    });

    return candidates.map(item => {
        // --- Image Score ---
        let maxSim = 0;
        let hasImageMatch = false;

        if (query.imageEmbeddings?.length && item.imageEmbeddings?.length) {
            hasImageMatch = true;
            // Compare every query embedding with every item embedding
            for (const qEmb of query.imageEmbeddings) {
                for (const iEmbObj of item.imageEmbeddings) {
                    // Handle wrapped object {vector: [...]} or direct array (legacy)
                    const iEmb = iEmbObj.vector ? iEmbObj.vector : iEmbObj;
                    const sim = cosineSimilarity(qEmb, iEmb);
                    if (sim > maxSim) maxSim = sim;
                }
            }
        }
        
        // --- Text Score ---
        // Fuse score: 0 is exact, 1 is mismatch
        const fScore = textScores[item.id] !== undefined ? textScores[item.id] : 1;
        const rawTextScore = (1 - clamp(fScore, 0, 1)); // 0 to 1

        // --- Location Score ---
        let locationScore = 0;
        if (query.location?.lat && item.location?.lat) {
            const dist = haversineDistanceKm(query.location, item.location);
            locationScore = Math.max(0, CONFIG.LOCATION_WEIGHT * (1 - dist / CONFIG.MAX_DISTANCE_KM));
        }

        // --- Date Score ---
        let dateScore = 0;
        if (query.date && item.date) {
            const diffTime = Math.abs(new Date(query.date) - new Date(item.date));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            dateScore = Math.max(0, CONFIG.DATE_WEIGHT * (1 - diffDays / CONFIG.MAX_DATE_DAYS));
        }

        // --- Dynamic Weighting ---
        // If images are missing (on either side), re-distribute the Image Weight to Text
        let finalImageScore = 0;
        let finalTextScore = 0;

        if (hasImageMatch) {
            // Standard scoring
            finalImageScore = clamp(maxSim, 0, 1) * CONFIG.IMAGE_WEIGHT;
            finalTextScore = rawTextScore * CONFIG.TEXT_WEIGHT;
        } else {
            // No image comparison possible? Boost text importance significantly
            // Distribute the 50 points from Image: +40 to Text, +10 to metadata
            finalImageScore = 0; 
            const boostedTextWeight = CONFIG.TEXT_WEIGHT + 40; 
            finalTextScore = rawTextScore * boostedTextWeight;
        }

        const totalScore = finalImageScore + finalTextScore + locationScore + dateScore;
        const normalizedScore = Math.round(clamp(totalScore, 0, 100));

        let confidence = 'Low';
        if (normalizedScore >= 75) confidence = 'High';
        else if (normalizedScore >= 50) confidence = 'Medium';

        return {
            ...item,
            score: normalizedScore,
            confidence,
            breakdown: { 
                imageScore: finalImageScore, 
                textScore: finalTextScore, 
                locationScore, 
                dateScore 
            }
        };
    })
    .filter(m => m.score >= CONFIG.MATCH_MIN_SCORE)
    .sort((a,b) => b.score - a.score)
    .slice(0, CONFIG.TOP_N);
};
