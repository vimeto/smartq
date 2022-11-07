import React, { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

import Layout from "../components/Layout";
import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";
import { lunchDateWithCountAndUserGroup } from "../lib/types";
import IndexPage from "../components/index/IndexPage";
import { getIndexPageServerSideProps } from "../lib/index/utils";

export const getServerSideProps = getIndexPageServerSideProps;

const Home: React.FC<{
  restaurantProps: (Restaurant & { queues: RestaurantQueue[], menus: RestaurantMenu[] })[],
  locale: string,
  lunchDateProps: lunchDateWithCountAndUserGroup[],
}> = ({ restaurantProps, locale, lunchDateProps }) => {
  return <IndexPage restaurantProps={restaurantProps} locale={locale} lunchDateProps={lunchDateProps}/>
};

export default Home;
