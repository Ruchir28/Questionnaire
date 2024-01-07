import {
  createHandlerManager,
  emitEvent,
  MessageType,
} from "@ruchir28/ws-events/serverEvents";
import {
  emitClientEvent,
  ClientMessageType,
} from "@ruchir28/ws-events/clientEvents";
import { spaceController } from "./space";
import { CustomWebSocket } from "../types/CustomWebSocket";
import { Question } from "../models/Question";

export function handleWsEvents(ws: CustomWebSocket) {
  console.log("New Connection");

  let handlerManager = createHandlerManager(ws);

  let space_controller = spaceController();

  handlerManager.registerHandler(MessageType.VerifyUser, (payload, error) => {
    try {
      if (error || !payload) {
        throw new Error("Invalid payload:" + error?.message);
      }
      if (!ws.user) {
        throw new Error("User Not logged in");
      }
      emitClientEvent(ws, ClientMessageType.UserVerficationStatus, {
        status: true,
      });
    } catch (e: any) {
      emitClientEvent(ws, ClientMessageType.UserVerficationStatus, {
        status: false,
      });
    }
  });

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
      emitClientEvent(ws, ClientMessageType.SpaceCreated, {
        spaceId: space.id,
      });
      console.log("Space Created", space.id);
    } catch (e: any) {
      ws.send(
        JSON.stringify({
          message: e.message,
        })
      );
    }
  });

  handlerManager.registerHandler(MessageType.JoinSpace, (payload, error) => {
    try {
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
      let space = space_controller.getSpace(payload.spaceId);
      if (!space) {
        throw new Error("Space not found");
      }
      if(space.users.find((u) => u.id === ws.user!.id)) {
        throw new Error("User already in space");
      }
      space.addUser(ws.user);
      space_controller.getUsersWithConnectionInSpace(space.id).map((userWs) => {
        emitClientEvent(userWs, ClientMessageType.UserJoinedSpace, {
          spaceId: space.id,
          userId: ws.user!.id, // taken care in zod validation
          userName: ws.user!.name,
        });
      });
    } catch (e: any) {
      console.error(e);
      emitClientEvent(ws, ClientMessageType.Error, {
        message: e.message,
      });
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
        space_controller.createQuestionaireRound(ws.user.id, space.id);
        space_controller
          .getUsersWithConnectionInSpace(space.id)
          .map((userWs) => {
            emitClientEvent(userWs, ClientMessageType.RoundStarted, {
              spaceId: space.id, // taken care in zod validatio
            });
          });
      } catch (e: any) {
        console.error(e);
        emitClientEvent(ws, ClientMessageType.Error, {
          message: e.message,
        }); 
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
      space_controller.getUsersWithConnectionInSpace(space.id).map((userWs) => {
        emitClientEvent(userWs, ClientMessageType.NewQuestion, {
          text: question.text,
          questionId: question.id,
          userId: question.user.id,
          userName: question.user.name,
        });
      });
    } catch (e: any) {
      emitClientEvent(ws, ClientMessageType.Error, {
        message: e.message,
      });
    }
  });

  handlerManager.registerHandler(                          
    MessageType.UpvoteQuestion,
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
        if (!space.onGoingQuestionaireRound) {
          throw new Error("No Round in progress");
        }
        let question = space.onGoingQuestionaireRound.getQuestion(
          payload.questionId
        );
        if (!question) {
          throw new Error("Question not found");
        }
        if(space.onGoingQuestionaireRound.upvoteQuestion(question.id, ws.user.id)) {

        // ws.send(
        //   JSON.stringify({
        //     message: "Question added",
        //     spaceId: space.id,
        //     questionId: payload.questionId,
        //   })
        // );
        let questionId = question.id;
        space_controller
          .getUsersWithConnectionInSpace(space.id)
          .map((userWs) => {
            emitClientEvent(userWs, ClientMessageType.UpvoteQuestion, {
              questionId: questionId,
              spaceId: space.id,
            });
          });
        }
      } catch (e: any) {
        console.log(e);
        emitClientEvent(ws, ClientMessageType.Error, {
          message: e.message,
        });
      }
    }
  );

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
        emitClientEvent(ws, ClientMessageType.Error, {
          message: e.message,
        });
      }
    }
  );

  handlerManager.registerHandler(MessageType.GetQuestions, (payload, error) => {
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
      let questions = space.onGoingQuestionaireRound.questions;
        emitClientEvent(ws, ClientMessageType.GetQuestionsForSpace, {
          questions: questions.map((q) => ({
            text: q.text,
            questionId: q.id,
            userName: q.user.name,
            upvotes: q.upvotes.size,
          })),
          spaceId: space.id,
        });
    } catch (e: any) {
      console.error(e);
      emitClientEvent(ws, ClientMessageType.Error, {
        message: e.message,
      });
    }
  });

  handlerManager.registerHandler(MessageType.GetSpaceInfo, (payload, error) => {
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
      let questions = space.onGoingQuestionaireRound ? space.onGoingQuestionaireRound.questions : [];
        emitClientEvent(ws, ClientMessageType.GetSpaceInfo, {
          questions: questions.map((q) => ({
            text: q.text,
            questionId: q.id,
            userName: q.user.name,
            upvotes: q.upvotes.size,
          })),
          users: space.users.map((u) => ({
            userName: u.name,
          })),
          spaceId: space.id,
          currentRound: space.onGoingQuestionaireRound ? true : false,
        });
    } catch (e: any) {
      console.error(e);
      emitClientEvent(ws, ClientMessageType.Error, {
        message: e.message,
      });
    }
  });

  handlerManager.registerHandler(MessageType.GetSpaces, (payload, error) => {
    try {
      if (error || !payload) {
        throw new Error("Invalid payload:" + error);
      }
      if (!ws.user) {
        throw new Error("User Not logged in");
      }
      let spaceIds = space_controller.getSpacesForUser(ws.user.id);
      emitClientEvent(ws, ClientMessageType.GetAllSpaces, {
        spaceIds,
      });
    } catch (e: any) {
      console.error(e);
      emitClientEvent(ws, ClientMessageType.Error, {
        message: e.message,
      });
    }
  });
}
