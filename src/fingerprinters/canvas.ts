/**
 * Canvas fingerprinting implementation
 */
import { ComponentData } from '../types';
import { hashData } from '../utils/hash';
import { createCanvas, get2DContext } from '../utils/browser-compat';
import { CANVAS_CONFIG } from '../config';

/**
 * Create a canvas fingerprint by drawing shapes and text
 * 
 * @returns Canvas fingerprint component data
 */
export async function getCanvasFingerprint(): Promise<ComponentData> {
  // Create canvas element
  const canvas = createCanvas();
  if (!canvas) {
    return {
      raw: 'Canvas not supported',
      hash: hashData('Canvas not supported')
    };
  }
  
  // Get 2D context
  const ctx = get2DContext(canvas);
  if (!ctx) {
    return {
      raw: 'Canvas 2D context not supported',
      hash: hashData('Canvas 2D context not supported')
    };
  }
  
  // Set canvas dimensions
  canvas.width = CANVAS_CONFIG.width;
  canvas.height = CANVAS_CONFIG.height;
  
  // Fill background
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text with specific styling
  ctx.fillStyle = '#111111';
  ctx.font = '18px Arial';
  ctx.textBaseline = 'top';
  ctx.fillText(CANVAS_CONFIG.text, 10, 10);
  ctx.font = '14px Times New Roman';
  ctx.fillText(CANVAS_CONFIG.subText, 10, 40);
  
  // Draw shapes with gradients and shadows
  const gradient = ctx.createLinearGradient(0, 80, canvas.width, 120);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(0.5, '#00ff00');
  gradient.addColorStop(1, '#0000ff');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 100, 50, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 10;
  
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(200, 30, 60, 60);
  
  // Add some more complex shapes
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 150);
  ctx.bezierCurveTo(50, 180, 150, 180, 150, 150);
  ctx.stroke();
  
  // Add some text with different font
  ctx.font = '16px Courier New';
  ctx.fillStyle = '#000000';
  ctx.fillText('Fingerprint', 50, 175);
  
  // Get data URL
  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL();
  } catch (error) {
    dataUrl = 'Error generating canvas data URL';
  }
  
  // Hash the data URL
  const hash = hashData(dataUrl);
  
  return {
    raw: dataUrl,
    hash
  };
}