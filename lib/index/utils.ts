import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "../prisma";


export const getIndexPageServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login ",
      },
      props: {},
    };
  }

  const u = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });

  if (!u.guildConfigured) {
    return {
      redirect: {
        permanent: true,
        destination: "/guildStepper",
      },
      props: {},
    };
  }

  if (u.showLive) {
    return {
      redirect: {
        permanent: true,
        destination: "/live",
      },
      props: {},
    };
  }

  const today = new Date();
  const datestring = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate()).toString().padStart(2, "0")}`;

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

  today.setHours(today.getHours() - 1);
  const lunchDates = await prisma.lunchDate.findMany({
    where: {
      date: {
        gte: today,
      },
      users: {
        some: {
          email: session.user.email
        }
      }
    },
    include: {
      restaurant: true,
      UserGroup: true,
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    },
    take: 3
  })

  return {
    props: {
      restaurantProps: JSON.parse(JSON.stringify(restaurants)),
      lunchDateProps: JSON.parse(JSON.stringify(lunchDates)),
      locale: ctx.locale,
    }
  }
}

export const getLiveIndexPageServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login ",
      },
      props: {},
    };
  }

  const u = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });

  if (!u.showLive) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
      props: {},
    };
  }

  const today = new Date();
  const datestring = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

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

  today.setHours(today.getHours() - 1);
  const lunchDates = await prisma.lunchDate.findMany({
    where: {
      date: {
        gte: today,
      },
      users: {
        some: {
          email: session.user.email
        }
      }
    },
    include: {
      restaurant: true,
      UserGroup: true,
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    },
    take: 3
  })

  return {
    props: {
      restaurantProps: JSON.parse(JSON.stringify(restaurants)),
      lunchDateProps: JSON.parse(JSON.stringify(lunchDates)),
      locale: ctx.locale,
    }
  }
}
