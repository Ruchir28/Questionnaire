import { WebSocketStatus, useWebSocket } from "../hooks/useWebSocket";

function Navbar() {

    const { webSocketStatus } = useWebSocket();

    return (
        <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <div>
            <h1 className="navbar-brand">Questionairre</h1>
          </div>
          <div className="d-flex justify-content-end">
            {/* take it to the right */}
            <div className="mx-5">
              {/* Connection status place at end */}
              <span
                className={`text-white btn btn-outline- ${
                  webSocketStatus === WebSocketStatus.Connected
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {webSocketStatus}
              </span>
            </div>
            <div className="mx-5">
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  console.log("Logging out");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
}


export default Navbar;