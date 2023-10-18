import { User } from "../models/User";
import {WebSocket} from 'ws';
import {IWebSocket} from '@ruchir28/ws-events/IWebSocket'

export class CustomWebSocket implements IWebSocket{
    ws: WebSocket;
    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    user?: User;
    send(data: string) {
        this.ws.send(data);
    };
    onMessage(handler: (data: string) => void) {
        this.ws.addEventListener('message', (event) => {
            let data = event.data.toString();
            handler(data);
        });
    };  
}
