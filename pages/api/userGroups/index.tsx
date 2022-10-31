

import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const userGroupExternalId = req.body.externalId;
  const userGroupName = req.body.name;

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  if (!userGroupExternalId || !userGroupName) {
    res.status(400).send({ message: "missing relevant info" }); return;
  }

  try {
    const newUserGroup = await prisma.userGroup.create({
      data: {
        externalId: userGroupExternalId,
        name: userGroupName,
        users: {
          connect: {
            email: session.user.email
          }
        }
      },
      include: {
        lunchDates: {
          include: {
            restaurant: true,
            _count: {
              select: {
                users: true
              }
            },
          }
        },
      }
    })

    const newUserGroupp = { ...newUserGroup, lunchDates: newUserGroup.lunchDates.map(ld => ({ ...ld, userJoined: false })) }

    res.status(200).json({ userGroup: newUserGroupp });
  } catch {
    res.status(500).json({ message: "smth went wrong" })
  }
}
