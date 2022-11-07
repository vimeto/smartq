import { User } from "@prisma/client";
import { NextApiHandler } from "next";
import { unstable_getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";


const handler: NextApiHandler = async (req, res) => {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  const sl = req.body.showLive;

  const u = await prisma.user.update({
    where: {
      email: session.user.email
    },
    data: {
      showLive: sl
    }
  });

  if (u) {
    res.status(200).end(); return;
  }
  res.status(500).send({ message: "smth went wrong" }); return
}

export default handler;
