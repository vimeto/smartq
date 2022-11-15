import { NextApiHandler } from "next";
import prisma from "../../../../lib/prisma";

const handler: NextApiHandler = async (req, res) => {
  if (req.method != "GET") {
    res.status(405).send({ message: "Only GET allowed" }); return;
  }

  const id = req.query.id as string;

  const userGroups = await prisma.userGroup.findMany({
    where: {
      parentId: id,
      category: 1,
    },
  })

  res.status(200).json({ userGroups: userGroups }); return;
}

export default handler;
