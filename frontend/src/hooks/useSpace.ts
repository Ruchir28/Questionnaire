import { useEffect, useMemo, useState } from "react";
import { ClientMessageType, MessageType, emitClientEvent, emitEvent } from "@ruchir28/ws-events"; // Import your message types
import { useWebSocket } from "./useWebSocket";
import { createClientHandlerManager } from "@ruchir28/ws-events";
import useAuth from "./useAuth";

function useSpace(spaceId: string) {
  const { webSocket, isConnected} = useWebSocket();
  const isAuthenticated = useAuth();

  // Example state variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<boolean>(false);

  
  const clientHandler = useMemo(() => {
      return webSocket ? createClientHandlerManager(webSocket) : null;
  }, [webSocket]);


  useEffect(() => {
    console.log("In here 1")
    if (isAuthenticated && isConnected &&  webSocket && clientHandler) {
      console.log("In here 2")
      // Register handlers for different message types
      const unregisterNewQuestion = clientHandler.registerHandler(
        ClientMessageType.NewQuestion,
        (payload, error) => {
          if (payload) {
            setQuestions((prevQuestions) => [
              ...prevQuestions,
              new Question(payload.questionId, payload.text, 0),
            ]);
          }
        }
      );

      const unregisterUserJoined = clientHandler.registerHandler(
        ClientMessageType.UserJoinedSpace,
        (payload, error) => {
          if (payload) {
            console.log("User Joined", payload);
            setUsers((prevUsers) => [...prevUsers, payload.userId]);
          }
        }
      );

      const unregisterRoundStarted = clientHandler.registerHandler(
        ClientMessageType.RoundStarted,
        (payload, error) => {
          if (payload?.spaceId === spaceId) {
            setCurrentRound(true);
          }
        }
      );

      const unregisterRoundEnded = clientHandler.registerHandler(
        ClientMessageType.RoundEnded,
        (payload, error) => {
          if (payload?.spaceId === spaceId) {
            setCurrentRound(false);
          }
        }
      );

      const unregisterUpvoteQuestion = clientHandler.registerHandler(
        ClientMessageType.UpvoteQuestion,
        (payload, error) => {
          if (payload) {
            setQuestions((prevQuestions) => {
              const question = prevQuestions.find(
                (question) => question.id === payload.questionId
              );
              if (question) {
                question.upvotes += 1;
              }
              const sortedQuestions = prevQuestions.sort((a,b)=>b.upvotes-a.upvotes);
              return [...sortedQuestions];
            });
          }
        }
      );

      const unregisterGetQuestionsForSpace = clientHandler.registerHandler(
        ClientMessageType.GetQuestionsForSpace,
        (payload, error) => {
          console.log("Get Questions for space", payload);
          if (payload) {
            setQuestions((prevQuestions) => {
              return [...payload.questions.map((question) => new Question(question.questionId, question.text, question.upvotes))];
            });
          }
        }
      );

      const unregisterGetSpaceInfo = clientHandler.registerHandler(ClientMessageType.GetSpaceInfo,(payload,error) => {
        if(payload) {
          console.log("Get Space Info",payload);
          setUsers(() => [...payload.users.map((user) => user.userName)]);
          setQuestions(() => [...payload.questions.map((question) => new Question(question.questionId, question.text, question.upvotes))]);
          setCurrentRound(payload.currentRound);
        }
      });

      const unregisterError = clientHandler.registerHandler(
        ClientMessageType.Error,
        (payload, error) => {
          if (payload) {
            console.error("Error", payload);
          }
        }
      );

      emitEvent(webSocket, MessageType.GetSpaceInfo, {
        spaceId: spaceId
      });

      return () => {
        // Clean up: Unregister handlers
        unregisterNewQuestion();
        unregisterUserJoined();
        unregisterRoundStarted();
        unregisterRoundEnded();
        unregisterUpvoteQuestion();
        unregisterGetQuestionsForSpace();
        unregisterError();
        unregisterGetSpaceInfo();
      };
    }
  }, [spaceId, isAuthenticated, webSocket, clientHandler,isConnected]);

  return {
    questions,
    users,
    currentRound
  };
}

class Question {
  id: string;
  text: string;
  upvotes: number;
  constructor(id: string, text: string, upvotes: number) {
    this.id = id;
    this.text = text;
    this.upvotes = upvotes;
  }
}

export default useSpace;
