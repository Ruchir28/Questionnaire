import { useEffect, useMemo, useState } from "react";
import useAuth, { AuthStatus } from "./useAuth";
import { useWebSocket } from "./useWebSocket";
 import { ClientMessageType } from "@ruchir28/ws-events";
import { createClientHandlerManager } from "@ruchir28/ws-events";

export const useSpaceManager = () => {
    const authStatus = useAuth();
    const { isConnected,webSocket } = useWebSocket();

    useEffect(() => {
        console.log("updated in space manager",isConnected);
    },[isConnected]);

    const clientHandler = useMemo(() => {
        return webSocket ? createClientHandlerManager(webSocket) : null;
    }, [isConnected,webSocket]);

    const [spaces,setSpaces] = useState<string[]>([]);

    useEffect(() => {
        console.log("INSIDE USE EFFECT FOR SPACE MANAGER",isConnected,webSocket,authStatus,clientHandler);
        if(isConnected && webSocket && authStatus === AuthStatus.Authenticated && clientHandler) {
        
            console.log("Registering Space Created Handler");
            const unregisterSpaceCreated = clientHandler.registerHandler(ClientMessageType.SpaceCreated,(payload,error) => {
                if(payload) {
                    console.log("Space Created",payload);
                    setSpaces((prevSpaces) => [...prevSpaces,payload.spaceId]);
                }
            });

            return () => {
                unregisterSpaceCreated();
            }
        }
    },[webSocket,clientHandler,authStatus,isConnected]);

    return {
        spaces
    }
}

export default useSpaceManager;