const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Creates a standardized intermediate MP4 video segment from an input file (.mp4, .png, .jpg, etc.)
 */
const normalizeSceneToVideo = (sourcePath, duration, destPath) => {
    return new Promise((resolve, reject) => {
        const isVideo = sourcePath.toLowerCase().endsWith(".mp4");

        let command = ffmpeg(sourcePath);

        if (!isVideo) {
            // For static images, loop to given duration
            command = command.loop(duration);
        }

        command
            .fps(30)
            .videoCodec("libx264")
            .outputOptions([
                "-t", `${duration}`,
                "-pix_fmt", "yuv420p",
                "-vf", "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720",
                "-movflags", "+faststart"
            ])
            .on("end", () => resolve(destPath))
            .on("error", (err) => reject(err))
            .save(destPath);
    });
};

/**
 * Concatenates scene video clips seamlessly into the final ad video using FFmpeg
 */
const createVideo = async (scenes, outputName) => {
    const outputDir = path.join(__dirname, "../../generated-videos");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!scenes || scenes.length === 0) {
        throw new Error("No scenes available to render");
    }

    // Temporary workspace for normalized scene segments and concat list
    const tempDir = path.join(outputDir, `temp-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
        const normalizedFiles = [];

        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            const sourcePath = scene.imagePath || scene.videoPath || scene.path;

            if (!sourcePath) {
                throw new Error(`Missing media file for scene ${i + 1}`);
            }

            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Scene file not found: ${sourcePath}`);
            }

            const duration = Number(scene.duration) || 5;
            const destPath = path.join(tempDir, `norm-scene-${i + 1}.mp4`);

            console.log(`[Video Stitcher] Normalizing scene ${i + 1} (${sourcePath})...`);
            await normalizeSceneToVideo(sourcePath, duration, destPath);

            normalizedFiles.push(destPath);
        }

        // Create Concat Protocol List
        const concatFile = path.join(tempDir, "concat_list.txt");
        let concatContent = "";
        normalizedFiles.forEach((file) => {
            concatContent += `file '${file.replace(/\\/g, "/")}'\n`;
        });

        fs.writeFileSync(concatFile, concatContent);

        const outputPath = path.join(outputDir, outputName);

        // Run final seamless concatenation
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(concatFile)
                .inputOptions([
                    "-f concat",
                    "-safe 0"
                ])
                .videoCodec("libx264")
                .outputOptions([
                    "-pix_fmt yuv420p",
                    "-movflags +faststart"
                ])
                .on("start", (cmd) => {
                    console.log("[Video Stitcher] Executing FFmpeg concat command:", cmd);
                })
                .on("progress", (progress) => {
                    console.log(`[Video Stitcher] Rendering final video: ${progress.percent || 0}%`);
                })
                .on("end", () => {
                    console.log("[Video Stitcher] Final ad video rendering completed successfully.");
                    resolve(outputPath);
                })
                .on("error", (err) => {
                    console.error("[Video Stitcher] Concat render error:", err);
                    reject(err);
                })
                .save(outputPath);
        });

        return outputPath;

    } finally {
        // Clean up temporary normalization files
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupError) {
            console.warn("[Video Stitcher] Cleanup warning:", cleanupError.message);
        }
    }
};

module.exports = {
    createVideo
};