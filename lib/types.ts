import { LunchDate, Restaurant, UserGroup } from "@prisma/client";

type lunchDateWithCountAndUserGroup = (LunchDate & {
  restaurant: Restaurant,
  _count: {
      users: number,
  },
  UserGroup: UserGroup,
});

export type {
  lunchDateWithCountAndUserGroup
};
