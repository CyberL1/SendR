import type { EventData, WSUser } from "#src/types.ts";
import { rooms, sendTo } from "#src/utils/ws.ts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocketServer } from "ws";

export default (
  fastify: FastifyInstance & { websocketServer: WebSocketServer },
) => {
  fastify.get(
    "/",
    { websocket: true },
    // @ts-ignore
    (ws: WebSocket, req: FastifyRequest) => {
      if (!rooms.find((room) => room.name === req.ip)) {
        rooms.push({ name: req.ip, users: [], highestUserCount: 0 });
      }

      const room = rooms.find((room) => room.name === req.ip);
      let user = {} as WSUser;

      if (!req.headers.user) {
        const username =
          (req.headers.username as string) ||
          `User #${room.highestUserCount + 1}`;

        user = {
          id: username.toLowerCase().replaceAll(" ", "-"),
          username,
          guest: true,
          ws,
        };
      }

      room.users.push(user);
      room.highestUserCount++;

      sendTo({ room }, { user, event: "join" });

      ws.onmessage = async ({ data }) => {
        let parsed = {} as EventData;
        try {
          parsed = JSON.parse(data);
        } catch {
          ws.close(1008, "data is not json");
        }

        if (!["share"].includes(parsed.event)) {
          ws.close(1008, "Event must be one of share");
          return;
        }

        if (!parsed.data) {
          ws.close(1008, "Event must have a data object");
          return;
        }

        parsed.user = user;

        (await import(`#src/gateway/events/${parsed.event}.ts`)).default.call(
          ws,
          room,
          parsed,
        );
      };

      ws.onclose = () => {
        if (room.users.length === 1) {
          rooms.splice(rooms.indexOf(room), 1);
        } else {
          room.users.splice(room.users.indexOf(user), 1);
        }

        sendTo({ room }, { user, event: "leave" });
      };
    },
  );
};
