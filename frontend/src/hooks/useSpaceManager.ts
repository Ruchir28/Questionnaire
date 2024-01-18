import { useEffect, useMemo, useState } from "react";
import useAuth, { AuthStatus } from "./useAuth";
import { WebSocketStatus, useWebSocket } from "./useWebSocket";
 import { ClientMessageType, emitEvent, MessageType } from "@ruchir28/ws-events";
import { createClientHandlerManager } from "@ruchir28/ws-events";
import { toast } from "react-toastify";
const useSpaceManager = () => {
    const authStatus = useAuth();
    const { webSocketStatus,webSocket } = useWebSocket();

    useEffect(() => {
        console.log("updated in space manager",webSocketStatus);
    },[webSocketStatus]);

    const clientHandler = useMemo(() => {
        return webSocket ? createClientHandlerManager(webSocket) : null;
    }, [webSocket]);

    const [spaces,setSpaces] = useState<string[]>([]);

    useEffect(() => {
        if(webSocketStatus === WebSocketStatus.Connected && webSocket && authStatus === AuthStatus.Authenticated && clientHandler) {
        
            console.log("Registering Space Created Handler");

            const unregisterGetSpacesInfo = clientHandler.registerHandler(ClientMessageType.GetAllSpaces,(payload,error) => {
                if(payload) {
                    console.log("Get All Spaces",payload);
                     setSpaces(payload.spaceIds);
                } else {
                    console.log("Error",error);
                }
            });

            const unregisterSpaceCreated = clientHandler.registerHandler(ClientMessageType.SpaceCreated,(payload,error) => {
                if(payload) {
                    console.log("Space Created",payload);
                    setSpaces((prevSpaces) => [...prevSpaces,payload.spaceId]);
                } else {
                    console.log("Error",error);
                }
            });

            const unregisterSpaceJoined = clientHandler.registerHandler(ClientMessageType.UserJoinedSpace,(payload,error) => {
                if(payload) {
                    setSpaces((prevSpaces) => [...prevSpaces,payload.spaceId]);
                } else {
                    console.log("Error",error);
                }
            });

            const unregisterError = clientHandler.registerHandler(ClientMessageType.Error,(payload,error) => {
                if(payload) {
                    console.log("Error", payload.message);
                    toast.error(payload.message);
                } else {
                    console.log("Error", error);
                }
            });

            emitEvent(webSocket,MessageType.GetSpaces,{});

            return () => {
                unregisterSpaceCreated();
                unregisterGetSpacesInfo();
                unregisterSpaceJoined();
                unregisterError();
            }
        }
    },[webSocket,clientHandler,authStatus,webSocketStatus]);

    return {
        spaces
    }
}

export default useSpaceManager;