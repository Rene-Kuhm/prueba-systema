import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, 'source-icon.png');
const sizes = [192, 512];

async function generateIcons() {
  const outputDir = join(__dirname, '../');
  
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size)
      .toFile(join(outputDir, `icon-${size}x${size}.png`));
  }
}

generateIcons().catch(console.error);
