// Shared test infrastructure for R18 Playwright tests
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITES_DIR = '/source';

const STRIPE_LINKS = [
  'https://buy.stripe.com/14AbJ2ebIdNO8nYch85Vu06', // Arena
  'https://buy.stripe.com/4gM5kE4B8aBC9s2epg5Vu07', // OpenClaw
  'https://buy.stripe.com/28E3cw6Jg25647Ibd45Vu05', // SQ Cloud
  'https://buy.stripe.com/4gMdRa2t0bFG0Vw0yq5Vu09', // Singularity
  'https://buy.stripe.com/8x2bJ27Nk4de33Eftk5Vu08', // Benefactor
];

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
};

function createSites(portOffset) {
  return [
    { name: 'mirrorborn.us', dir: `${SITES_DIR}/site-mirrorborn-us`, port: portOffset },
    { name: 'apertureshift.com', dir: `${SITES_DIR}/site-apertureshift-com`, port: portOffset + 1 },
    { name: 'visionquest.me', dir: `${SITES_DIR}/site-visionquest-me`, port: portOffset + 2 },
    { name: 'quickfork.net', dir: `${SITES_DIR}/site-quickfork-net`, port: portOffset + 3 },
    { name: 'wishnode.net', dir: `${SITES_DIR}/site-wishnode-net`, port: portOffset + 4 },
    { name: 'sotafomo.com', dir: `${SITES_DIR}/site-sotafomo-com`, port: portOffset + 5 },
    { name: 'singularitywatch.org', dir: `${SITES_DIR}/site-singularitywatch-org`, port: portOffset + 6 },
  ];
}

function startServer(dir, port) {
  const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(dir, url === '/' ? 'index.html' : url);
    const ext = path.extname(filePath);
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(port);
  return server;
}

function startAll(sites) {
  const servers = [];
  for (const site of sites) {
    if (fs.existsSync(site.dir)) servers.push(startServer(site.dir, site.port));
  }
  return servers;
}

function stopAll(servers) {
  for (const s of servers) s.close();
}

module.exports = { STRIPE_LINKS, createSites, startAll, stopAll };
