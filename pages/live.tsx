import React from "react";
import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";
import { lunchDateWithCountAndUserGroup } from "../lib/types";
import { getLiveIndexPageServerSideProps } from "../lib/index/utils";
import IndexLivePage from "../components/index/live/IndexLivePage";

export const getServerSideProps = getLiveIndexPageServerSideProps;

const IndexLive: React.FC<{
  restaurantProps: (Restaurant & { queues: RestaurantQueue[], menus: RestaurantMenu[] })[],
  locale: string,
  lunchDateProps: lunchDateWithCountAndUserGroup[],
}> = ({ restaurantProps, locale, lunchDateProps }) => {
  return <IndexLivePage restaurantProps={restaurantProps} locale={locale} lunchDateProps={lunchDateProps}/>
};

export default IndexLive;
