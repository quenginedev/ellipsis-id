/**
 * WebGL fingerprinting implementation
 */
import { ComponentData } from '../types';
import { hashData } from '../utils/hash';
import { createCanvas, getWebGLContext } from '../utils/browser-compat';
import { WEBGL_CONFIG } from '../config';

/**
 * Get WebGL renderer information and parameters
 * 
 * @returns WebGL fingerprint component data
 */
export async function getWebGLFingerprint(): Promise<ComponentData> {
  // Create canvas element
  const canvas = createCanvas();
  if (!canvas) {
    return {
      raw: 'WebGL not supported - Canvas creation failed',
      hash: hashData('WebGL not supported - Canvas creation failed')
    };
  }
  
  // Get WebGL context
  const gl = getWebGLContext(canvas);
  if (!gl) {
    return {
      raw: 'WebGL not supported',
      hash: hashData('WebGL not supported')
    };
  }
  
  try {
    // Get WebGL renderer information
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // Get supported extensions
    const extensions = gl.getSupportedExtensions() || [];
    
    // Get additional WebGL parameters
    const parameters: any[] = [];
    for (const param of WEBGL_CONFIG.parameters) {
      try {
        // @ts-ignore - Dynamic property access
        const value = gl.getParameter(gl[param]);
        
        // Handle array-like objects
        if (value && typeof value.length === 'number') {
          parameters.push(Array.from(value).join(','));
        } else {
          parameters.push(String(value));
        }
      } catch (e) {
        parameters.push(`Error getting ${param}`);
      }
    }
    
    // Create a simple WebGL scene to test rendering behavior
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }
    
    // Simple vertex shader
    gl.shaderSource(vertexShader, `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);
    
    // Simple fragment shader
    gl.shaderSource(fragmentShader, `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.8, 0.2, 0.3, 1.0);
      }
    `);
    
    // Compile shaders
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    
    // Create program and attach shaders
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Failed to create program');
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    // Create a buffer with a triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.0, 0.5
      ]),
      gl.STATIC_DRAW
    );
    
    // Set up attribute
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Draw the triangle
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    // Get the rendered image data
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    // Calculate a simple hash of the pixel data
    let pixelHash = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      pixelHash = ((pixelHash << 5) - pixelHash) + pixels[i];
      pixelHash = ((pixelHash << 5) - pixelHash) + pixels[i + 1];
      pixelHash = ((pixelHash << 5) - pixelHash) + pixels[i + 2];
    }
    
    // Combine all data into a single object
    const data = {
      vendor,
      renderer,
      extensions: extensions.join(','),
      parameters: parameters.join(','),
      pixelHash: pixelHash.toString(16)
    };
    
    // Hash the data
    const hash = hashData(JSON.stringify(data));
    
    return {
      raw: data,
      hash
    };
  } catch (error) {
    return {
      raw: `WebGL fingerprinting error: ${error}`,
      hash: hashData(`WebGL fingerprinting error: ${error}`)
    };
  }
}