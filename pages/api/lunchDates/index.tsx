


import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const lunchDateDate = new Date(req.body.date) || null;
  const lunchDateRestaurantId = Number(req.body.restaurantId);
  const userGroupId = req.body.userGroupId;

  console.log(lunchDateDate, lunchDateRestaurantId, userGroupId)

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  if (!lunchDateDate || !lunchDateRestaurantId || !userGroupId) {
    res.status(400).send({ message: "missing relevant info" }); return;
  }

  try {
    const lunchDate = await prisma.lunchDate.create({
      data: {
        date: lunchDateDate,
        restaurant: {
          connect: {
            id: lunchDateRestaurantId
          }
        },
        UserGroup: {
          connect: {
            id: userGroupId
          }
        },
        users: {
          connect: {
            email: session.user.email
          }
        }
      },
      include: {
        restaurant: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    lunchDate.userGroupId

    res.status(200).send({ lunchDate: { ...lunchDate, userJoined: true }  })
  } catch(err) {
    console.log(err);

    res.status(500).send({ message: "internal error bro" })
  }
}
