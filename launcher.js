const { spawn } = require('child_process');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Starting Expo webpack server...');

const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
  stdio: 'pipe',
  shell: true
});

expo.stdout.on('data', (data) => {
  process.stdout.write(data);
});

expo.stderr.on('data', (data) => {
  process.stderr.write(data);
});

setTimeout(() => {
  console.log('🔄 Starting backend server...');
  
  const backend = spawn('node', ['backend/server.js'], {
    stdio: 'pipe',
    shell: true
  });

  backend.stdout.on('data', (data) => {
    process.stdout.write(`[Backend] ${data}`);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(`[Backend] ${data}`);
  });
}, 8000);

process.on('SIGINT', () => {
  expo.kill();
  process.exit();
});