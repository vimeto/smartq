


import { endOfDay, startOfDay } from "date-fns";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { options } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method != "GET") {
    res.status(405).send({ message: "Only GET allowed" }); return;
  }

  const session = await unstable_getServerSession(req, res, options);
  if (!session?.user) { res.status(401).end(); return; }

  try {
    const userGroups = await prisma.userGroup.findMany({
      where: {
        users: {
          some: {
            email: session.user.email
          }
        },
        category: {
          in: [0, 1]
        }
      }
    });

    const filteredUserGroups = userGroups.map((ug) => ({ label: ug.name, id: ug.id }))

    return res.status(200).send({ userGroups: filteredUserGroups })
  } catch(err) {
    console.error(err);

    res.status(500).send({ message: "internal error bro" })
  }
}
