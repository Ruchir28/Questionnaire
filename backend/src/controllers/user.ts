import { User } from "../models/User";
import express from "express";
import { CustomWebSocket } from "../types/CustomWebSocket";

let users: Record<string, User> = {};
let userConnectionMapping: Record<string, CustomWebSocket> = {};

export function userController() {
  return {
    createUser: (name: string) => {
      const user = new User(name);
      users[user.id] = user;
      return user;
    },
    addUserConnectionMapping: (userId: string, ws: CustomWebSocket) => {
      userConnectionMapping[userId] = ws;
      // removing user from mapping when connection is closed
      // TODO: check if it's causing some problems 
      ws.ws.on("close", () => {
        delete userConnectionMapping[userId];
      });
    },
    getUser: (userId: string) => {
      return users[userId];
    },
    getUserConnection: (userId: string) => {
      return userConnectionMapping[userId];
    },
    deleteUser: (userId: string) => {
      delete userConnectionMapping[userId];
      delete users[userId];
    },
  };
}

export function logIn(req: express.Request, res: express.Response) {
  const userName = req.body.userName;
  if (!userName) {
    return res.status(400).send("userName is required");
  }
  const user = userController().createUser(userName);
  return res.json({
    userId: user.id,
  });
}
