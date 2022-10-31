import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const userGroupId = req.body.id;

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  try {
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        userGroups: {
          connect: {
            id: userGroupId
          }
        }
      }
    })

    const newUserGroup = await prisma.userGroup.findUnique({
      where: {
        id: userGroupId
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
    });

    const newUserGroupp = { ...newUserGroup, lunchDates: newUserGroup.lunchDates.map(ld => ({ ...ld, userJoined: false })) }

    res.status(200).json({ userGroup: newUserGroupp });

    // const userGroups = await prisma.userGroup.findMany({
    //   where: {
    //     users: {
    //       some: {
    //         email: {
    //           equals: session.user.email
    //         }
    //       }
    //     }
    //   },
    //   include: {
    //     lunchDates: true
    //   }
    // });

    // res.status(200).json({ userGroups });
  } catch {
    res.status(500).json({ message: "smth went wrong" })
  }
}
