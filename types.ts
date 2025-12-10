export type WatermarkType = 'text' | 'image';

export type Position = 
  | 'center' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'custom'
  | 'tile';

export interface TextWatermarkConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  isBold: boolean;
  isItalic: boolean;
}

export interface ImageWatermarkConfig {
  file: File | null;
  previewUrl: string | null;
  scale: number;
  opacity: number;
  rotation: number;
}

export interface WatermarkSettings {
  type: WatermarkType;
  position: Position;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  gap: number; // For tiled
  text: TextWatermarkConfig;
  image: ImageWatermarkConfig;
}

export const FONTS = [
  'Arial',
  'Verdana',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Impact'
];