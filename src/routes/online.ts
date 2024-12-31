import type { User } from "#src/types.ts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocketServer } from "ws";
import util from "util";

interface Room {
  name: string;
  users: WSUser[];
}

interface WSUser extends User {
  ws: WebSocket;
  guest?: boolean;
}

interface BroadcastData {
  room: Room;
  user: WSUser;
  event: string;
  data?: object;
}

export default (
  fastify: FastifyInstance & { websocketServer: WebSocketServer },
) => {
  const broadcast = (data: BroadcastData) => {
    const otherUsers = data.room.users.filter(
      (user) => user.id != data.user.id,
    );

    for (const user of otherUsers) {
      // Resolve circular structure error
      const ws = user.ws;
      const dataWS = data.user.ws;

      delete user.ws;
      delete data.user.ws;

      if (ws.readyState === WebSocket.OPEN) {
        console.log(util.inspect(data, { depth: null }));

        // console.log("Data", data);
        ws.send(JSON.stringify(data));

        user.ws = ws;
        data.user.ws = dataWS;
      }
    }
  };

  const rooms: Room[] = [];

  fastify.get(
    "/",
    { websocket: true },
    // @ts-ignore
    (ws: WebSocket, req: FastifyRequest) => {
      if (!rooms.find((room) => room.name === req.ip)) {
        rooms.push({ name: req.ip, users: [] });
      }

      const room = rooms.find((room) => room.name === req.ip);
      let user = {} as WSUser;

      if (!req.headers.user) {
        user = {
          id: req.id,
          username:
            (req.headers.username as string) || `User #${req.id.split("-")[1]}`,
          guest: true,
          ws,
        };
      }

      room.users.push(user);
      broadcast({ room, user, event: "join", data: rooms });

      ws.onmessage = ({ data }) => {
        broadcast({ room, user, event: "message", data });
      };

      ws.onclose = () => {
        if (room.users.length === 1) {
          rooms.splice(rooms.indexOf(room), 1);
        } else {
          room.users = room.users.filter((u) => user.id != u.id);
        }

        broadcast({ room, user, event: "leave", data: rooms });
      };
    },
  );
};
