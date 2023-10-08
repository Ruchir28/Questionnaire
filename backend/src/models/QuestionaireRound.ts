import { Question } from "./Question";
import { Space } from "./Space";
import { User } from "./User";

export class QuestionaireRound {
    readonly space: Space; 
    readonly host: User;
    users: User[];
    questions: Question[];


    constructor(host: User, space: Space) {
        this.space = space;
        this.host = host;
        this.users = [];
        this.questions = [];
    }

    addUser(user: User) {
        this.users.push(user);
    }

    removeUser(user: User) {
        this.users = this.users.filter(u => u.id !== user.id);
    }

    addQuestion(question: Question) {
        this.questions.push(question);
    }

    removeQuestion(question: Question) {    
        this.questions = this.questions.filter(q => q.text !== question.text);
    }

    upvoteQuestion(questionId: string) {
        this.questions.forEach(q => {
            if (q.id === questionId) {
                q.upvote();
            }
        });
    }

}