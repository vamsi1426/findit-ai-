const MAX_SIDE = 1024;

async function dataURLtoFile(dataurl, filename) {
    try {
        // Native browser fetch is exponentially faster for base64-to-blob conversion than manual atob loops
        const res = await fetch(dataurl);
        const blob = await res.blob();
        return new File([blob], filename, { type: 'image/jpeg' });
    } catch (e) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){ u8arr[n] = bstr.charCodeAt(n); }
        return new File([u8arr], filename, {type:mime});
    }
}

function calculateDimensions(width, height) {
  if (width <= MAX_SIDE && height <= MAX_SIDE) return { width, height };
  if (width > height) {
      return { width: MAX_SIDE, height: Math.round(height * (MAX_SIDE / width)) };
  } else {
      return { width: Math.round(width * (MAX_SIDE / height)), height: MAX_SIDE };
  }
}

/**
 * Extracts 3 frames (Start, Middle, End) from a video at extremely high speed.
 */
export const extractFrameFromVideo = (videoFile) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.opacity = '0';
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    document.body.appendChild(video);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const frames = [];

    video.onloadedmetadata = async () => {
        try {
            const duration = video.duration || 1;
            // Full video extraction across the entire length
            const times = [duration * 0.2, duration * 0.5, duration * 0.8];
            
            for (const time of times) {
                await new Promise((resSeek) => {
                    const onSeek = async () => {
                        video.removeEventListener('seeked', onSeek);
                        
                        try {
                            const { width, height } = calculateDimensions(video.videoWidth, video.videoHeight);
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(video, 0, 0, width, height);
                            
                            const base64 = canvas.toDataURL('image/jpeg', 0.85);
                            if (base64 !== 'data:,') {
                                const file = await dataURLtoFile(base64, `frame_${Math.floor(time)}s.jpg`);
                                frames.push({ file, previewUrl: base64, base64 });
                            }
                        } catch(e) { 
                            console.error("Frame capture error:", e);
                        }
                        resSeek();
                    };
                    
                    video.addEventListener('seeked', onSeek);
                    video.currentTime = time;
                });
            }

            if (document.body.contains(video)) document.body.removeChild(video);
            URL.revokeObjectURL(url);
            
            if (frames.length === 0) reject(new Error("Could not extract any video frames"));
            else resolve(frames);
            
        } catch(err) {
            if (document.body.contains(video)) document.body.removeChild(video);
            URL.revokeObjectURL(url);
            reject(err);
        }
    };

    video.onerror = () => {
        if (document.body.contains(video)) document.body.removeChild(video);
        URL.revokeObjectURL(url);
        reject(new Error("Video load error"));
    };

    video.src = url;
    video.load();
  });
};
