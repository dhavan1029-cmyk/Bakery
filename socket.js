import { Server } from "socket.io";
import {parseCookie} from 'cookie'
import jwt from 'jsonwebtoken'
import userModel from './models/userModel.js'

let io;

export function initSocket(server) {
    io = new Server(server);

    io.on("connection", (socket) => {

        console.log('User connected:', socket.id)

        const userId = socket.user._id.toString()

        socket.join(`user:${userId}`)
        
    });

    io.use(async (socket, next) => {
        try {

            const cookies = parseCookie(
                socket.handshake.headers.cookie || ''
            )
            const token = cookies.userToken

            if (!token) {
                return next(new Error('Not authenticated'))
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_CODE
            )

            const user = await userModel.findOne({
                email: decoded.email
            })

            if (!user) {
                return next(new Error('User not found'))
            }

            socket.user = user

            next()

        } catch (error) {

            console.log('Socket authentication failed:', error.message)

            next(new Error('Not authenticated'))

        }
    })

}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}