import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);

  const data = {
    name: "Root User",
    email: "root.user@gmail.com",
    passwordDigest: await bcrypt.hash("password", salt),
    isRoot: true
  }

  await prisma.user.create({ data })
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

const seedUserGroups = async () => {
  const users = await prisma.user.findMany();
  const userids = users.map(u => ({ id: u.id }));

  const userGroupAalto = await prisma.userGroup.create({
    data: {
      name: "Aalto University",
      externalId: "ABCDABCD",
      users: {
        connect: userids
      }
    }
  });

  const userGroupFyysikkokilta = await prisma.userGroup.create({
    data: {
      name: "Fyysikkokilta",
      externalId: "01234567",
      users: {
        connect: userids
      }
    }
  });

  await prisma.lunchDate.create({
    data: {
      date: new Date(2022, 9, 28, 11, 30),
      restaurant: {
        connect: {
          id: 7
        }
      },
      UserGroup: {
        connect: {
          id: userGroupAalto.id
        }
      }
    }
  })

  await prisma.lunchDate.create({
    data: {
      date: new Date(2022, 9, 28, 17, 30),
      restaurant: {
        connect: {
          id: 11
        }
      },
      UserGroup: {
        connect: {
          id: userGroupAalto.id
        }
      }
    }
  })

  await prisma.lunchDate.create({
    data: {
      date: new Date(2022, 9, 30, 17, 30),
      restaurant: {
        connect: {
          id: 1
        }
      },
      UserGroup: {
        connect: {
          id: userGroupAalto.id
        }
      }
    }
  })

  await prisma.lunchDate.create({
    data: {
      date: new Date(2022, 9, 30, 10, 30),
      restaurant: {
        connect: {
          id: 8
        }
      },
      UserGroup: {
        connect: {
          id: userGroupFyysikkokilta.id
        }
      }
    }
  })
}

const seedUserGroupTest = async () => {
  await prisma.userGroup.create({
    data: {
      name: "Testing group",
      externalId: "AKAKAKAK",
    }
  });
}

const assignLunchDatesToUser = async () => {
  await prisma.lunchDate.update({
    where: {
      id: "cl9pxdngc00048zb5qqfyvmag"
    },
    data: {
      users: {
        connect: {
          email: "vilhelm.toivonen@trail.fi"
        }
      },
    }
  });
  await prisma.lunchDate.update({
    where: {
      id: "cl9pxdnh900078zb5jr84e29j"
    },
    data: {
      users: {
        connect: {
          email: "vilhelm.toivonen@trail.fi"
        }
      }
    }
  });
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

// const removeAll = async () => {
//   await prisma.session.deleteMany();
//   await prisma.restaurantMenu.deleteMany();
//   await prisma.restaurantQueue.deleteMany();
//   await prisma.restaurant.deleteMany();
//   await prisma.user.deleteMany();
// }

const seed = async () => {
  // await removeAll();
  // await seedUsers();
  await seedRestaurants();
  // await seedUserGroups();
  // await seedUserGroupTest();
  // await assignLunchDatesToUser();
  // await seedMessages();
}

seed();
