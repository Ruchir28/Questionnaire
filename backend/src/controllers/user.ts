import { User } from "../models/User";
import express from 'express';

let users : Record<string, User> = {};

export function userController() {
    return {
        createUser: (name: string) => {
            const user = new User(name);
            users[user.id] = user;
            return user;
        },
        getUser: (userId: string) => {
            return users[userId];
        },
        deleteUser: (userId: string) => {
            delete users[userId];
        }
    }
}

export function logIn(req: express.Request, res: express.Response) {
    const userName = req.body.userName;
    if(!userName) {
        return res.status(400).send('userName is required');
    }
    const user = userController().createUser(userName);
    return res.json({
        userId: user.id
    });
}
