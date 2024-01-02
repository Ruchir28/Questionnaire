import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSpace from "../hooks/useSpace";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageType,emitEvent } from "@ruchir28/ws-events";

interface SpaceProps {}

const Space: React.FC<SpaceProps> = () => {
  const { spaceId } = useParams();
  const space = useSpace(spaceId!);
  const { webSocket, isConnected } = useWebSocket();
  const [question, setQuestion] = React.useState<string>("");
  return (
    <div> 
      SPACE {spaceId}
      <div>
        {space?.questions.map((question) => {
          return (
            <div>
              {question.text}
              {question.upvotes}
            </div>
          );
        })}
      </div>
      <div>
        Users
        {space?.users.map((user) => {
          return <p>{user}</p>;
        })}
      </div>
      <div>Active Quetionairre : {space.currentRound ? "true" : "false"}</div>
      <button onClick={() => {
        emitEvent(webSocket!,MessageType.CreateQuestionaireRound,{
            spaceId: spaceId!
        });
      }}>Start Round</button>
      <div>
        Ask a Question
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></input>
        <button onClick={() => {
            emitEvent(webSocket!,MessageType.PostQuestion,{
                spaceId: spaceId!,
                text: question
            });
        }}>
            Submit
        </button>
      </div>
    </div>
  );
};

export default Space;
