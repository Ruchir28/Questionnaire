import { z } from "zod";
import WebSocket from "ws";

export enum MessageType {
  NewQuestion = "newQuestion",
  RoundStarted = "roundStarted",
  RoundEnded = "roundEnded",
  UpvoteQuestion = "upvoteQuestion",
  UserJoinedSpace = "userJoinedSpace",
}

export const NewQuestionPayload = z.object({
  text: z.string(),
  questionId: z.string(),
  userName: z.string(),
  userId: z.string(),
});

export const RoundStartedPayload = z.object({
  spaceId: z.string(),
});

export const RoundEndedPayload = z.object({
  spaceId: z.string(),
});

export const UpvoteQuestionPayload = z.object({
  questionId: z.string(),
  spaceId: z.string(),
});

export const UserJoinedSpacePayload = z.object({
  userId: z.string(),
  userName: z.string(),
  spaceId: z.string(),
});

// Zod Schemas for Client Message Payloads
export const ClientMessagePayloads = {
  [MessageType.NewQuestion]: NewQuestionPayload,
  [MessageType.RoundStarted]: RoundStartedPayload,
  [MessageType.RoundEnded]: RoundEndedPayload,
  [MessageType.UpvoteQuestion]: UpvoteQuestionPayload,
  [MessageType.UserJoinedSpace]: UserJoinedSpacePayload,
};

export function emitEvent<T extends MessageType>(
  ws: WebSocket,
  type: T,
  payload: z.infer<(typeof ClientMessagePayloads)[T]>
): void {
  // Validate payload using Zod
  const validationResult = ClientMessagePayloads[type].safeParse(payload);

  if (!validationResult.success) {
    console.error("Invalid payload:", validationResult.error);
    return;
  }

  ws.send(
    JSON.stringify({
      type,
      payload,
    })
  );
}

export function createClientHandlerManager(ws: WebSocket) {
  const handlers: {
    [key in MessageType]?: (payload: any, error: z.ZodError | null) => void;
  } = {};

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data.toString());
    const handler = handlers[message.type as MessageType];
    console.debug("Received message:", message);

    if (handler) {
      const validationResult = ClientMessagePayloads[
        message.type as MessageType
      ].safeParse(message.payload);

      if (validationResult.success) {
        handler(validationResult.data, null);
      } else {
        handler(null, validationResult.error);
      }
    }
  });

  return {
    registerHandler<T extends MessageType>(
      type: T,
      handler: (
        payload: z.infer<(typeof ClientMessagePayloads)[T]> | null,
        error: z.ZodError<any> | null
      ) => void
    ): () => void {
      handlers[type] = handler;
      return () => {
        delete handlers[type];
      };
    },
  };
}
