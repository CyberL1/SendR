import type { User } from "#src/types.ts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { WebSocketServer } from "ws";

export default (
  fastify: FastifyInstance & { websocketServer: WebSocketServer },
) => {
  const broadcast = (
    ws: WebSocket,
    user: User,
    event: string,
    data?: object,
  ) => {
    for (const client of fastify.websocketServer.clients) {
      // @ts-ignore
      if (client != ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ user, event, data }));
      }
    }
  };

  fastify.get(
    "/",
    { websocket: true },
    // @ts-ignore
    (ws: WebSocket, req: FastifyRequest) => {
      let user = {} as User;

      if (!req.headers.user) {
        user = {
          id: req.id,
          username:
            (req.headers.username as string) || `User #${req.id.split("-")[1]}`,
          guest: true,
        };
      }

      broadcast(ws, user, "connect");

      ws.onmessage = ({ data }) => {
        broadcast(ws, user, "message", data);
      };

      ws.onclose = () => {
        broadcast(ws, user, "disconnect");
      };
    },
  );
};
