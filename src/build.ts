import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import process from 'process'

const currentDir = dirname(fileURLToPath(import.meta.url))

async function build(): Promise<void> {
  try {
    // Instalar dependencias
    ;('Installing dependencies...')
    execSync('npm install', { stdio: 'inherit' })

    // Ejecutar el build
    ;('Building...')
    const vitePath = join(currentDir, 'node_modules', '.bin', 'vite')
    execSync(`"${vitePath}" build`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    })
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

build().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
