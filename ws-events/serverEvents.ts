import { z } from 'zod';

// Enums for Message Types, Round Types, and Round Status
export enum MessageType {
  StartNewRound = 'startNewRound',
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

// Zod Schemas for Questions, Spaces, and Users
export const Question = z.object({
  text: z.string(),
  upvotes: z.number()
});

export const User = z.object({
  id: z.string(),
  name: z.string()
});

export const Space = z.object({
  id: z.string(),
  host: User,
  users: z.array(User),
  questions: z.record(Question),
  currentRoundType: z.union([z.literal(RoundType.Normal), z.literal(RoundType.Incremental), z.null()]),
  currentRoundStatus: z.union([z.literal(RoundStatus.Active), z.literal(RoundStatus.Ended), z.null()])
});

// Zod Schemas for Message Payloads
const StartNewRoundPayload = z.object({
  roundType: z.literal(RoundType.Normal).or(z.literal(RoundType.Incremental))
});

const EndCurrentRoundPayload = z.object({});

const CreateSpacePayload = z.object({
  host: User
});

const JoinSpacePayload = z.object({
  user: User
});

const PostQuestionPayload = z.object({
  text: z.string()
});

const UpvoteQuestionPayload = z.object({
  questionId: z.string()
});

const MessagePayloads = {
  [MessageType.StartNewRound]: StartNewRoundPayload,
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
    payload // Sending the payload as a nested object
  }));
}


export function handleEvent<T extends MessageType>(
  ws: WebSocket,
  type: T,
  handler: (payload: z.infer<typeof MessagePayloads[T]>) => void
): void {
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    // Check if the message type matches the type we're looking for
    if (message.type === type) {
      // Validate the payload using Zod
      const validationResult = MessagePayloads[type].safeParse(message.payload);

      if (!validationResult.success) {
        console.error('Invalid payload:', validationResult.error);
        return;
      }

      // Call the handler with the payload
      handler(validationResult.data);
    }
  });

}
