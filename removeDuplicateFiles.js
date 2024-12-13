import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function removeDuplicateFiles(dir) {
  const files = fs.readdirSync(dir);
  const fileHashes = new Map();

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeDuplicateFiles(fullPath);
    } else {
      const fileHash = getFileHash(fullPath);
      if (fileHashes.has(fileHash)) {
        fs.unlinkSync(fullPath);
        console.log(`Removed duplicate file: ${fullPath}`);
      } else {
        fileHashes.set(fileHash, fullPath);
      }
    }
  });
}

// Start from the project root directory
removeDuplicateFiles(process.cwd());