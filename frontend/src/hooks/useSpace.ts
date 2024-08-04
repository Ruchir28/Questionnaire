import { useEffect, useMemo, useState } from "react";
import { ClientMessageType, MessageType, emitEvent } from "@ruchir28/ws-events"; // Import your message types
import { createClientHandlerManager } from "@ruchir28/ws-events";
import { toast } from "react-toastify";
import useStore, {WebSocketStatus} from "./useStore";

function useSpace(spaceId: string) {
  const { webSocket, webSocketStatus, isAuthenticated} = useStore();

  // Example state variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<boolean>(false);
  const [roundEnded, setRoundEnded] = useState<boolean>(false);

  
  const clientHandler = useMemo(() => {
      return webSocket ? createClientHandlerManager(webSocket) : null;
  }, [webSocket]);


  useEffect(() => {
    console.log("In here 1")
    if (isAuthenticated && webSocketStatus === WebSocketStatus.Connected &&  webSocket && clientHandler) {
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
          } else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
          }
        }
      );

      const unregisterUserJoined = clientHandler.registerHandler(
        ClientMessageType.UserJoinedSpace,
        (payload, error) => {
          if (payload) {
            console.log("User Joined", payload);
            setUsers((prevUsers) => [...prevUsers, payload.userId]);
          } else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
          }
        }
      );

      const unregisterRoundStarted = clientHandler.registerHandler(
        ClientMessageType.RoundStarted,
        (payload, error) => {
          if (payload?.spaceId === spaceId) {
            setCurrentRound(true);
          }  else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
          }
        } 
      );

      const unregisterRoundEnded = clientHandler.registerHandler(
        ClientMessageType.RoundEnded,
        (payload, error) => {
          if (payload?.spaceId === spaceId) {
            setCurrentRound(false);
            setRoundEnded(true);
          }  else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
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
          console.log("Get Questions for space -->", payload);
          if (payload) {
            const sortedQuestions = payload.questions.sort((a,b)=>b.upvotes - a.upvotes).map((question) => {
              return new Question(question.questionId,question.text,question.upvotes);
            });
            setQuestions([...sortedQuestions]);
          }  else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
          }
        }
      );

      const unregisterGetSpaceInfo = clientHandler.registerHandler(ClientMessageType.GetSpaceInfo,(payload,error) => {
        if(payload) {
          console.log("Get Space Info",payload);
          setUsers(() => [...payload.users.map((user) => user.userName)]);
          const sortedQuestions = payload.questions.sort((a,b)=>b.upvotes - a.upvotes).map((question) => {
            return new Question(question.questionId,question.text,question.upvotes);
          });
          setQuestions(() => [...sortedQuestions]);
          setCurrentRound(payload.currentRound);
        }  else {
          const errorMsg = error?.message ?? "Something Went Wrong";
          if(errorMsg) toast.error(errorMsg)
        }
      });

      const unregisterError = clientHandler.registerHandler(
        ClientMessageType.Error,
        (payload, error) => {
          if (payload) {
            console.error("Error", payload, error?.stack);
            const errorMsg = payload?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)

          }  else {
            const errorMsg = error?.message ?? "Something Went Wrong";
            if(errorMsg) toast.error(errorMsg)
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
        unregisterRoundEnded();
      };
    }
  }, [spaceId, isAuthenticated, webSocket, clientHandler,webSocketStatus]);

  return {
    questions,
    users,
    currentRound,
    roundEnded,
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
