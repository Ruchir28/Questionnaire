import { v4 as uuidv4 } from 'uuid'
import { QuestionaireRound } from "./QuestionaireRound";
import { User } from "./User";
export class Space {
    readonly id: string;
    readonly host: User;
    users: User[];
    onGoingQuestionaireRound: QuestionaireRound | undefined;
    chat: {
        message: String,
        user: User,
    }[] = [];

    constructor(host: User) {
        this.id = uuidv4();
        this.host = host;
        this.users = [host];
    }

    addUser(user: User) {
        this.users.push(user);
    }

    removeUser(user: User) {
        this.users = this.users.filter(u => u.id !== user.id);
    }

    createQuestionaireRound() {
        this.onGoingQuestionaireRound = new QuestionaireRound(this.host,this);
    }

    removeQuestionaireRound() {
        this.onGoingQuestionaireRound = undefined;
    }
}