


import { endOfDay, startOfDay } from "date-fns";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  const date = req.body.date && (new Date(req.body.date) || null);

  if (!date) {
    res.status(400).send({ message: "missing relevant info" }); return;
  }

  try {
    const lunchDates = await prisma.lunchDate.findMany({
      where: {
        UserGroup: {
          users: {
            some: {
              email: session.user.email
            }
          }
        },
        date: {
          lte: endOfDay(date),
          gte: startOfDay(date),
        }
      },
      include: {
        restaurant: true,
        UserGroup: true,
        users: {
          select: {
            email: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    const ldates = lunchDates.map(ld => {
      const { users, ...rest } = ld;
      return { userJoined: (users.findIndex(u => u.email == session.user.email) >= 0), ...rest };
    });

    res.status(200).send({ lunchDates: ldates  })
  } catch(err) {
    console.error(err);

    res.status(500).send({ message: "internal error bro" })
  }
}
