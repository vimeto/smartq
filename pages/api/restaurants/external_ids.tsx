import prisma from "../../../lib/prisma";



export default async function handler(req, res) {
  if (req.method != "GET") {
    res.status(405).send({ message: "Only GET allowed" }); return;
  }

  const external_ids = await prisma.restaurant.findMany({
    select: {
      externalId: true
    }
  });

  const eids = Object.entries(external_ids).map(([a, b]) => b.externalId);

  res.status(200).json({ externalIds: eids }); return;
}
