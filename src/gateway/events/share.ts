import type { EventData, Room } from "#src/types.ts";
import { sendTo } from "#src/utils/ws.ts";

interface ShareEvent {
  to: string;
  binary: string;
}

export default function (this: WebSocket, room: Room, event: EventData) {
  const data = event.data as ShareEvent;

  if (!data.to) {
    this.send(
      JSON.stringify({
        to: "WS_EVENT_DATA_PROPERTY_MISSING",
        message: "Property 'to' is required",
      }),
    );
    return;
  }

  const recipient = room.users.find((user) => user.id === data.to);

  if (!recipient) {
    this.send(
      JSON.stringify({
        error: "WS_USER_NOT_CONNECTED",
        message: "User not reachable",
      }),
    );
    return;
  }

  this.send(JSON.stringify({ sharing: "yes" }));

  sendTo(
    { room: room, user: recipient },
    {
      event: "receive",
      user: event.user,
      data: { to: data.to },
    },
  );
}
