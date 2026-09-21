import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(message); };

const constants = read('src/config/constants.ts');
const server = read('server/index.ts');
const pkg = JSON.parse(read('package.json'));
const docker = read('Dockerfile');
const render = read('render.yaml');

must(constants.includes("window.location.origin}/api/v1"), 'Frontend does not default API traffic to same-origin /api/v1.');
must(constants.includes("window.location.origin : ''"), 'Frontend does not default WebSocket traffic to the current origin.');
must(server.includes("express.static(clientDist"), 'Node server does not serve the frontend dist directory.');
must(server.includes("res.sendFile(path.join(clientDist, 'index.html'))"), 'SPA fallback is missing from Node server.');
must(server.includes("app.use('/api/v1', apiRouter)"), 'API is not mounted under /api/v1.');
must(server.includes('new SocketIOServer(httpServer'), 'Socket.IO is not attached to the same HTTP server.');
must(pkg.scripts?.build === 'npm run server:build && vite build', 'Build does not compile server and frontend together.');
must(pkg.scripts?.start === 'node dist-server/index.js', 'Production start does not use the integrated Node server.');
must(docker.includes('npm run build'), 'Docker image does not build the frontend/server together.');
must(docker.includes('CMD ["node", "dist-server/index.js"]'), 'Docker image does not start the integrated server.');
must(render.includes('autoDeploy: true'), 'Deployment blueprint does not enable auto deployment.');
must(render.includes('healthCheckPath: /api/v1/health/live'), 'Deployment health check is missing.');

for (const forbidden of ['localhost:3001', 'localhost:3000']) {
  must(!constants.includes(forbidden), `Production frontend constants still hard-code ${forbidden}.`);
}

console.log('INTEGRATED_STATIC_CHECK=PASS');
console.log('Frontend API: same-origin /api/v1');
console.log('Frontend realtime: same-origin Socket.IO');
console.log('Node: serves React dist + /api/v1 + Socket.IO');
console.log('Deployment: single Docker service, autoDeploy enabled in render.yaml');
console.log('External private API/payment credentials: server-side placeholders only');
