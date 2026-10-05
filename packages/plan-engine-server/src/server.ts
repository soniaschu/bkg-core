// BKG Plan Engine - Main HTTP Server
// Handles plan review, annotation, and agent communication

import { createServer as createHttpServer, type Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';
import { Annotate } from './annotate.js';
import { Review } from './review.js';
import { MarkerReview } from './marker-review.js';
import { AgentJobs } from './agent-jobs.js';
import { Sessions } from './sessions.js';
import { Config } from './config.js';
import type { PlanServerOptions, PlanServerInstance } from './server.js';

export async function createServer(options: PlanServerOptions): Promise<PlanServerInstance> {
  const config = new Config(options.dataDir);
  await config.load();
  
  const annotate = new Annotate({ config, dataDir: options.dataDir });
  const review = new Review({ config, dataDir: options.dataDir });
  const markerReview = new MarkerReview({ config });
  const agentJobs = new AgentJobs({ config });
  const sessions = new Sessions({ config, dataDir: options.dataDir });
  
  const httpServer = createHttpServer();
  const wss = new WebSocketServer({ server: httpServer });
  
  let port = options.port || 19432;
  
  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://localhost:${port}`);
    const path = url.pathname;
    
    // Handle different WebSocket endpoints
    if (path.startsWith('/review/')) {
      handleReviewConnection(ws, path, sessions, markerReview);
    } else if (path.startsWith('/annotate/')) {
      handleAnnotateConnection(ws, path, annotate);
    } else if (path.startsWith('/agent/')) {
      handleAgentConnection(ws, path, agentJobs);
    }
  });
  
  // HTTP request handling
  httpServer.on('request', async (req, res) => {
    const url = new URL(req.url || '', `http://localhost:${port}`);
    const path = url.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    try {
      if (path === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }
      
      if (path.startsWith('/api/plan/')) {
        await handlePlanApi(req, res, path, sessions);
        return;
      }
      
      if (path.startsWith('/api/review/')) {
        await handleReviewApi(req, res, path, review, markerReview);
        return;
      }
      
      if (path.startsWith('/api/annotate/')) {
        await handleAnnotateApi(req, res, path, annotate);
        return;
      }
      
      // Serve static files for review UI
      if (path === '/' || path.startsWith('/static/')) {
        await serveStatic(req, res, path, options.dataDir);
        return;
      }
      
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
  
  // Start server
  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, () => {
      console.log(`BKG Plan Engine server started on port ${port}`);
      resolve();
    });
    httpServer.on('error', reject);
  });
  
  return {
    port,
    async start() {
      // Already started
    },
    async stop() {
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
        wss.close();
      });
    },
    async reviewPlan(plan: any) {
      return sessions.createReviewSession(plan);
    },
    async visualizePlan(planId: string) {
      return sessions.getVisualization(planId);
    },
    async editPlan(planId: string, edits: any) {
      return sessions.editPlan(planId, edits);
    },
    async getPlanStatus(planId: string) {
      return sessions.getPlanStatus(planId);
    },
  };
}

// WebSocket handlers
function handleReviewConnection(ws: WebSocket, path: string, sessions: Sessions, markerReview: MarkerReview) {
  // Extract session ID from path
  const sessionId = path.split('/')[2];
  sessions.addConnection(sessionId, ws);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      sessions.handleMessage(sessionId, message, markerReview);
    } catch (error) {
      console.error('Review message error:', error);
    }
  });
  
  ws.on('close', () => {
    sessions.removeConnection(sessionId);
  });
}

function handleAnnotateConnection(ws: WebSocket, path: string, annotate: Annotate) {
  // Handle annotation WebSocket connections
}

function handleAgentConnection(ws: WebSocket, path: string, agentJobs: AgentJobs) {
  // Handle agent job WebSocket connections
}

// HTTP API handlers
async function handlePlanApi(req: any, res: any, path: string, sessions: Sessions) {
  const parts = path.split('/').filter(Boolean);
  const action = parts[2]; // api/plan/:action
  const planId = parts[3];
  
  res.setHeader('Content-Type', 'application/json');
  
  switch (action) {
    case 'create':
      if (req.method === 'POST') {
        const body = await readBody(req);
        const session = await sessions.createPlanSession(body);
        res.writeHead(201);
        res.end(JSON.stringify(session));
      }
      break;
    case 'get':
      if (planId && req.method === 'GET') {
        const session = await sessions.getPlanSession(planId);
        if (session) {
          res.writeHead(200);
          res.end(JSON.stringify(session));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Plan not found' }));
        }
      }
      break;
    case 'list':
      if (req.method === 'GET') {
        const plans = await sessions.listPlanSessions();
        res.writeHead(200);
        res.end(JSON.stringify(plans));
      }
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
  }
}

async function handleReviewApi(req: any, res: any, path: string, review: Review, markerReview: MarkerReview) {
  // Handle review API endpoints
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ success: true }));
}

async function handleAnnotateApi(req: any, res: any, path: string, annotate: Annotate) {
  // Handle annotate API endpoints
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ success: true }));
}

async function serveStatic(req: any, res: any, path: string, dataDir: string) {
  // Serve static files for review UI
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>BKG Plan Engine</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="root">Loading BKG Plan Engine...</div>
  <script>
    // Connect to WebSocket for live updates
    const ws = new WebSocket('ws://' + location.host + '/review/plan');
    ws.onmessage = (event) => {
      console.log('Plan update:', event.data);
    };
  </script>
</body>
</html>
  `);
}

async function readBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}