// TO MAKE LIBRARY WEBSOCKET AGNOSTIC

export interface IWebSocket {
    send(data: string): void;
    onMessage(handler: (data: string) => void): void;

}