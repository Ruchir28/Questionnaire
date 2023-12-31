import { z } from "zod";
import WebSocket from "ws";
import { IWebSocket } from "./IWebSocket";

export enum ClientMessageType {
  NewQuestion = "newQuestion",
  RoundStarted = "roundStarted",
  RoundEnded = "roundEnded",
  UpvoteQuestion = "upvoteQuestion",
  UserJoinedSpace = "userJoinedSpace",
  SpaceCreated = "spaceCreated",
  GetQuestionsForSpace = "getQuestionsforSpace",
  GetSpaceInfo = "spaceInfo",
  GetAllSpaces = "getAllSpaces",
  Error = "error",
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

export const SpaceCreatedPayload = z.object({
  spaceId: z.string(),
});

export const GetQuestionsForSpacePayload = z.object({
  spaceId: z.string(),
  questions: z.array(z.object({
    text: z.string(),
    questionId: z.string(),
    userName: z.string(),
    upvotes: z.number()
  }))
});

export const GetSpaceInfoPayload = z.object({
  spaceId: z.string(),
  users: z.array(z.object({
    userName: z.string(),
  })),
  questions: z.array(z.object({
    text: z.string(),
    questionId: z.string(),
    userName: z.string(),
    upvotes: z.number()
  })),
  currentRound: z.boolean(),
});

export const GetAllSpacesPayload = z.object({
  spaceIds: z.array(z.string())
});

export const ErrorPayload = z.object({
  message: z.string()
});

// Zod Schemas for Client Message Payloads
export const ClientMessagePayloads = {
  [ClientMessageType.NewQuestion]: NewQuestionPayload,
  [ClientMessageType.RoundStarted]: RoundStartedPayload,
  [ClientMessageType.RoundEnded]: RoundEndedPayload,
  [ClientMessageType.UpvoteQuestion]: UpvoteQuestionPayload,
  [ClientMessageType.UserJoinedSpace]: UserJoinedSpacePayload,
  [ClientMessageType.SpaceCreated]: SpaceCreatedPayload,
  [ClientMessageType.GetQuestionsForSpace]: GetQuestionsForSpacePayload,
  [ClientMessageType.GetSpaceInfo]: GetSpaceInfoPayload,
  [ClientMessageType.GetAllSpaces]: GetAllSpacesPayload,
  [ClientMessageType.Error]: ErrorPayload,
};

export function emitClientEvent<T extends ClientMessageType>(
  ws: IWebSocket,
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

export function createClientHandlerManager(ws: IWebSocket) {
  const handlers: {
    [key in ClientMessageType]?: (payload: any, error: z.ZodError | null) => void;
  } = {};

  ws.onMessage((data) => {
    const message = JSON.parse(data);
    const handler = handlers[message.type as ClientMessageType];
    console.debug("Received message:", message);

    if (handler) {
      const validationResult = ClientMessagePayloads[
        message.type as ClientMessageType
      ].safeParse(message.payload);

      if (validationResult.success) {
        handler(validationResult.data, null);
      } else {
        handler(null, validationResult.error);
      }
    }
  });

  return {
    registerHandler<T extends ClientMessageType>(
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
