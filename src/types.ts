export interface User {
  id: string;
  username: string;
}

export interface Room {
  name: string;
  users: WSUser[];
  highestUserCount: number;
}

export interface UserSocket {
  userId: string;
  roomName: string;
  ws: WebSocket;
}

export interface WSUser extends User {
  guest?: boolean;
}

export interface EventData {
  user: WSUser;
  event: string;
  data?: object;
}
