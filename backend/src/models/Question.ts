import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

export class Question {
    id: string;
    text: string;
    upvotes: number;
    user: User;
    constructor(text: string, user: User) {
        this.id = uuidv4();
        this.text = text;
        this.user = user;
        this.upvotes = 0;
    }
    upvote() {
        this.upvotes++;
    }
}