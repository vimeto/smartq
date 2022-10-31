import type { User } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { Server } from "socket.io";
import prisma from "../../lib/prisma";
import { options } from "./auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = async (req, res) => {
  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.end(); return; }

  if (res.socket.server.io) {
    console.log("socket is already running"); res.end(); return;
  }

  console.log("socket is initializing")
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // io.use(async (socket, next) => {
  //   // const session = await unstable_getServerSession(req, res, options);
  //   if (!session?.user) {
  //     console.log("here")
  //     next(new Error("you are not authenticated")); return;
  //   }

  //   socket.data = await prisma.user.findUnique({
  //     where: {
  //       email: session.user.email
  //     },
  //     include: {
  //       chatRooms: {
  //         include: {
  //           users: true
  //         }
  //       }
  //     }
  //   });
  //   // socket.user = session?.user;
  // })

  io.on('connection', async (socket) => {
    socket.data = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
    });

    socket.join(socket.data.id);

    // socket.on("send-message", async (msg) => {
    //   console.log(session.user);
    //   const possibleChatRoom = (
    //     socket.data as
    //       User & {chatRooms: (ChatRoom & { users: User[] })[]}
    //   ).chatRooms.find((cr) => cr.id === msg.chatRoomId)

    //   if (possibleChatRoom) {
    //     const newChat = await prisma.chat.create({
    //       data: {
    //         content: msg.content,
    //         chatRoomId: msg.chatRoomId,
    //         userId: socket.data.id
    //       },
    //       include: {
    //         user: true
    //       }
    //     });

    //     const uids = possibleChatRoom.users.map((usr) => usr.id)

    //     io.to(uids).emit("message", newChat);
    //   }
    //   // socket.broadcast.emit("update-input", msg)
    // })
  })

  res.end();
}

export default SocketHandler;
