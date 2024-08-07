import express from 'express';
import {Server as WebSocketServer} from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import {createHandlerManager,emitEvent} from "@ruchir28/ws-events"
import { handleWsEvents } from './controllers/ws';
import { CustomWebSocket } from './types/CustomWebSocket';
import { logIn, userController } from './controllers/user';
import { WebSocket } from 'ws';
import cors from 'cors';

const app = express()
const port = 5000

app.use(express.json());
app.use(cors());


function parseCookies(request: http.IncomingMessage): { [key: string]: string } {
  const list: { [key: string]: string } = {};
  const rc = request.headers.cookie;

  rc && rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    const value = decodeURI(parts.join('=')?.trim());
    if(key && value) {
      list[key] = value;
    }
  });

  return list;
}


// Initialize a basic HTTP server using Express
const server = http.createServer(app);

app.post('/api/login', logIn);

// Initialize a WebSocket server instance
const wss = new WebSocketServer({ path: '/ws', noServer: true});

const authenticateJWT = (req: http.IncomingMessage) => {
  console.log('Authenticating request...');

  const cookies = parseCookies(req);

  console.log(cookies);

  if(cookies['authToken'] === undefined){
    return false;
  }
  console.log(req.headers['authorization']);
  console.log(cookies['authToken']);
  return true;
}

server.on('upgrade', (request, socket, head) => {
  const cookies = parseCookies(request);
  if (!authenticateJWT(request) || (!userController().getUser(cookies['authToken'] as string))){
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, function done(ws: WebSocket,req: http.IncomingMessage) {
      let user_controller = userController();
      let customWebSocket = new CustomWebSocket(ws);
      customWebSocket.user = user_controller.getUser(cookies['authToken'] as string);
      if(!customWebSocket.user){
        customWebSocket.ws.close(4001, 'Unauthorized');
        return;
      }
      user_controller.addUserConnectionMapping(customWebSocket.user.id, customWebSocket);
      wss.emit('connection', customWebSocket, request);
    });
});

// WebSocket setup and connection handling
wss.on('connection', (ws: CustomWebSocket) => {
  handleWsEvents(ws);
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
