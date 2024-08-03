import { IWebSocket } from "@ruchir28/ws-events";
export class FrontEndWebSocket implements IWebSocket {
    ws: WebSocket;
    constructor(url: string) {
        this.ws = new WebSocket(url);
    }
    send(data: string) {
        if(this.ws.readyState !== this.ws.OPEN) {
            console.error('WebSocket is not open');
        }
        this.ws.send(data);
    };
    onMessage(handler: (data: string) => void) {
        this.ws.addEventListener('message', (event) => {
            let data = event.data.toString();
            handler(data);
        });
    };
}