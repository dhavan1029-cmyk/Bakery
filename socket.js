import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server);

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}