


import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const lunchDateId = String(req.body.lunchDateId);

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  if (!lunchDateId) {
    res.status(400).send({ message: "missing relevant info" }); return;
  }

  try {
    const lunchDate = await prisma.lunchDate.update({
      where: {
        id: lunchDateId
      },
      data: {
        users: {
          connect: {
            email: session.user.email
          }
        }
      }
    });

    if (lunchDate) {
      await prisma.chat.create({
        data: {
          content: `${session.user.name} is interested in this lunchdate.`,
          LunchDate: {
            connect: {
              id: lunchDate.id
            }
          },
          user: {
            connect: {
              email: session.user.email
            }
          }
        }
      })
      res.status(200).end(); return;
    }
    res.status(400).send({ message: "record not found" }); return;
  } catch(err) {
    console.log(err);

    res.status(500).send({ message: "internal error bro" })
  }
}
