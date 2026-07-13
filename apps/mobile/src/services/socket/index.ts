import { io } from 'socket.io-client';
import { env } from '../../lib/env';

export const socket = io(env.socketUrl, {
  autoConnect: false,
});
