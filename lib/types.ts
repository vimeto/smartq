import { LunchDate, Restaurant, User, UserGroup } from "@prisma/client";

type lunchDateWithCountAndUserGroup = (LunchDate & {
  restaurant: Restaurant,
  _count: {
    users: number,
  },
  UserGroup: UserGroup,
});

export type LunchDateWithCountAndUserGroupAndUserJoined = lunchDateWithCountAndUserGroup & { userJoined: boolean };

export type {
  lunchDateWithCountAndUserGroup
};

export type UserWithUserGroups = User & { userGroups: UserGroup[] }
