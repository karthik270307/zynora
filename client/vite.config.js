import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function fixOnnxWebGpu() {
  return {
    name: "fix-onnx-webgpu",
    resolveId(id) {
      if (id === "onnxruntime-web/webgpu") {
        return this.resolve("onnxruntime-web");
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    fixOnnxWebGpu(),
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      external: ["onnxruntime-web", "onnxruntime-web/webgpu"],
    },
    rollupOptions: {
      external: ["onnxruntime-web", "onnxruntime-web/webgpu"],
    },
  },
});