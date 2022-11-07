import { LunchDate, Restaurant, UserGroup } from ".prisma/client";


type UserGroupsWithLunchDate = (UserGroup & {
  lunchDates: (LunchDate & {
      _count: { users: number },
      userJoined: boolean,
      restaurant: Restaurant,
  })[];
});

type RestaurantNameAndIdAsValue = {
  value: string;
  name: string;
};

export type  {
  UserGroupsWithLunchDate,
  RestaurantNameAndIdAsValue
}
