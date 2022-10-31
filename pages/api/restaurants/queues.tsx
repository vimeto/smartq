import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const restaurantId = Number(req.body.restaurantId);
  const queueTime = Number(req.body.queueTime);
  const comment = req.body.comment || "";

  if (!restaurantId || (!queueTime && req.body.queueTime === "0")) {
    res.status(400).send({ message: "Missing restaurant id or queue length" });
    return;
  }
  const queueparams = {
    comment,
    queueTime,
    restaurantId,
  };

  try {
    await prisma.restaurantQueue.create({ data: queueparams });

    const today = new Date();
    const datestring = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`

    const restaurants = await prisma.restaurant.findMany({
      include: {
        menus: {
          where: {
            menuDate: {
              equals: datestring
            }
          }
        },
        queues: {
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      }
    });

    res.status(200).json({ restaurants }); return;
  } catch {
    res.status(500).send({ message: "smth went wrong, try again" })
  }
}
