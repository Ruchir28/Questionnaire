import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSpace from "../hooks/useSpace";
import { MessageType, emitEvent } from "@ruchir28/ws-events";
import withAuth from "../hoc/withAuth";
import Question from "./Question";
import {useNavigate} from "react-router-dom"
import useStore from "../hooks/useStore";

interface SpaceProps {}

const Space: React.FC<SpaceProps> = () => {
  const { spaceId } = useParams();
  const { currentRound, questions, users, roundEnded } = useSpace(spaceId!);
  const { webSocket, webSocketStatus } = useStore();
  const [viewUsers, setViewUsers] = React.useState<boolean>(false);
  const [question, setQuestion] = React.useState<string>("");
  const navigate = useNavigate();


  useEffect(() => {
    
    if(roundEnded) {
      // redirect to home
      navigate("/");
    }
  }, [roundEnded]);


  return (
    <div className="container">
      <div className="bg-light text-center mt-3">
        <h2> SPACE: {spaceId} </h2>
      </div>
      <div className="mb-2">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setViewUsers(!viewUsers);
          }}
        >
          Users:{" "}
          <span className="badge bg-primary rounded-pill">{users.length}</span>
        </button>
        {viewUsers && (
          <div className="list-group m-2">
            {users.map((user) => {
              return (
                <p className="p-1 m-1" key={user}>
                  {user}
                </p>
              );
            })}
          </div>
        )}
      </div>
      <div className="list-group">
        {questions.map((question) => {
          return (
            <div className="list-group-item " key={question.id}>
              <Question
                questionText={question.text}
                id={question.id}
                upvotes={question.upvotes}
                key={question.id}
                onUpvote={() => {
                  emitEvent(webSocket!, MessageType.UpvoteQuestion, {
                    spaceId: spaceId!,
                    questionId: question.id,
                  });
                }}
              ></Question>
            </div>
          );
        })}
      </div>
      <div className="my-3">
        {!roundEnded && (        <div className="row">
          <div className="col-5 m-auto text-center border-0">
            <h5>Active Quetionairre : {currentRound ? "true" : "false"}</h5>
          </div>
          {!currentRound ? (
            <div className="col-5 text-center m-auto">
              <button
                className="btn btn-primary m-2 w-100"
                onClick={() => {
                  emitEvent(webSocket!, MessageType.CreateQuestionaireRound, {
                    spaceId: spaceId!,
                  });
                }}
              >
                Start Round
              </button>
            </div>
          ) : (
            <div className="col-5 text-center m-auto">
              <button
                className="btn btn-primary m-2 w-100"
                onClick={() => {
                  emitEvent(webSocket!, MessageType.EndCurrentRound, {
                    spaceId: spaceId!,
                  });
                }}
              >
                End Round
              </button>
            </div>
          )}
        </div>
)}
      </div>
      <div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Ask a Question
          </span>
          <input
            type="text"
            className="form-control"
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-default"
            onChange={(e) => setQuestion(e.target.value)}
            value={question}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            emitEvent(webSocket!, MessageType.PostQuestion, {
              spaceId: spaceId!,
              text: question,
            });
            setQuestion("");
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default withAuth(Space);
