import fs from 'fs';
import path from 'path';

// Valid 1x1 transparent PNG buffer as base fallback
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Download or write placeholder icons
async function fetchAsset(url, dest) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log('Saved:', dest);
      return;
    }
  } catch (e) {
    console.warn('Could not fetch online asset, writing fallback:', e.message);
  }
  fs.writeFileSync(dest, minimalPng);
}

async function main() {
  await fetchAsset(
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=80',
    path.join(publicDir, 'og-image.jpg')
  );
  await fetchAsset(
    'https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.png',
    path.join(publicDir, 'pwa-192x192.png')
  );
  await fetchAsset(
    'https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.png',
    path.join(publicDir, 'pwa-512x512.png')
  );
  console.log('Asset generation complete.');
}

main();
