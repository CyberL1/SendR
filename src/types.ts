export interface User {
  id: string;
  username: string;
}

export interface Room {
  name: string;
  users: WSUser[];
  highestUserCount: number;
}

export interface WSUser extends User {
  ws: WebSocket;
  guest?: boolean;
}

export interface EventData {
  user: WSUser;
  event: string;
  data?: object;
}
