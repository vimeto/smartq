import prisma from "../../../lib/prisma";

// TODO: create better typechecking for this, because this is bullshit
// TODO: also add some api key encryption for this, because this is ass

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const body = req.body;

  const { menu_data: menuData } = body;

  console.log(menuData);

  if (menuData && typeof menuData == 'object') {

    console.log("aaaah")
    await Promise.all(Object.keys(menuData as object).map(async (externalId) => {
      console.log(externalId);
      const r = await prisma.restaurant.findFirst({
        where: {
          externalId: Number(externalId)
        }
      });

      if (r) {
        const rmenu = await prisma.restaurantMenu.create({
          data: {
            menu: menuData[externalId].menu,
            menuDate: menuData[externalId].date,
            restaurantId: r.id,
          }
        })
      }
    }))
  }

  // const external_ids = await prisma.restaurant.findMany({
  //   select: {
  //     externalId: true
  //   }
  // });

  // const eids = Object.entries(external_ids).map(([a, b]) => b.externalId);

  res.status(200).end(); return;
}
