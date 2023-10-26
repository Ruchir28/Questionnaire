import { useEffect, useMemo, useState } from "react";
import { ClientMessageType } from "@ruchir28/ws-events"; // Import your message types
import { useWebSocket } from "./useWebSocket";
import { createClientHandlerManager } from "@ruchir28/ws-events";
import useAuth from "./useAuth";

function useSpace(spaceId: string) {
  const { webSocket } = useWebSocket();
  const isAuthenticated = useAuth();

  // Example state variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<boolean>(false);

  
  const clientHandler = useMemo(() => {
      return webSocket ? createClientHandlerManager(webSocket) : null;
  }, [webSocket]);


  useEffect(() => {
    if (isAuthenticated && webSocket && clientHandler) {
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

      return () => {
        // Clean up: Unregister handlers
        unregisterNewQuestion();
        unregisterUserJoined();
        unregisterRoundStarted();
        unregisterRoundEnded();
        unregisterUpvoteQuestion();
      };
    }
  }, [spaceId, isAuthenticated, webSocket, clientHandler]);

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
