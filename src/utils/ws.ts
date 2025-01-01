import type { EventData, Room, WSUser } from "#src/types.ts";

export const rooms: Room[] = [];

const broadcast = (room: Room, data: EventData) => {
  const otherUsers = room.users.filter((user) => user.id != data.user.id);

  for (const user of otherUsers) {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(
        JSON.stringify({
          user: {
            id: data.user.id,
            username: data.user.username,
            guest: data.user.guest,
          } as Omit<WSUser, "ws">,
          event: data.event,
          data: data.data,
        } as EventData),
      );
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

  if (user.ws.readyState === WebSocket.OPEN) {
    delete data.user.ws;

    user.ws.send(
      JSON.stringify({
        user: {
          id: data.user.id,
          username: data.user.username,
          guest: data.user.guest,
        } as Omit<WSUser, "ws">,
        event: data.event,
        data: data.data,
      } as EventData),
    );
  }
};
