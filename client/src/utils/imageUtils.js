/**
 * Intelligent Client-Side Background Removal & Image Harmonization
 * Performs fast edge-connected flood-fill on an HTML5 canvas to isolate
 * products from studio/solid backgrounds (white, light grey, etc.) with feathering.
 */

export function removeSolidBackground(img, tolerance = 35) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;

            if (!width || !height) {
                return reject(new Error("Invalid image dimensions"));
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            // Sample edge points to detect the background color
            const samplePoints = [
                [0, 0],
                [width - 1, 0],
                [0, height - 1],
                [width - 1, height - 1],
                [Math.floor(width / 2), 0],
                [Math.floor(width / 2), height - 1],
                [0, Math.floor(height / 2)],
                [width - 1, Math.floor(height / 2)]
            ];

            let rSum = 0, gSum = 0, bSum = 0;
            for (const [cx, cy] of samplePoints) {
                const i = (cy * width + cx) * 4;
                rSum += data[i];
                gSum += data[i + 1];
                bSum += data[i + 2];
            }
            const bgR = Math.round(rSum / samplePoints.length);
            const bgG = Math.round(gSum / samplePoints.length);
            const bgB = Math.round(bSum / samplePoints.length);

            const isLightBg = bgR > 215 && bgG > 215 && bgB > 215;

            // Fast check: Is pixel matching background color?
            const isBg = (idx) => {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // If background is light/white, any very light pixel near the edges is background
                if (isLightBg && r > 230 && g > 230 && b > 230) {
                    return true;
                }

                const dist = Math.sqrt(
                    (r - bgR) * (r - bgR) +
                    (g - bgG) * (g - bgG) +
                    (b - bgB) * (b - bgB)
                );
                return dist <= tolerance;
            };

            // Edge-connected Flood Fill using typed array for instant performance
            const totalPixels = width * height;
            const visited = new Uint8Array(totalPixels);
            const queue = new Int32Array(totalPixels);
            let head = 0;
            let tail = 0;

            // Push all border pixels that match background
            for (let x = 0; x < width; x++) {
                const idxTop = x * 4;
                if (isBg(idxTop)) {
                    queue[tail++] = x;
                    visited[x] = 1;
                }
                const pBot = (height - 1) * width + x;
                const idxBot = pBot * 4;
                if (isBg(idxBot) && !visited[pBot]) {
                    queue[tail++] = pBot;
                    visited[pBot] = 1;
                }
            }

            for (let y = 0; y < height; y++) {
                const pLeft = y * width;
                const idxLeft = pLeft * 4;
                if (isBg(idxLeft) && !visited[pLeft]) {
                    queue[tail++] = pLeft;
                    visited[pLeft] = 1;
                }
                const pRight = y * width + (width - 1);
                const idxRight = pRight * 4;
                if (isBg(idxRight) && !visited[pRight]) {
                    queue[tail++] = pRight;
                    visited[pRight] = 1;
                }
            }

            // BFS Flood from the outer perimeter
            while (head < tail) {
                const p = queue[head++];
                const px = p % width;
                const py = Math.floor(p / width);

                // Set alpha to 0 (transparent)
                data[p * 4 + 3] = 0;

                // 4 neighbors
                if (px + 1 < width) {
                    const np = p + 1;
                    if (!visited[np]) {
                        visited[np] = 1;
                        if (isBg(np * 4)) queue[tail++] = np;
                    }
                }
                if (px - 1 >= 0) {
                    const np = p - 1;
                    if (!visited[np]) {
                        visited[np] = 1;
                        if (isBg(np * 4)) queue[tail++] = np;
                    }
                }
                if (py + 1 < height) {
                    const np = p + width;
                    if (!visited[np]) {
                        visited[np] = 1;
                        if (isBg(np * 4)) queue[tail++] = np;
                    }
                }
                if (py - 1 >= 0) {
                    const np = p - width;
                    if (!visited[np]) {
                        visited[np] = 1;
                        if (isBg(np * 4)) queue[tail++] = np;
                    }
                }
            }

            // Alpha Feathering: smooth the transition at the border of transparent & opaque
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const p = y * width + x;
                    const idx = p * 4;
                    if (data[idx + 3] > 0) {
                        const hasTransNeighbor =
                            data[(p - 1) * 4 + 3] === 0 ||
                            data[(p + 1) * 4 + 3] === 0 ||
                            data[(p - width) * 4 + 3] === 0 ||
                            data[(p + width) * 4 + 3] === 0;

                        if (hasTransNeighbor) {
                            const r = data[idx];
                            const g = data[idx + 1];
                            const b = data[idx + 2];
                            const dist = Math.sqrt(
                                (r - bgR) * (r - bgR) +
                                (g - bgG) * (g - bgG) +
                                (b - bgB) * (b - bgB)
                            );
                            if (dist < tolerance * 1.6) {
                                data[idx + 3] = Math.round(Math.min(255, (dist / (tolerance * 1.6)) * 255));
                            }
                        }
                    }
                }
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        } catch (err) {
            reject(err);
        }
    });
}
