import { User } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import { options } from "./auth/[...nextauth]";


export default async function handler(req, res) {
  console.log("called");

  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  const chatContent = req.body.content;
  const lunchDateId = req.body.lunchDateId;

  const lunchDate = await prisma.lunchDate.findUnique({
    where: {
      id: lunchDateId
    },
    include: {
      users: true
    }
  });

  if (!lunchDateId) { res.status(400).send({ message: "Chat room not found" }); return }

  const userRecord = lunchDate.users.find((u) => u.email === session.user.email)

  if (!userRecord) { res.status(401).send({ message: "You don't belong to this chatroom" }); return }

  const newMessage = await prisma.chat.create({
    data: {
      content: chatContent,
      userId: userRecord.id,
      lunchDateId: lunchDate.id
    },
    include: {
      user: true
    }
  });

  const io = res.socket?.server?.io;

  if (!io) { res.status(200).message({ message: "Message ok, websocket not ok" }) }

  const uids = lunchDate.users.map((usr) => usr.id);

  io.to(uids).emit("message", newMessage);

  res.status(200).end();
}
