import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const externalId = req.body.externalId;

  const userGroupId = await prisma.userGroup.findUnique({
    where: {
      externalId
    },
    select: {
      id: true
    }
  })

  res.status(200).json({ id: userGroupId?.id }); return;
}
