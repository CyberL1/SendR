import type { EventData, Room } from "#src/types.ts";
import { sendTo } from "#src/utils/ws.ts";

interface ShareEvent {
  to: string;
  type: "text";
  text?: string;
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

  if (!data.type) {
    this.send(
      JSON.stringify({
        to: "WS_EVENT_DATA_PROPERTY_MISSING",
        message: "Property 'type' is required",
      }),
    );
    return;
  }

  if (!["text"].includes(data.type)) {
    this.send(
      JSON.stringify({
        to: "WS_EVENT_DATA_PROPERTY_WRONG_TYPE",
        message: "Property 'type' must be one of text",
      }),
    );
    return;
  }

  if (data.type === "text" && !data.text) {
    this.send(
      JSON.stringify({
        to: "WS_EVENT_DATA_PROPERTY_MISSING",
        message: "Property 'type' is text, but property 'text' is missing",
      }),
    );
    return;
  }

  sendTo(
    { room: room, user: recipient },
    {
      event: "receive",
      user: event.user,
      data: {
        type: data.type,
        text: data.type === "text" ? data.text : null,
      },
    },
  );
}
