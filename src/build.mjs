import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Importamos process explícitamente
import process from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  // Asegurarnos de que estamos en la carpeta correcta
  process.chdir(__dirname);
  
  // Instalar dependencias
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Asegurarnos de que vite está instalado
  console.log('Installing Vite...');
  execSync('npm install vite@5.4.11 --save-dev', { stdio: 'inherit' });
  
  // Ejecutar el build
  console.log('Building...');
  execSync('node ./node_modules/vite/bin/vite.js build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}