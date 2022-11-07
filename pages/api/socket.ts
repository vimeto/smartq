import type { User } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { Server } from "socket.io";
// import { createAdapter } from "@socket.io/redis-adapter";
// import { createClient } from "redis";
// import Redis from "ioredis";

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

  // const pubClient = createClient({ url: "rediss://default:AVNS_oRlfF0YPS_kE9OmedMx@redis-3ca2d098-vilhelm-7f26.aivencloud.com:27355" });
  // const pubClient = new Redis("rediss://default:AVNS_oRlfF0YPS_kE9OmedMx@redis-3ca2d098-vilhelm-7f26.aivencloud.com:27355");
  // const subClient = pubClient.duplicate();

  // io.adapter(createAdapter(pubClient, subClient));
  // console.log("adapter connected")

  io.use((socket, next) => {
    const id = socket.handshake.auth.id;

    if (!id) {
      return next(new Error("invalid id"));
    }

    socket.data.userId = id;
    next();
  });


  io.on('connection', async (socket) => {

    socket.join(socket.data.userId);

    socket.on("send-message", async (msg) => {
      const possibleChatRoom  = await prisma.lunchDate.findUnique({
        where: {
          id: msg.lunchDateId
        },
        include: {
          users: true
        }
      });

      if (possibleChatRoom) {
        const newChat = await prisma.chat.create({
          data: {
            content: msg.content,
            lunchDateId: msg.lunchDateId,
            userId: socket.data.userId
          },
          include: {
            user: true
          }
        });

        const uids = possibleChatRoom.users.map((usr) => usr.id)

        io.to(uids).emit("message", newChat);
      }
      // socket.broadcast.emit("update-input", msg)
    })
  })

  res.end();
}

export default SocketHandler;
