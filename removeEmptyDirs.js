import fs from 'fs';
import path from 'path';

function removeEmptyDirs(dir) {
  const files = fs.readdirSync(dir);

  if (files.length > 0) {
    files.forEach(function(file) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirs(fullPath);
      }
    });

    // Re-evaluate files; after removing subdirectory
    // we may have parent directory empty now
    const reFiles = fs.readdirSync(dir);
    if (reFiles.length === 0) {
      fs.rmdirSync(dir);
      console.log(`Removed empty directory: ${dir}`);
    }
  } else {
    fs.rmdirSync(dir);
    console.log(`Removed empty directory: ${dir}`);
  }
}

// Start from the project root directory
removeEmptyDirs(process.cwd());