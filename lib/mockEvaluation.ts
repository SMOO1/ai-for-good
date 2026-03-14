/**
 * Analyzes the canvas image data to determine if the drawn shape
 * roughly matches the expected physical characteristics of the word.
 * It checks aspect ratio (tall, wide, round) and stroke density (simple, complex).
 */
export const evaluateDrawing = async (
  imageDataUrl: string | null,
  expectedShape?: "round" | "tall" | "wide" | "complex" | "simple"
): Promise<boolean> => {
  if (!imageDataUrl) return false;

  // Very basic check: If the data URL is extremely short, they drew almost nothing.
  if (imageDataUrl.length < 5000) return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return resolve(false);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let pixelCount = 0;

      // Scan pixels to find the bounding box of the drawing and count drawn pixels
      for (let y = 0; y < canvas.height; y += 2) { // Skip pixels for performance
        for (let x = 0; x < canvas.width; x += 2) {
          const i = (y * canvas.width + x) * 4;
          const alpha = data[i + 3];
          
          // If the pixel is not transparent (meaning it was drawn on)
          if (alpha > 50) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            pixelCount++;
          }
        }
      }

      // If they drew barely a dot or line
      if (pixelCount < 50) {
        return resolve(false);
      }

      const width = maxX - minX;
      const height = maxY - minY;
      
      if (width <= 0 || height <= 0) return resolve(false);

      const aspectRatio = width / height;
      const boundingArea = width * height;
      const density = pixelCount / boundingArea;

      // Debugging logs (hidden in production, but useful to see the logic)
      console.log(`[Evaluation] Shape: ${expectedShape}, Ratio: ${aspectRatio.toFixed(2)}, Density: ${density.toFixed(4)}`);

      let isMatch = false;

      // Strict heuristic rules based on expected shape
      switch (expectedShape) {
        case "round":
          // Aspect ratio should be somewhat square-ish
          isMatch = aspectRatio >= 0.65 && aspectRatio <= 1.5;
          break;
        case "tall":
          // Should be noticeably taller than wide
          isMatch = aspectRatio <= 0.85;
          break;
        case "wide":
          // Should be noticeably wider than tall
          isMatch = aspectRatio >= 1.15;
          break;
        case "simple":
          // Lower stroke density (clean, simple lines)
          isMatch = density < 0.15;
          break;
        case "complex":
          // Higher stroke density (lots of scribbling/details)
          isMatch = density > 0.05;
          break;
        default:
          // Fallback if no shape is provided: Just ensure it's a decent sized drawing
          isMatch = pixelCount > 100;
      }

      // If it fails the strict shape test, reject it
      if (!isMatch) {
        resolve(false);
        return;
      }

      // Even if it matches the general shape, add a 10% chance of "uncertainty" 
      // to keep the app feeling like it's "thinking" and not mechanically perfect.
      const finalResult = Math.random() > 0.1;
      resolve(finalResult);
    };

    img.onerror = () => resolve(false);
    img.src = imageDataUrl;
  });
};
