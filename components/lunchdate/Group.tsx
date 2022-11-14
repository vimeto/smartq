import { LunchDate, Restaurant } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaMinusCircle, FaPlusCircle, FaUser } from "react-icons/fa";
import DatePicker from "react-datepicker";
import SelectSearch from "react-select-search";
import formatRelative from "date-fns/formatRelative";
import { RestaurantNameAndIdAsValue, UserGroupsWithLunchDate } from "../../lib/lunchDates/types";

interface GroupProps {
  group: UserGroupsWithLunchDate;
  restaurants: RestaurantNameAndIdAsValue[];
  handleCreateNewLunchDate: (date: Date, restaurantId: string, userGroupId: string) => void;
}

type LunchDateWithCountAndRestaurant = LunchDate & {
    _count: {
        users: number,
    },
    userJoined: boolean,
    restaurant: Restaurant,
}

const Group: React.FC<GroupProps> = ({ group, restaurants, handleCreateNewLunchDate }) => {
  const router = useRouter();
  const t = useTranslations("user_group");
  const [newLunchDateState, setNewLunchDateState] = useState({
    date: new Date(),
    restaurant: "",
    open: false,
  });

  const handleOpenChat = async (lunchDate: LunchDateWithCountAndRestaurant) => {
    if (lunchDate.userJoined) {
      router.push(`/lunchDates/${lunchDate.id}`);
      return;
    }
    const res = await fetch("/api/lunchDates/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lunchDateId: lunchDate.id,
      })
    });

    if (res.status === 200) {
      router.push(`/lunchDates/${lunchDate.id}`)
    }
  }

  return (
    <div className="rounded-3xl shadow bg-white m-2 py-2 px-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <p className="cursor-pointer text-xl pl-2 pt-2">{group.name}</p>
          <p className="text-sm pl-2 mb-2">{group.externalId}</p>
        </div>
        <div onClick={() => setNewLunchDateState({ ...newLunchDateState, open: !newLunchDateState.open })}>
          { newLunchDateState.open ? (
            <FaMinusCircle
              className="text-xl text-red-700"
              />
          ) : (
            <FaPlusCircle
              className="text-xl text-green-800"
              />
          ) }
        </div>
      </div>
      <div className={`border-t py-2 pl-2 ${newLunchDateState.open ? 'block' : 'hidden'}`}>
        <div className="flex flex-row justify-between items-center">
          <DatePicker
            selected={newLunchDateState.date}
            onChange={(date) => setNewLunchDateState({ ...newLunchDateState, date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy HH:mm"
            timeFormat="HH:mm"
            className="w-6/12"
            />
          <SelectSearch
            options={restaurants}
            placeholder="Restaurant name"
            onChange={(value) => setNewLunchDateState({ ...newLunchDateState, restaurant: value.toString() })}
            search
            />
        </div>
        <div className="mx-auto text-center">
          <button
            className="px-4 py-2 m-2 bg-emerald-200 rounded-full hover:bg-emerald-300"
            onClick={() => handleCreateNewLunchDate(newLunchDateState.date, newLunchDateState.restaurant, group.id)}
            >Create lunch date</button>
        </div>
      </div>
      { group.lunchDates.length > 0 && group.lunchDates.map((lunchDate) => {
        return (
          <div
            key={lunchDate.id}
            className="border-t py-2 pl-2 flex flex-row justify-between items-center"
            >
              <p>{`${formatRelative(new Date(lunchDate.date), new Date())}`} - {lunchDate.restaurant.name}</p>
              <div className="flex flex-col">
                <div className="flex flex-row justify-end items-center gap-2">
                  {lunchDate._count.users}
                  <FaUser />
                  <button
                    className={`px-3 py-1 ${lunchDate.userJoined ? 'bg-cyan-200' : 'bg-emerald-200'} rounded-full mt-1`}
                    onClick={() => handleOpenChat(lunchDate)}
                    >
                      {lunchDate.userJoined ? t('open') : t('join')}
                  </button>
                </div>
              </div>
            </div>
        )
      }) }
    </div>
  )
}

export default Group;
