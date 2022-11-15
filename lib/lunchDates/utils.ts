import { LunchDate } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "../prisma";


export const lunchDateServerSideProps: GetServerSideProps = async (ctx) => {
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

  const today = new Date();
  today.setHours(today.getHours() - 1);

  const userGroups = await prisma.userGroup.findMany({
    where: {
      users: {
        some: {
          email: {
            equals: session.user.email
          }
        }
      }
    },
    include: {
      lunchDates: {
        where: {
          date: {
            gte: today
          }
        },
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      guildConfigured: true,
      lunchDates: {
        select: {
          id: true
        }
      }
    }
  });

  if (!user.guildConfigured) {
    return {
      redirect: {
        permanent: true,
        destination: "/guildStepper",
      },
      props: {},
    };
  }

  const userLunchDateIds = user.lunchDates.map((lunchdate) => lunchdate.id);

  const a = userGroups.map((userGroup) => {
    if (userGroup.lunchDates.length === 0) {
      return userGroup;
    }

    const { lunchDates, ...remaining } = userGroup;
    const rest = remaining;
    const lunchDateList = [] as (LunchDate & {
      _count: { users: number },
      userJoined: boolean,
      restaurant: {
        id: number,
        name: string,
      },
    })[];

    const aaa = { ...userGroup };
    userGroup.lunchDates.forEach((ld) => {
      if (userLunchDateIds.includes(ld.id)) {
        lunchDateList.push({ ...ld, userJoined: true });
      } else {
        lunchDateList.push({ ...ld, userJoined: false });
      }
    })
    return { ...rest, lunchDates: lunchDateList }
  });

  const restaurants = (await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
    }
  })).map((restaurant) => ({ value: restaurant.id.toString(), name: restaurant.name }))

  return {
    props: {
      userGroupsProps: JSON.parse(JSON.stringify(a)),
      restaurants,
    }
  }
}
