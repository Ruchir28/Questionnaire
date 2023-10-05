import express from 'express';
import {Server as WebSocketServer} from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';  // For generating unique IDs


const app = express()
const port = 8000


// Initialize a basic HTTP server using Express
const server = http.createServer(app);

// Initialize a WebSocket server instance
const wss = new WebSocketServer({ server , path: '/ws'});

const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // DEMO VALIDATION
  console.log('Authenticating request...');
  next();
}

// app.get('/', (req, res) => {
//   return res.json({ message: 'Hello World!' });
// });

app.use('/ws', authenticateJWT, (req, res) => {
  // Upgrade the connection only if authentication is successful
  console.log('Upgrading connection...');
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
});


enum MessageType {
  StartNewRound = 'startNewRound',
  EndCurrentRound = 'endCurrentRound',
  CreateSpace = 'createSpace',
  JoinSpace = 'joinSpace',
  PostQuestion = 'postQuestion',
  UpvoteQuestion = 'upvoteQuestion'
}

enum RoundType {
  Normal = 'normal',
  Incremental = 'incremental'
}

enum RoundStatus {
  Active = 'active',
  Ended = 'ended'
}

// Question and Space Interfaces
interface Question {
  text: string;
  upvotes: number;
}

interface User {
  id: string;
  name: string;
}

interface Space {
  id: string;
  host: User;
  users: User[];
  questions: Record<string, Question>;
  currentRoundType: RoundType | null;
  currentRoundStatus: RoundStatus | null;
}

// Message Types
interface BaseWebSocketMessage {
  type: MessageType;
  spaceId?: string;
}

interface StartNewRoundMessage extends BaseWebSocketMessage {
  type: MessageType.StartNewRound;
  roundType: RoundType;
}

interface EndCurrentRoundMessage extends BaseWebSocketMessage {
  type: MessageType.EndCurrentRound;
}

interface CreateSpaceMessage extends BaseWebSocketMessage {
  type: MessageType.CreateSpace;
  host: User;
}

interface JoinSpaceMessage extends BaseWebSocketMessage {
  type: MessageType.JoinSpace;
  user: User;
}

interface PostQuestionMessage extends BaseWebSocketMessage {
  type: MessageType.PostQuestion;
  text: string;
}

interface UpvoteQuestionMessage extends BaseWebSocketMessage {
  type: MessageType.UpvoteQuestion;
  questionId: string;
}

type WebSocketMessage = StartNewRoundMessage | EndCurrentRoundMessage | CreateSpaceMessage | JoinSpaceMessage | PostQuestionMessage | UpvoteQuestionMessage;

// In-memory data store for spaces
const spaces: Record<string, Space> = {};

// WebSocket setup and connection handling
wss.on('connection', (ws) => {
  ws.on('message', (message: string) => {
    let parsedMessage: WebSocketMessage;

    try {
      parsedMessage = JSON.parse(message) as WebSocketMessage;
    } catch (e) {
      console.log('Invalid JSON:', message);
      return;
    }

    // Retrieve the space if the spaceId is provided
    const spaceId = parsedMessage.spaceId;
    const space = spaceId ? spaces[spaceId] : null;

    // Handle different message types
    switch (parsedMessage.type) {
      case MessageType.StartNewRound:
        if (space) {
          space.currentRoundType = parsedMessage.roundType;
          space.currentRoundStatus = RoundStatus.Active;
        }
        break;

      case MessageType.EndCurrentRound:
        if (space) {
          space.currentRoundStatus = RoundStatus.Ended;
        }
        break;

      case MessageType.CreateSpace:
        const newSpaceId = uuidv4();
        spaces[newSpaceId] = {
          id: newSpaceId,
          host: parsedMessage.host,
          users: [parsedMessage.host],
          questions: {},
          currentRoundType: null,
          currentRoundStatus: null
        };
        ws.send(JSON.stringify({ type: 'spaceCreated', spaceId: newSpaceId }));
        break;

      case MessageType.JoinSpace:
        if (space) {
          space.users.push(parsedMessage.user);
          ws.send(JSON.stringify({ type: 'joinedSpace', spaceId: space.id }));
        }
        break;      

      case MessageType.PostQuestion:
        if (space && space.currentRoundStatus === RoundStatus.Active) {
          const questionId = uuidv4();
          space.questions[questionId] = {
            text: parsedMessage.text,
            upvotes: 0
          };
        }
        break;

      case MessageType.UpvoteQuestion:
        if (space && space.questions[parsedMessage.questionId]) {
          space.questions[parsedMessage.questionId].upvotes += 1;
        }
        break;
    }
  });
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
