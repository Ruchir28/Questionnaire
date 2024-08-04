import React from "react";
import withAuth from "../hoc/withAuth";
import { emitEvent, MessageType } from "@ruchir28/ws-events";
import useSpaceManager from "../hooks/useSpaceManager";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useStore, {WebSocketStatus} from "../hooks/useStore";

// Define the type of the props object that will be passed to the component

// Define the component as a function that takes in the props object and returns a JSX element
const Home = () => {
  const { webSocket, webSocketStatus } = useStore();
  const [spaceName, setSpaceName] = React.useState<string>("");
  const [joinSpace, setJoinSpace] = React.useState<string>("");
  const { spaces } = useSpaceManager();
  return (
    <div>
      <div className="d-flex my-3">
        <input
          type="text"
          className="form-control w-50 m-2 my-auto"
          placeholder="Create Space"
          aria-label="Recipient's username"
          aria-describedby="button-addon2"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary me-auto my-auto"
          type="button"
          id="button-addon2"
          onClick={() => {
            if (webSocket && webSocketStatus === WebSocketStatus.Connected) {
              console.log("Emitting event", webSocket);
              emitEvent(webSocket, MessageType.CreateSpace, { spaceName });
            } else {
              toast.error("Not connected !! Login Again");
              console.log("Socket not connected");
            }
          }}
        >
          Create
        </button>
      </div>
      <div>
        <ol className="list-group-numbered">
          {spaces.map((space) => {
            return (
              <li
                className="list-group-item list-group-item-warning p-2"
                key={space}
              >
                <Link to={`/space/${space}`}>{space}</Link>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="d-flex my-3">
        <input
          type="text"
          className="form-control w-50 m-2 my-auto"
          placeholder="Join Space"
          aria-label="Recipient's username"
          aria-describedby="button-addon2"
          value={joinSpace}
          onChange={(e) => setJoinSpace(e.target.value)}
        ></input>
        <button
          className="btn btn-outline-primary me-auto my-auto"
          type="button"
          id="button-addon2"
          onClick={() => {
            emitEvent(webSocket!, MessageType.JoinSpace, {
              spaceId: joinSpace,
            });
          }}
        >
          Join Space
        </button>
      </div>
    </div>
  );
};

export default withAuth(Home);
