/**
 * Audio fingerprinting implementation
 */
import { ComponentData } from '../types';
import { hashData } from '../utils/hash';
import { createAudioContext } from '../utils/browser-compat';
import { TIMEOUTS } from '../config';

/**
 * Get audio fingerprint using AudioContext API
 * 
 * @returns Audio fingerprint component data
 */
export async function getAudioFingerprint(): Promise<ComponentData> {
  return new Promise((resolve) => {
    // Set timeout to ensure the function doesn't hang
    const timeoutId = setTimeout(() => {
      resolve({
        raw: 'Audio fingerprinting timed out',
        hash: hashData('Audio fingerprinting timed out')
      });
    }, TIMEOUTS.audio);
    
    try {
      // Create audio context
      const audioContext = createAudioContext();
      if (!audioContext) {
        clearTimeout(timeoutId);
        return resolve({
          raw: 'AudioContext not supported',
          hash: hashData('AudioContext not supported')
        });
      }
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gain = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      // Configure audio nodes
      gain.gain.value = 0; // Mute the sound
      analyser.fftSize = 2048;
      oscillator.type = 'triangle'; // Use triangle wave
      oscillator.frequency.value = 10000; // Set frequency to 10 kHz
      
      // Connect the nodes
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(audioContext.destination);
      
      // Array to store audio data
      const audioData: number[] = [];
      
      // Process audio data
      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const outputBuffer = event.outputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        const outputData = outputBuffer.getChannelData(0);
        
        // Copy input to output (required for ScriptProcessor)
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = inputData[i];
        }
        
        // Get frequency data
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        
        // Store a sample of the frequency data
        for (let i = 0; i < frequencyData.length; i += 16) {
          audioData.push(frequencyData[i]);
        }
        
        // If we have enough data, generate the fingerprint
        if (audioData.length > 200) {
          // Stop collecting data
          scriptProcessor.onaudioprocess = null;
          oscillator.stop();
          clearTimeout(timeoutId);
          
          // Clean up
          oscillator.disconnect();
          analyser.disconnect();
          scriptProcessor.disconnect();
          gain.disconnect();
          
          // Close the audio context
          if (audioContext.state !== 'closed' && audioContext.close) {
            audioContext.close();
          }
          
          // Calculate some features from the audio data
          const features = {
            mean: calculateMean(audioData),
            variance: calculateVariance(audioData),
            skewness: calculateSkewness(audioData),
            kurtosis: calculateKurtosis(audioData),
            audioData: audioData.slice(0, 100) // Only keep a subset of the data
          };
          
          // Hash the features
          const hash = hashData(JSON.stringify(features));
          
          resolve({
            raw: features,
            hash
          });
        }
      };
      
      // Start the oscillator
      oscillator.start(0);
      
    } catch (error) {
      clearTimeout(timeoutId);
      resolve({
        raw: `Audio fingerprinting error: ${error}`,
        hash: hashData(`Audio fingerprinting error: ${error}`)
      });
    }
  });
}

/**
 * Calculate the mean of an array of numbers
 */
function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * Calculate the variance of an array of numbers
 */
function calculateVariance(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = calculateMean(data);
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  return calculateMean(squaredDiffs);
}

/**
 * Calculate the skewness of an array of numbers
 */
function calculateSkewness(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = calculateMean(data);
  const variance = calculateVariance(data);
  if (variance === 0) return 0;
  
  const cubedDiffs = data.map(val => Math.pow(val - mean, 3));
  const sumCubedDiffs = cubedDiffs.reduce((acc, val) => acc + val, 0);
  
  return sumCubedDiffs / (data.length * Math.pow(variance, 1.5));
}

/**
 * Calculate the kurtosis of an array of numbers
 */
function calculateKurtosis(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = calculateMean(data);
  const variance = calculateVariance(data);
  if (variance === 0) return 0;
  
  const fourthPowerDiffs = data.map(val => Math.pow(val - mean, 4));
  const sumFourthPowerDiffs = fourthPowerDiffs.reduce((acc, val) => acc + val, 0);
  
  return sumFourthPowerDiffs / (data.length * Math.pow(variance, 2));
}