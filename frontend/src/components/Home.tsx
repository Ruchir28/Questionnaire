import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import withAuth from '../hoc/withAuth';
import {emitEvent,MessageType} from '@ruchir28/ws-events'
import useSpaceManager from '../hooks/useSpaceManager';
import { Link } from 'react-router-dom';

// Define the type of the props object that will be passed to the component

// Define the component as a function that takes in the props object and returns a JSX element
const Home = () => {
    
    const {webSocket,isConnected} = useWebSocket();
    const [spaceName, setSpaceName] = React.useState<string>('');
     const {spaces} = useSpaceManager()
    if(!webSocket && !isConnected) {
        return <div>Connecting...</div>
    }
    return (
        <div>
            <h1>Quetionairre</h1>
            <p>Connection Status : {isConnected ? 'true' : 'false'}</p>
            <input value={spaceName} onChange={e => setSpaceName(e.target.value)}></input>
            <button onClick={() => {
                if(webSocket && isConnected) {
                     emitEvent(webSocket,MessageType.CreateSpace,{spaceName});
                } else {
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
        </div>
    );
};

export default withAuth(Home);
