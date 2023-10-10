import { WebSocket } from "ws";
import {
  createHandlerManager,
  emitEvent,
  MessageType
} from "@ruchir28/ws-events/serverEvents";
import { spaceController } from "./space";
import { CustomWebSocket } from "../types/CustomWebSocket";
import { Question } from "../models/Question";

export function handleWsEvents(ws: CustomWebSocket) {
  console.log("New Connection");

  let handlerManager = createHandlerManager(ws);

  let space_controller = spaceController();

  handlerManager.registerHandler(MessageType.CreateSpace, (payload, error) => {
    try {
      if (error || !payload) {
        throw new Error("Invalid payload:" + error?.message);
      }
      if (!ws.user) {
        throw new Error("User Not logged in");
      }
      let space = space_controller.createSpace(ws.user.id);
      // return the created space id to user
      ws.send(
        JSON.stringify({
          message: "Space created",
          spaceId: space.id,
        })
      );
    } catch (e: any) {
      ws.send(
        JSON.stringify({
          message: e.message,
        })
      );
    }
  });

  handlerManager.registerHandler(MessageType.JoinSpace, (payload, error) => {
    if (error || !payload) {
      console.error("Invalid payload:", error);
      return;
    }
    if (!ws.user) {
      ws.send(
        JSON.stringify({
          message: "User Not logged in",
        })
      );
      return;
    }
    try {
      let space = space_controller.getSpace(payload.spaceId);
      if (!space) {
        throw new Error("Space not found");
      }
      space.addUser(ws.user);
      space_controller.broadCastQuestionaireRoundEvent(space.id, `${ws.user.name} joined the space`);
    } catch (e: any) {
      ws.send(
        JSON.stringify({
          message: e.message,
        })
      );
    }
  });

  handlerManager.registerHandler(
    MessageType.CreateQuestionaireRound,
    (payload, error) => {
      try {
        if (error || !payload) {
          throw new Error("Invalid payload:" + error);
        }
        if (!ws.user) {
          throw new Error("User Not logged in");
        }
        let space = space_controller.getSpace(payload.spaceId);
        if (!space) {
          throw new Error("Space not found");
        }
        if (space.onGoingQuestionaireRound) {
          throw new Error("Questionaire round already in progress");
        }
        if (space.host.id !== ws.user.id) {
          throw new Error("Only host can create a new round");
        }
        space_controller.createQuestionaireRound(ws.user.id,space.id);
        // ws.send(
        //   JSON.stringify({
        //     message: "Created a new Round",
        //     spaceId: space.id,
        //   })
        // );
        space_controller.broadCastQuestionaireRoundEvent(space.id, `Host started a questionairre round`);
      } catch (e: any) {
        ws.send(
          JSON.stringify({
            message: e.message,
          })
        );
      }
    }
  );

  handlerManager.registerHandler(MessageType.PostQuestion, (payload, error) => {
    try {
      if (error || !payload) {
        throw new Error("Invalid payload:" + error);
      }
      if (!ws.user) {
        throw new Error("User Not logged in");
      }
      let space = space_controller.getSpace(payload.spaceId);
      if (!space) {
        throw new Error("Space not found");
      }
      if (!space.onGoingQuestionaireRound) {
        throw new Error("No Round in progress");
      }
      let question = new Question(payload.text, ws.user);
      space.onGoingQuestionaireRound.addQuestion(question);
    //   ws.send(
    //     JSON.stringify({
    //       message: "Question added",
    //       spaceId: space.id,
    //       questionId: question.id,
    //     })
    //   );
      space_controller.broadCastQuestionaireRoundEvent(space.id, `${question.id} added, ${question.text}`);
    } catch (e: any) {
      ws.send(
        JSON.stringify({
          message: e.message,
        })
      );
    }
  });

  handlerManager.registerHandler(MessageType.UpvoteQuestion, (payload, error) => {
    try {
        if (error || !payload) {
          throw new Error("Invalid payload:" + error);
        }
        if (!ws.user) {
          throw new Error("User Not logged in");
        }
        let space = space_controller.getSpace(payload.spaceId);
        if (!space) {
          throw new Error("Space not found");
        }
        if (!space.onGoingQuestionaireRound) {
          throw new Error("No Round in progress");
        }
        let question = space.onGoingQuestionaireRound.getQuestion(payload.questionId);
        if(!question) {
            throw new Error("Question not found");
        }
        space.onGoingQuestionaireRound.upvoteQuestion(question.id);
        // ws.send(
        //   JSON.stringify({
        //     message: "Question added",
        //     spaceId: space.id,
        //     questionId: payload.questionId,
        //   })
        // );

      space_controller.broadCastQuestionaireRoundEvent(space.id, `${payload.questionId} upvoted, ${question.upvotes}`);
      } catch (e: any) {
        ws.send(
          JSON.stringify({
            message: e.message,
          })
        );
      }
    });

  handlerManager.registerHandler(
    MessageType.EndCurrentRound,
    (payload, error) => {
      if (error || !payload) {
        console.error("Invalid payload:", error);
        return;
      }
      if (!ws.user) {
        ws.send(
          JSON.stringify({
            message: "User Not logged in",
          })
        );
        return;
      }
      try {
        let space = space_controller.getSpace(payload.spaceId);
        if (!space) {
          throw new Error("Space not found");
        }
        if (!space.onGoingQuestionaireRound) {
          throw new Error("No Round in progress");
        }
        if (space.host.id !== ws.user.id) {
          throw new Error("Only host can end the round");
        }
        space.removeQuestionaireRound();
        ws.send(
          JSON.stringify({
            message: "Ended the Round",
            spaceId: space.id,
          })
        );
      } catch (e: any) {
        ws.send(
          JSON.stringify({
            message: e.message,
          })
        );
      }
    }
  );
}
