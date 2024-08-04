import { useNavigate } from "react-router-dom";
import useStore, {WebSocketStatus} from "../hooks/useStore";

function Navbar() {

    const { webSocketStatus } = useStore();
    const navigate = useNavigate();
    const {logout} = useStore();

    return (
        <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <div onClick={() => {
            navigate("/");
          }}>
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
                  logout();
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