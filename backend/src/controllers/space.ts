import { QuestionaireRound } from "../models/QuestionaireRound";
import { Space } from "../models/Space";
import { User } from "../models/User";
import {userController} from './user'

let spaceMapping : Record<string,Space> = {};
let user_controller = userController();

export function spaceController() {
    return {
        createSpace: (hostId: string) => {
            const host = user_controller.getUser(hostId);
            if(!host) {
                throw new Error('User not found');
            }
            const space = new Space(host);
            spaceMapping[space.id] = space;
            return space;
        },
        getSpace: (spaceId: string) => {
            return spaceMapping[spaceId];
        },
        deleteSpace: (spaceId: string) => {
            delete spaceMapping[spaceId];
        },
        createQuestionaireRound: (userId: string,spaceId: string): QuestionaireRound => {
            const space = spaceMapping[spaceId];
            
            if (!space) {
                throw new Error('Space not found');
            }
            if(space.onGoingQuestionaireRound) {
                throw new Error('Questionaire round already in progress');
            }
            if(userId !== space.host.id) {
                throw new Error('Only host can create a new round');
            }
            
            space.createQuestionaireRound();
            return space.onGoingQuestionaireRound!;
        },
        broadCastQuestionaireRoundEvent: (spaceId: string, event: string) => {
            const space = spaceMapping[spaceId];
            if (!space) {
                throw new Error('Space not found');
            }
            space.users.forEach(u => {
                console.log('sending event to user', u.id);
                const userConnection = user_controller.getUserConnection(u.id);
                if(userConnection) {
                    userConnection.send(
                        JSON.stringify({
                            message: event,
                            spaceId: space.id,
                        })
                    )
                }
            })
        }
    }
}
