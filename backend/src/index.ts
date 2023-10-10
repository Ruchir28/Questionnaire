import express from 'express';
import {Server as WebSocketServer} from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import {createHandlerManager,emitEvent} from "@ruchir28/ws-events/serverEvents"
import { handleWsEvents } from './controllers/ws';
import { CustomWebSocket } from './types/CustomWebSocket';
import { logIn, userController } from './controllers/user';

const app = express()
const port = 8000

app.use(express.json());


// Initialize a basic HTTP server using Express
const server = http.createServer(app);

app.post('/login', logIn);

// Initialize a WebSocket server instance
const wss = new WebSocketServer({ path: '/ws', noServer: true});

const authenticateJWT = (req: http.IncomingMessage) => {
  console.log('Authenticating request...');
  if(req.headers['authorization'] === undefined){
    return false;
  }
  console.log(req.headers['authorization']);
  return true;
}

server.on('upgrade', (request, socket, head) => {
  if (!authenticateJWT(request)){
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, function done(ws: CustomWebSocket,req: http.IncomingMessage) {
      let user_controller = userController();
      ws.user = user_controller.getUser(req.headers['authorization'] as string);
      if(!ws.user){
        ws.close(4001, 'Unauthorized');
      }
      user_controller.addUserConnectionMapping(ws.user.id, ws);
      wss.emit('connection', ws, request);
    });
});

// WebSocket setup and connection handling
wss.on('connection', (ws: CustomWebSocket) => {
  handleWsEvents(ws);
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
