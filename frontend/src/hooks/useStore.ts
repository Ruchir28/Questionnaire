import {createWithEqualityFn} from 'zustand/traditional';
import { FrontEndWebSocket } from "../utils/FrontendWebSocket";
import { WEBSOCKET_URL } from "../constant";

export enum AuthStatus {
  Loading = "Loading",
  Authenticated = "Authenticated",
  NotAuthenticated = "NotAuthenticated",
}

export enum WebSocketStatus {
  Uninitialized = "Uninitialized",
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
}

interface State {
  isAuthenticated: AuthStatus;
  authToken: string | null;
  webSocketStatus: WebSocketStatus;
  webSocket: FrontEndWebSocket | null;
  login: (token: string) => void;
  logout: () => void;
  initWebSocket: () => void;
  closeWebSocket: () => void;
}

const useStore = createWithEqualityFn<State>((set, get) => ({
  isAuthenticated: AuthStatus.Loading,
  authToken: null,
  webSocketStatus: WebSocketStatus.Uninitialized,
  webSocket: null,
  login: (token: string) => {
    document.cookie = `authToken=${token}; path=/;`;
    set({ authToken: token, isAuthenticated: AuthStatus.Authenticated });
    get().initWebSocket();
  },
  logout: () => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    set({ authToken: null, isAuthenticated: AuthStatus.NotAuthenticated });
    get().closeWebSocket();
  },
  initWebSocket: () => {
    const { authToken, webSocketStatus, webSocket } = get();
    if (webSocket?.ws?.readyState === 0 || webSocket?.ws?.readyState === 1) return;

    if (authToken && (!webSocket || webSocketStatus === WebSocketStatus.Disconnected)) {
      const newWebSocket = new FrontEndWebSocket(`${WEBSOCKET_URL}`);
      set({ webSocket: newWebSocket });

      const handleOpen = () => set({ webSocketStatus: WebSocketStatus.Connected });
      const handleError = () => set({ webSocketStatus: WebSocketStatus.Disconnected });
      const handleClose = () => set({ webSocketStatus: WebSocketStatus.Disconnected });

      newWebSocket.ws.addEventListener("open", handleOpen);
      newWebSocket.ws.addEventListener("error", handleError);
      newWebSocket.ws.addEventListener("close", handleClose);

      return () => {
        newWebSocket.ws.removeEventListener("open", handleOpen);
        newWebSocket.ws.removeEventListener("error", handleError);
        newWebSocket.ws.removeEventListener("close", handleClose);
      };
    }
  },
  closeWebSocket: () => {
    const { webSocket } = get();
    if (webSocket?.ws.readyState === 1) {
      webSocket.ws.close();
    }
    set({ webSocketStatus: WebSocketStatus.Disconnected });
  },
}));

const parseCookies = (cookies: string) => {
  const list: { [key: string]: string } = {};
  cookies &&
    cookies.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const key = parts.shift()?.trim();
      const value = decodeURI(parts.join("=")?.trim());
      if (key && value) {
        list[key] = value;
      }
    });
  return list;
};
// Initialize authentication state based on cookie
const initAuthState = () => {
  const token = parseCookies(document.cookie)["authToken"];
  const store = useStore.getState();
  if (token) {
    store.login(token);
  } else {
    store.logout();
  }
};

// Call the function to initialize the auth state when the store is created
initAuthState();


export default useStore;

