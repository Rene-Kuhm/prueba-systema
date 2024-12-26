import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICONS = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' }
];

async function generateIcons() {
  const sourceIcon = path.join(__dirname, 'source-icon.png');
  
  try {
    await Promise.all(ICONS.map(async ({ size, name }) => {
      const outputPath = path.join(__dirname, name);
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(outputPath);
      console.log(`Generated: ${name}`);
    }));
    console.log('Icon generation completed successfully');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
