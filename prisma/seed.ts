import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const seedRootUser = async () => {
  const salt = await bcrypt.genSalt(10);

  await prisma.user.upsert({
    where: {
      email: "root.user@gmail.com",
    },
    update: {
      name: "Root User"
    },
    create: {
      name: "Root User",
      email: "root.user@gmail.com",
      passwordDigest: await bcrypt.hash("password", salt),
    }
  });
}

const seedRestaurants = async () => {
  const resdata = [
    {
      name: "TUAS",
      externalId: 7
    },
    {
      name: "Mau-Kas",
      externalId: 41
    },
    {
      name: "Tietotekniikantalo",
      externalId: 2
    },
    {
      name: "Täffä",
      externalId: 3
    },
    {
      name: "Kvarkki",
      externalId: 1
    },
    {
      name: "Studio Kipsari",
      externalId: 51
    },
    {
      name: "Alvari",
      externalId: 5
    },
    {
      name: "A Bloc",
      externalId: 52
    },
    {
      name: "Arvo",
      externalId: 59
    },
    {
      name: "Dipoli",
      externalId: 45
    },
    {
      name: "Kipsari Väre",
      externalId: 50
    },
  ]

  await Promise.all(resdata.map(async (r) => {
    await prisma.restaurant.create({ data: r })
  }))
}

const seedUniversityAndGuilds = async () => {
  const aalto = await prisma.userGroup.create({
    data: {
      name: "Aalto Yliopisto",
      category: 0,
    }
  });

  const guilds = [
    "Arkkitehtikilta",
    "Automaatio- ja systeemitekniikan kilta",
    "Inkubio",
    "Fyysikkokilta",
    "Athene",
    "Koneinsinöörikilta",
    "Maanmittarikilta",
    "Prosessiteekkarit",
    "Rakennusinsinöörikilta IK",
    "Sähköinsinöörikilta",
    "Tietokilta",
    "Prodeko",
    "Teknologföreningen",
    "Kauppatieteiden ylioppilaat (KY)",
  ];

  Promise.all(guilds.map(async (guild) => {
    await prisma.userGroup.create({
      data: {
        name: guild,
        category: 1,
        parentId: aalto.id
      }
    })
  }));
}

// const seedMessages = async () => {
//   const users = await prisma.user.findMany();
//   const userids = users.map(u => ({ id: u.id }));

//   const messageRoom = await prisma.chatRoom.create({
//     data: {
//       name: "Testing chatroom",
//       users: {
//         connect: userids
//       }
//     }
//   });


//   users.forEach(async (user) => {
//     const u = await prisma.chat.create({
//       data: {
//         content: `${user.name} said hello in this chatroom`,
//         chatRoomId: messageRoom.id,
//         userId: user.id
//       }
//     });

//     console.log(u);
//   })
// }

const removeAll = async () => {
  await prisma.session.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.lunchDate.deleteMany();
  await prisma.userGroup.deleteMany();
}

const seed = async () => {
  await removeAll();
  await seedRootUser();
  await seedUniversityAndGuilds();
  // await seedRestaurants();
  // await seedUserGroups();
  // await seedUserGroupTest();
  // await assignLunchDatesToUser();
  // await seedMessages();
}

seed();
