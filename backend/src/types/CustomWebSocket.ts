import { User } from "../models/User";
import {WebSocket} from 'ws';

export interface CustomWebSocket extends WebSocket {
    user?: User;
}
