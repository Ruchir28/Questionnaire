import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSpace from "../hooks/useSpace";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageType,emitEvent } from "@ruchir28/ws-events";
import withAuth from "../hoc/withAuth";

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
        Users
        {space?.users.map((user) => {
          return <p key={user}>{user}</p>;
        })}
      </div>

      <div>
        {space?.questions.map((question) => {
          return (
            <div key={question.id} style={{
              display: 'flex',
              justifyContent: 'space-around',
              border: '1.5px solid black',
              marginBottom: '8px',
              maxWidth: '80%'
            }}>
              <div> {question.text} </div>
              <div> {question.upvotes} </div>
              <button onClick={() => {
                emitEvent(webSocket!,MessageType.UpvoteQuestion,{
                  spaceId: spaceId!,
                  questionId: question.id
                });
              }}> ▲ </button>
            </div>
          );
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

export default withAuth(Space);
