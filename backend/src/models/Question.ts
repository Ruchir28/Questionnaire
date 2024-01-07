import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

export class Question {
    id: string;
    text: string;
    upvotes: Set<string>;
    user: User;
    constructor(text: string, user: User) {
        this.id = uuidv4();
        this.text = text;
        this.user = user;
        this.upvotes = new Set<string>();
    }
    upvote(userId: string) {
        console.log(userId);
        let contains = this.upvotes.has(userId);
        this.upvotes.add(userId);
        return !contains;
    }
}