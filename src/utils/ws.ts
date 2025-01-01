import type { EventData, Room, UserSocket, WSUser } from "#src/types.ts";

export let userSockets: UserSocket[] = [];
export const rooms: Room[] = [];

const broadcast = (room: Room, data: EventData) => {
  const otherSockets = userSockets.filter(
    (s) => s.roomName === room.name && s.userId != data.user.id,
  );

  for (const userSocket of otherSockets) {
    if (userSocket.ws.readyState === WebSocket.OPEN) {
      userSocket.ws.send(JSON.stringify(data as EventData));
    }
  }
};

interface SendTo {
  room: Room;
  user?: WSUser;
}

export const sendTo = ({ room, user }: SendTo, data: EventData) => {
  if (!user) {
    broadcast(room, data);
    return;
  }

  const { ws } = userSockets.find((s) => s.userId === user.id);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data as EventData));
  }
};

export const dropUserSocket = (userId: string) => {
  userSockets = userSockets.filter((s) => s.userId != userId);
};
