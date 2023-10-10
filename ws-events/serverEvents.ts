import { z } from 'zod';
import WebSocket from 'ws';
// Enums for Message Types, Round Types, and Round Status
export enum MessageType {
  CreateQuestionaireRound = 'createQuestionaireRound',
  EndCurrentRound = 'endCurrentRound',
  CreateSpace = 'createSpace',
  JoinSpace = 'joinSpace',
  PostQuestion = 'postQuestion',
  UpvoteQuestion = 'upvoteQuestion'
}

export enum RoundType {
  Normal = 'normal',
  Incremental = 'incremental'
}

export enum RoundStatus {
  Active = 'active',
  Ended = 'ended'
}


// Zod Schemas for Message Payloads
const CreateQuestionaireRoundPayLoad = z.object({
  spaceId: z.string()
});

const EndCurrentRoundPayload = z.object({
  spaceId: z.string()
});

const CreateSpacePayload = z.object({});

const JoinSpacePayload = z.object({
  spaceId: z.string()
});

const PostQuestionPayload = z.object({
  text: z.string(),
  spaceId: z.string(),
});

const UpvoteQuestionPayload = z.object({
  questionId: z.string(),
  spaceId: z.string()
});

const MessagePayloads = {
  [MessageType.CreateQuestionaireRound]: CreateQuestionaireRoundPayLoad,
  [MessageType.EndCurrentRound]: EndCurrentRoundPayload,
  [MessageType.CreateSpace]: CreateSpacePayload,
  [MessageType.JoinSpace]: JoinSpacePayload,
  [MessageType.PostQuestion]: PostQuestionPayload,
  [MessageType.UpvoteQuestion]: UpvoteQuestionPayload
};

// Utility function for emitting events with enforced payload types using Zod
export function emitEvent<T extends MessageType>(
  ws: WebSocket, 
  type: T, 
  payload: z.infer<typeof MessagePayloads[T]>
): void {
  // Validate payload using Zod
  const validationResult = MessagePayloads[type].safeParse(payload);
  
  
  if (!validationResult.success) {
    console.error('Invalid payload:', validationResult.error);
    return;
  }

  // Send the message
  ws.send(JSON.stringify({
    type,
    payload
  }));
}


export function createHandlerManager(ws: WebSocket) {
  const handlers: { [key in MessageType]?: (payload: any, error: z.ZodError | null) => void } = {};

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data.toString());
    const handler = handlers[message.type as MessageType];
    console.debug('Received message:', message);
    
    if (handler) {
      const validationResult = MessagePayloads[message.type as MessageType].safeParse(message.payload);
      
      
      if (validationResult.success) {
        handler(validationResult.data, null);  // null indicates no error
      } else {
        handler(null, validationResult.error); // pass the Zod error object
      }
    }
  });

  return {
    registerHandler<T extends MessageType>(
      type: T,
      handler: (payload: z.infer<typeof MessagePayloads[T]> | null, error: z.ZodError<any> | null) => void
    ): () => void {
      handlers[type] = handler;
      
      return () => {
        delete handlers[type];
      };
    }
  };
}
