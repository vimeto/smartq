import React from "react";
import { lunchDateServerSideProps } from "../../lib/lunchDates/utils";

export const getServerSideProps = lunchDateServerSideProps;

import "react-datepicker/dist/react-datepicker.css";
import 'react-select-search/style.css'
import { RestaurantNameAndIdAsValue, UserGroupsWithLunchDate } from "../../lib/lunchDates/types";
import LunchDatePage from "../../components/lunchdate/LunchDatePage";


const Home: React.FC<{
  userGroupsProps: UserGroupsWithLunchDate[],
  restaurants: RestaurantNameAndIdAsValue[],
}> = ({ userGroupsProps, restaurants }) => {
  return (
    <LunchDatePage userGroupsProps={userGroupsProps} restaurants={restaurants} />
  );
};

export default Home;
