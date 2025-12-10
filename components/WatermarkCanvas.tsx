import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { WatermarkSettings } from '../types';

interface WatermarkCanvasProps {
  imageFile: File;
  settings: WatermarkSettings;
  onDimensionsLoad?: (width: number, height: number) => void;
}

export interface WatermarkCanvasHandle {
  downloadImage: () => void;
}

const WatermarkCanvas = forwardRef<WatermarkCanvasHandle, WatermarkCanvasProps>(
  ({ imageFile, settings, onDimensionsLoad }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Expose download functionality
    useImperativeHandle(ref, () => ({
      downloadImage: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `watermarked-${imageFile.name}`;
        link.href = canvas.toDataURL(imageFile.type);
        link.click();
      }
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      
      img.onload = () => {
        // Set canvas dimensions to match original image
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (onDimensionsLoad) {
            onDimensionsLoad(img.width, img.height);
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Apply Watermark
        drawWatermark(ctx, canvas.width, canvas.height, settings);
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;

    }, [imageFile, settings, onDimensionsLoad]);

    const drawWatermark = async (
      ctx: CanvasRenderingContext2D, 
      width: number, 
      height: number, 
      config: WatermarkSettings
    ) => {
      ctx.save();
      
      // Calculate Base Coordinates based on position setting
      let startX = 0;
      let startY = 0;

      // Safe margin
      const margin = Math.min(width, height) * 0.05;

      if (config.position === 'custom') {
        startX = (config.x / 100) * width;
        startY = (config.y / 100) * height;
      } else if (config.position === 'tile') {
        // Tiling logic handled separately
      } else {
        switch (config.position) {
          case 'center': startX = width / 2; startY = height / 2; break;
          case 'top-left': startX = margin; startY = margin; break;
          case 'top-right': startX = width - margin; startY = margin; break;
          case 'bottom-left': startX = margin; startY = height - margin; break;
          case 'bottom-right': startX = width - margin; startY = height - margin; break;
        }
      }

      if (config.type === 'text' && config.text) {
        const { content, fontSize, fontFamily, color, opacity, rotation, isBold, isItalic } = config.text;
        
        ctx.globalAlpha = opacity;
        const fontStyle = `${isItalic ? 'italic' : ''} ${isBold ? 'bold' : ''} ${fontSize}px "${fontFamily}"`;
        ctx.font = fontStyle;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        if (config.position === 'tile') {
          // Measure text
          const metrics = ctx.measureText(content);
          const textWidth = metrics.width;
          const textHeight = fontSize; // Approximate
          
          // Rotate context for entire tile grid? Easier to rotate individual items
          // Tiling logic with rotation
          const diag = Math.sqrt(width * width + height * height);
          const gap = config.gap + 100; // base gap
          
          ctx.translate(width / 2, height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-width / 2, -height / 2);

          // Draw a grid larger than canvas to cover rotation
          for (let x = -width; x < width * 2; x += (textWidth + gap)) {
            for (let y = -height; y < height * 2; y += (textHeight + gap)) {
                ctx.fillText(content, x, y);
            }
          }
        } else {
          // Single placement
          ctx.translate(startX, startY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(content, 0, 0);
        }

      } else if (config.type === 'image' && config.image?.previewUrl) {
        const watermarkImg = new Image();
        watermarkImg.src = config.image.previewUrl;
        
        await new Promise((resolve) => {
            if (watermarkImg.complete) resolve(true);
            watermarkImg.onload = () => resolve(true);
        });

        const { scale, opacity, rotation } = config.image;
        ctx.globalAlpha = opacity;

        // Calculate watermark size relative to main image
        const baseSize = Math.min(width, height) * 0.2; // Base 20%
        const wWidth = watermarkImg.width * (scale / 50); // Scale factor
        const wHeight = watermarkImg.height * (scale / 50); 
        
        // Center the anchor point
        const offsetX = -wWidth / 2;
        const offsetY = -wHeight / 2;

        if (config.position === 'tile') {
             const gap = config.gap + 150;
             
             ctx.translate(width / 2, height / 2);
             ctx.rotate((rotation * Math.PI) / 180);
             ctx.translate(-width / 2, -height / 2);

             for (let x = -width; x < width * 2; x += (wWidth + gap)) {
                for (let y = -height; y < height * 2; y += (wHeight + gap)) {
                    ctx.drawImage(watermarkImg, x + offsetX, y + offsetY, wWidth, wHeight);
                }
              }
        } else {
            ctx.translate(startX, startY);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(watermarkImg, offsetX, offsetY, wWidth, wHeight);
        }
      }

      ctx.restore();
    };

    return (
      <div 
        ref={containerRef} 
        className="relative w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden rounded-lg border border-gray-800 shadow-2xl"
      >
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full object-contain shadow-lg"
          style={{ 
             // Pure CSS visual styling for the canvas element itself in the DOM
             background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')"
          }}
        />
      </div>
    );
  }
);

export default WatermarkCanvas;