/// <reference types="sharp" />
import sharp from 'sharp';
import path from 'path';
import type { Sharp } from 'sharp';

interface IconConfig {
  size: number;
  fileName: string;
}

interface IconGenerationResult {
  size: number;
  fileName: string;
  success: boolean;
  error?: Error;
}

const icons: IconConfig[] = [
  { size: 192, fileName: 'icon-192x192.png' },
  { size: 512, fileName: 'icon-512x512.png' }
];

const source = path.join(__dirname, 'icon.png');

async function generateIcon(config: IconConfig): Promise<IconGenerationResult> {
  try {
    await sharp(source)
      .resize(config.size, config.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(__dirname, config.fileName));
    
    return {
      ...config,
      success: true
    };
  } catch (error) {
    return {
      ...config,
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

async function generateIcons(): Promise<void> {
  try {
    const results = await Promise.all(icons.map(generateIcon));
    
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.error('Failed to generate some icons:', failures);
      process.exit(1);
    }

    console.log('All icons generated successfully');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
