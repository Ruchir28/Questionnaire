import React from 'react';
import { useWebSocket, WebSocketStatus } from '../hooks/useWebSocket';
import withAuth from '../hoc/withAuth';
import {emitEvent,MessageType} from '@ruchir28/ws-events'
import useSpaceManager from '../hooks/useSpaceManager';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Define the type of the props object that will be passed to the component

// Define the component as a function that takes in the props object and returns a JSX element
const Home = () => {
    
    const {webSocket,webSocketStatus} = useWebSocket();
    const [spaceName, setSpaceName] = React.useState<string>('');
    const [joinSpace,setJoinSpace] = React.useState<string>('');
     const {spaces} = useSpaceManager()
    return (
        <div>
            <h1>Quetionairre</h1>
            <p>Connection Status : {webSocketStatus === WebSocketStatus.Connected ? 'true' : 'false'}</p>
            <input value={spaceName} onChange={e => setSpaceName(e.target.value)}></input>
            <button onClick={() => {
                if(webSocket && webSocketStatus === WebSocketStatus.Connected) {
                    console.log("Emitting event",webSocket);
                     emitEvent(webSocket,MessageType.CreateSpace,{spaceName});
                } else {
                    toast.error("Not connected !! Login Again");
                    console.log("Socket not connected");
                }
            }}> 
                Create Space 
            </button>
            <ul>
            {spaces.map(space => {
                return (
                    <li key={space}>
                        <Link to={`/space/${space}`}>{space}</Link>
                    </li>
                )
            })}
            </ul>
            <div>
                Join Space 
                <input value={joinSpace} onChange={e => setJoinSpace(e.target.value)}></input>
                <button onClick={() => {
                    emitEvent(webSocket!,MessageType.JoinSpace,{spaceId: joinSpace});
                }}>Join</button>
            </div>
        </div>
    );
};

export default withAuth(Home);
