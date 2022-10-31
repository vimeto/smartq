import React, { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

import Layout from "../../components/Layout";
import Modal from "../../components/Modal";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import { redirect } from "next/dist/server/api-utils";
import { LunchDate, Prisma, Restaurant, RestaurantMenu, RestaurantQueue, User, UserGroup } from "@prisma/client";
import formatRelative from "date-fns/formatRelative";
import { FaPlusCircle, FaMinusCircle, FaCheck, FaUser } from 'react-icons/fa';
import DatePicker from "react-datepicker"
import SelectSearch from "react-select-search";

import "react-datepicker/dist/react-datepicker.css";
import 'react-select-search/style.css'
import Router, { useRouter } from "next/router";

type UserGroupsWithLunchDate = (UserGroup & {
  lunchDates: (LunchDate & {
      _count: { users: number },
      userJoined: boolean,
      restaurant: Restaurant,
  })[];
});

type CondensedRestaurant = {
  value: string;
  name: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login ",
      },
      props:{},
    };
  }

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

  const userLunchDateIds = (await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      lunchDates: {
        select: {
          id: true
        }
      }
    }
  })).lunchDates.map((lunchdate) => lunchdate.id);

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

  // const a = await prisma.$queryRaw(
  //   Prisma.sql`SELECT UserGroup.*, User.email AS 'U.email'
  //   FROM UserGroup
  //   INNER JOIN _UserToUserGroup
  //   ON _UserToUserGroup.B=UserGroup.id
  //   INNER JOIN User
  //   ON _UserToUserGroup.A=User.id
  //   WHERE User.email = ${session.user.email}`
  // )

  // console.log("here", a);

  return {
    props: {
      userGroupsProps: JSON.parse(JSON.stringify(a)),
      restaurants,
    }
  }
}


const Group: React.FC<{
  group: UserGroupsWithLunchDate,
  restaurants: CondensedRestaurant[],
  handleCreateNewLunchDate: (date: Date, restaurantId: string, userGroupId: string) => void,
}> = ({ group, restaurants, handleCreateNewLunchDate }) => {
  const router = useRouter();
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [newLunchDateState, setNewLunchDateState] = useState({
    date: new Date(),
    restaurant: "",
    open: false,
  });
  const t = useTranslations("user_group");

  const handleOpenChat = async (
    lunchDate: LunchDate & {
      _count: {
          users: number;
      };
      userJoined: boolean;
      restaurant: Restaurant;
  }) => {
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
    <div className="rounded border m-2 py-2 px-4">
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
            className="px-4 py-2 m-2 bg-green-200 rounded-lg hover:bg-green-300"
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
                    className={`px-2 py-1 ${lunchDate.userJoined ? 'bg-blue-100' : 'bg-green-200'} rounded-lg mt-1`}
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

const Home: React.FC<{
  userGroupsProps: UserGroupsWithLunchDate[],
  restaurants: CondensedRestaurant[],
}> = ({ userGroupsProps, restaurants }) => {
  const [joinGroupState, setJoinGroupState] = useState({
    externalId: "",
    id: null as (null | string),
  });
  const [newGroupState, setNewGroupState] = useState({
    name: "",
    externalId: "",
    id: null as (null | string),
  });
  const [userGroups, setUserGroups] = useState(userGroupsProps);
  const [selectedCreateJoinTab, setSelectedCreateJoinTab] = useState<number | null>(null);
  const t = useTranslations("lunch_dates")

  useEffect(() => {
    setUserGroups(userGroupsProps)
  }, [userGroupsProps])

  const updateJoinGroupExternalId: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const cutNewValue = e.target.value.slice(0, 8);

    setJoinGroupState({ externalId: cutNewValue, id: null })

    if (cutNewValue.length !== 8) {
      return;
    }

    const res = await fetch("/api/userGroups/externalIds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: cutNewValue,
      })
    });

    const body = await res.json();

    setJoinGroupState({ externalId: cutNewValue, id: body?.id })
  }

  const updateNewGroupExternalId: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const cutNewValue = e.target.value.slice(0, 8);

    setNewGroupState({ ...newGroupState, externalId: cutNewValue })
    if (cutNewValue.length !== 8) {
      return;
    }

    const res = await fetch("/api/userGroups/externalIds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: cutNewValue,
      })
    });

    const body = await res.json();

    setNewGroupState({ ...newGroupState, externalId: cutNewValue, id: body?.id })
  }

  const joinNewUserGroup = async () => {
    if (!joinGroupState.id) {
      return;
    }

    const res = await fetch("/api/userGroups/joinById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: joinGroupState.id,
      })
    });

    const body = await res.json();

    if (body.userGroup?.id) {
      setJoinGroupState({ externalId: "", id: null });
      setUserGroups(current => {
        if (current.find(ug => ug.id === body.userGroup.id)) {
          return current.map(oug => oug.id === body.userGroup.id ? body.userGroup : oug);
        } else {
          return current.concat(body.userGroup);
        }
      });
    }
  }

  const createNewUserGroup = async () => {
    console.log("here");
    if (newGroupState.id || !newGroupState.name || !newGroupState.externalId) {
      return;
    }

    const res = await fetch("/api/userGroups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: newGroupState.externalId,
        name: newGroupState.name,
      })
    });

    const body = await res.json();

    if (body.userGroup) {
      setNewGroupState({ externalId: "", id: null, name: "" });
      setUserGroups(current => {
        if (current.find(ug => ug.id === body.userGroup.id)) {
          return current.map(oug => oug.id === body.userGroup.id ? body.userGroup : oug);
        } else {
          return current.concat(body.userGroup);
        }
      });
    }
  }

  const handleCreateNewLunchDate = async (date: Date, restaurantId: string, userGroupId: string) => {
    if (!date || !restaurantId) { return; }

    const res = await fetch("/api/lunchDates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        restaurantId,
        userGroupId,
      })
    });

    const body = await res.json();

    if (body.lunchDate) {
      setUserGroups((current) => {
        const a = current.map(group => (
          group.id === body.lunchDate?.userGroupId ?
            ({ ...group, lunchDates: group.lunchDates.concat(body.lunchDate) })
            : group
        ))
      return a;
    })
    }
  }

  return (
    <Layout>
      <div className="page pb-16">
        <div><h1 className="text-center mb-4 mt-6 text-5xl">{t('lunch_dates')}</h1></div>
        <div className="max-w-screen-md mx-auto">
          <div className="m-2 flex flex-row gap-2">
            <div
              className={`bg-green-${selectedCreateJoinTab === 1 ? '300' : '200'} hover:bg-green-300 text-center w-6/12 rounded border py-2 px-4 cursor-pointer flex items-center justify-center`}
              onClick={() => {setSelectedCreateJoinTab(selectedCreateJoinTab === 1 ? null : 1)}}
              >
              {t("create_new.title")}
            </div>
            <div
              className={`bg-gray-${selectedCreateJoinTab === 2 ? '300' : '200'} hover:bg-gray-300 text-center w-6/12 rounded border py-2 px-4 inline-block`}
              onClick={() => {setSelectedCreateJoinTab(selectedCreateJoinTab === 2 ? null : 2)}}
              >
              {t("join_existing.title")}
            </div>
          </div>
          <div className={`m-2 border p-6 flex flex-row justify-between items-end ${selectedCreateJoinTab === 2 ? 'block' : 'hidden'}`}>
            <div>
              <p className="text-xl mb-4 pl-1">
                {t('join_existing.login_code')}
              </p>
              <div className="flex flex-row items-center gap-2">
                <input
                  className="p-1"
                  placeholder={t('join_existing.login_code_placeholder')}
                  type="text"
                  value={joinGroupState.externalId}
                  onChange={updateJoinGroupExternalId}
                  />
                <FaCheck
                  color="#03AF13"
                  visibility={joinGroupState.id ? 'visible' : 'hidden'}
                  />
              </div>
            </div>
            <div>
              <button
                className={`py-2 px-6 bg-green-300 rounded ${!joinGroupState.id && 'opacity-30'}`}
                disabled={!joinGroupState.id}
                onClick={joinNewUserGroup}
                >
                  {t('join_existing.join')}
                </button>
            </div>
          </div>
          <div className={`m-2 border p-6 flex flex-row justify-between items-end ${selectedCreateJoinTab === 1 ? 'block' : 'hidden'}`}>
            <div>
              <div>
                <p className="text-xl mb-4 pl-1">
                  {t('create_new.group_name')}
                </p>
                <input
                  placeholder={t('create_new.group_name_placeholder')}
                  type="text"
                  value={newGroupState.name}
                  onChange={(e) => setNewGroupState({ ...newGroupState, name: e.target.value })}
                  />
              </div>
              <div className="mt-4">
                <p className="text-xl mb-4 pl-1">
                  {t('create_new.login_code')}
                </p>
                <div className="flex flex-row items-center gap-2">
                  <input
                    placeholder={t('create_new.login_code_placeholder')}
                    type="text"
                    value={newGroupState.externalId}
                    onChange={updateNewGroupExternalId}
                    />
                  <FaCheck
                    color="#03AF13"
                    visibility={(newGroupState.id || newGroupState.externalId.length !== 8) ? 'hidden' : 'visible'}
                    />
                </div>
              </div>
            </div>
            <div>
              <button
                className={`py-2 px-6 bg-green-300 rounded ${(newGroupState.id || newGroupState.externalId.length !== 8) && 'opacity-30'}`}
                disabled={!(newGroupState.id || newGroupState.externalId.length === 8)}
                onClick={createNewUserGroup}
                >
                  {t('create_new.create')}
              </button>
            </div>
          </div>
          {
            userGroups?.length > 0 && userGroups.map(g => (
              <Group key={g.id} group={g} restaurants={restaurants} handleCreateNewLunchDate={handleCreateNewLunchDate} />
            ))
          }
        </div>
      </div>
    </Layout>
  );
};

export default Home;
