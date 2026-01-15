export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const detectSubject = async (
    imageUrl: string,
    onProgress?: (progress: number) => void
): Promise<Rect | null> => {
    onProgress?.(10);

    try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        onProgress?.(30);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        onProgress?.(50);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Find edges and subject boundaries
        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
        let hasContent = false;

        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
                const i = (y * canvas.width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Skip transparent or very light pixels
                if (a < 200) continue;

                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

                // Detect non-background pixels
                if (brightness < 240 || variance > 30) {
                    hasContent = true;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        onProgress?.(80);

        if (hasContent && minX < maxX && minY < maxY) {
            // Return natural coordinates
            const padding = 20;
            // We can't apply padding relative to display scaling here accurately if we want to return natural coords with "natural" padding.
            // But the original code applied padding AFTER scaling. 
            // Let's return the exact bounds, and let the UI add padding if it wants, 
            // OR we add padding here in natural pixels. 
            // The original code: const cropX = Math.max(0, minX * scaleX - padding);
            // So the padding was in display pixels (20px on screen). 
            // We'll just return the bounding box of the subject.

            onProgress?.(100);
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }

        onProgress?.(100);
        return null;
    } catch (error) {
        console.error("Auto-detect error:", error);
        return null;
    }
};

export const cropImage = async (
    imageUrl: string,
    cropAreaDisplay: Rect, // x, y, width, height in display coordinates
    displaySize: { width: number; height: number }, // display dimensions of the image
    mimeType: string = "image/png",
    onProgress?: (progress: number) => void
): Promise<Blob | null> => {
    onProgress?.(0);

    try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: false });
        if (!ctx) return null;

        // Calculate scale factors (natural size to display size)
        const scaleX = img.naturalWidth / displaySize.width;
        const scaleY = img.naturalHeight / displaySize.height;

        // Convert display coordinates to natural image coordinates
        const sx = cropAreaDisplay.x * scaleX;
        const sy = cropAreaDisplay.y * scaleY;
        const sw = cropAreaDisplay.width * scaleX;
        const sh = cropAreaDisplay.height * scaleY;

        // Ensure crop area is valid
        if (sw <= 0 || sh <= 0 || sx < 0 || sy < 0 || sx + sw > img.naturalWidth || sy + sh > img.naturalHeight) {
            return null;
        }

        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            img,
            sx, sy, sw, sh,  // Source rectangle (from original image)
            0, 0, sw, sh     // Destination rectangle (to canvas)
        );

        onProgress?.(50);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                onProgress?.(100);
                resolve(blob);
            }, mimeType, 0.95);
        });
    } catch (error) {
        console.error("Crop error:", error);
        return null;
    }
};

export const removeBackground = async (
    imageUrl: string,
    onProgress?: (progress: number) => void
): Promise<Blob | null> => {
    onProgress?.(0);
    try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        onProgress?.(20);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        onProgress?.(40);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        onProgress?.(60);

        // Advanced background removal algorithm
        // First pass: Identify background color from corners
        const cornerSamples: number[][] = [];
        const sampleSize = Math.min(50, Math.floor(canvas.width / 10), Math.floor(canvas.height / 10));

        // Sample corners
        for (let y = 0; y < sampleSize; y++) {
            for (let x = 0; x < sampleSize; x++) {
                // Top-left
                const idx1 = (y * canvas.width + x) * 4;
                cornerSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);

                // Top-right
                const idx2 = (y * canvas.width + (canvas.width - 1 - x)) * 4;
                cornerSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);

                // Bottom-left
                const idx3 = ((canvas.height - 1 - y) * canvas.width + x) * 4;
                cornerSamples.push([data[idx3], data[idx3 + 1], data[idx3 + 2]]);

                // Bottom-right
                const idx4 = ((canvas.height - 1 - y) * canvas.width + (canvas.width - 1 - x)) * 4;
                cornerSamples.push([data[idx4], data[idx4 + 1], data[idx4 + 2]]);
            }
        }

        // Calculate average background color
        const avgBg = cornerSamples.reduce(
            (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
            [0, 0, 0]
        ).map(v => v / cornerSamples.length);

        // Calculate threshold for background similarity
        const threshold = 40;

        // Second pass: Remove background pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            // Calculate distance from average background color
            const colorDist = Math.sqrt(
                Math.pow(r - avgBg[0], 2) +
                Math.pow(g - avgBg[1], 2) +
                Math.pow(b - avgBg[2], 2)
            );

            // Calculate brightness
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

            // Calculate color variance
            const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

            // Method 1: Remove pixels similar to corner background
            if (colorDist < threshold) {
                data[i + 3] = 0;
                continue;
            }

            // Method 2: Remove very bright/white backgrounds
            if (brightness > 245 && variance < 20) {
                data[i + 3] = 0;
                continue;
            }

            // Method 3: Remove light backgrounds with smooth transition
            if (brightness > 230 && variance < 30) {
                const alpha = Math.max(0, a - Math.min(200, (brightness - 230) * 10));
                data[i + 3] = alpha;
                continue;
            }

            // Method 4: Remove near-white backgrounds
            if (brightness > 235 && Math.min(r, g, b) > 220) {
                data[i + 3] = Math.max(0, a - 100);
            }
        }

        // Third pass: Edge detection to preserve subject edges
        const edgeData = new Uint8ClampedArray(data);
        for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
                const idx = (y * canvas.width + x) * 4;

                if (data[idx + 3] === 0) continue;

                // Check surrounding pixels for edges
                let edgeStrength = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
                        const neighborAlpha = edgeData[nIdx + 3];
                        if (neighborAlpha === 0) {
                            edgeStrength += 50;
                        }
                    }
                }

                // Preserve edge pixels
                if (edgeStrength > 100) {
                    data[idx + 3] = Math.min(255, data[idx + 3] + 30);
                }
            }
        }

        onProgress?.(85);

        ctx.putImageData(imageData, 0, 0);

        onProgress?.(95);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                onProgress?.(100);
                resolve(blob);
            }, "image/png", 1.0);
        });

    } catch (error) {
        console.error("Remove background error:", error);
        return null;
    }
};
