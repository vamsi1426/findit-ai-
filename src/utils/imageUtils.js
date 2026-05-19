export const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        // 1. Read file as DataURL (Base64) for robust Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const originalBase64 = e.target.result;
            
            // 2. Load into Image for Compression
            const img = new Image();
            img.src = originalBase64;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1024;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 3. Generate Optimized Base64 for Firestore/AI
                const dbBase64 = canvas.toDataURL('image/jpeg', 0.6);

                canvas.toBlob((blob) => {
                    if (!blob) {
                         // Fallback if blob fails
                         resolve({
                             file: file,
                             previewUrl: originalBase64, // Reliable display
                             base64: dbBase64,
                             width, height
                         });
                         return;
                    }
                    
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    resolve({
                        file: compressedFile,
                        previewUrl: originalBase64, // Reliable display
                        base64: dbBase64,
                        width,
                        height
                    });
                }, 'image/jpeg', 0.6);
            };
            
            img.onerror = (err) => reject(new Error("Failed to load image"));
        };
        
        reader.onerror = (err) => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};
