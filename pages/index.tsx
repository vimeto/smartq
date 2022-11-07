import React, { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "../lib/prisma";
import { redirect } from "next/dist/server/api-utils";
import { Restaurant, RestaurantMenu, RestaurantQueue, User, LunchDate, UserGroup } from "@prisma/client";
import { formatDistance, formatRelative } from "date-fns";
import localeFi from 'date-fns/locale/fi';
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/router";

type LunchDateProp = (LunchDate & {
  restaurant: Restaurant,
  _count: {
      users: number,
  },
  UserGroup: UserGroup,
})

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

  const today = new Date();
  const datestring = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`

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

const getQueueTimeBackgroundColor = (queueTime: number) => {
  const percentage = (60 - Math.min(queueTime, 60)) / 60 * 100;

  return `hsl(${percentage}, 100%, 70%)`
}

const RestaurantItem: React.FC<{
  toggleMenuOpen: (id: number) => void,
  menuOpen: boolean,
  restaurant: Restaurant &
    { queues: RestaurantQueue[], menus: RestaurantMenu[] }
  handleModalOpen: (res: Restaurant &
    { queues: RestaurantQueue[], menus: RestaurantMenu[] }) => void,
  locale: string,
}> = ({ toggleMenuOpen, menuOpen, restaurant, handleModalOpen, locale }) => {
  const t = useTranslations('index');

  return (
    <div className="rounded border m-2 py-2 px-4">
      <div className="flex flex-row items-center justify-between">
        <p className="cursor-pointer text-xl" onClick={() => toggleMenuOpen(restaurant.id)}>{restaurant.name}</p>
        <div className="cursor-pointer flex flex-row items-center gap-4" onClick={() => handleModalOpen(restaurant)}>
          { restaurant.queues.length > 0 ? (
              <>
                <div>{`${formatDistance(new Date(restaurant.queues[0].updatedAt), new Date(), { addSuffix: true, locale: localeFi })}`}</div>
                <div style={{ backgroundColor: getQueueTimeBackgroundColor(Number(restaurant.queues[0].queueTime) || 0) }} className="px-4 py-2 rounded-full">{`${restaurant.queues[0].queueTime} min`}</div>
              </>
            ) : (
              <div>{t('no_recent_data')}</div>
          )}
        </div>
      </div>
      { menuOpen && (restaurant.menus.length > 0 ? (
          <>
            <div className="text-lg">{`Menu ${restaurant.menus[0].menuDate}`}</div>
            { (restaurant.menus[0].menu as { title: string, properties: string[] }[])?.map((menu, index) => (
                <div key={index} className="flex flex-row justify-between">
                  <div>
                    {menu.title.includes(":") ? (
                      <>
                        <div className="text-md">{menu.title.split(":")[0]}</div>
                        <div className="text-sm">{menu.title.split(":").slice(1)}</div>
                      </>
                    ) : <div>{menu.title.split(":")[0]}</div>}
                  </div>
                  <div>{menu.properties.join(", ")}</div>
                </div>
          )) }
          </>
      ) : <p>{t('menu_data_not_available')}</p>) }
    </div>
  )
}

// const lunchDates = [
//   {
//     id: "askldcjvasdoiucaqfgoxua",
//     title: "Thursday 12:00",
//     restaurant: "Täffä",
//     noUsers: 10,
//   },
//   {
//     id: "adisvuyascpiuasydaspciduyas",
//     title: "Friday 11:30",
//     restaurant: "A-Bloc",
//     noUsers: 1,
//   },
//   {
//     id: "wernwbqemnbtqwmrenb",
//     title: "Monday 13:00",
//     restaurant: "TUAS",
//     noUsers: 3,
//   },
//   {
//     id: "qwertyuiopasdfghjkzxcvbn",
//     title: "Tuesday 12:00",
//     restaurant: "Täffä",
//     noUsers: 2,
//   },
//   {
//     id: "qwermqbnewrmbcxoiuvdsofiuvs",
//     title: "Tuesday 17:00",
//     restaurant: "A-Bloc",
//     noUsers: 1,
//   },
//   {
//     id: "kakkakakkakakkakakkakakakka",
//     title: "Friday 17:30",
//     restaurant: "Kvarkki",
//     noUsers: 7,
//   },
// ];

// const lunchDates = [];

const LunchDate: React.FC<{ lunchDate: LunchDateProp, modalOpen: boolean }> = ({
  lunchDate, modalOpen,
}) => {
  const router = useRouter();

  const distanceString = lunchDate.date ? formatRelative(new Date(lunchDate.date), new Date()) : null;

  const onLunchDateClick = () => {
    console.log("ass");
    router.push(`/lunchDates/${lunchDate.id}`)
  }

  return (
    <div
      style={{ zIndex: modalOpen ? -1 : 'auto', maxWidth: '200px' }}
      onClick={() => onLunchDateClick()}
      className="bg-white m-2 p-2 pb-5 shadow border rounded-lg relative cursor-pointer"
      >
      <div
        className="border-b"
        onClick={() => onLunchDateClick()}
        >
        {lunchDate.UserGroup.name}
      </div>
      <p className="text-lg">
        {`${lunchDate.restaurant?.name} ${distanceString && `at ${distanceString}`}`}
      </p>
      <div className="flex flex-row items-center absolute bottom-0 right-0 mr-1 mb-1 gap-1">
        {lunchDate._count.users}
        <FaUser />
      </div>
    </div>
  )
}

const Home: React.FC<{
  restaurantProps: (Restaurant & { queues: RestaurantQueue[], menus: RestaurantMenu[] })[],
  locale: string,
  lunchDateProps: LunchDateProp[],
}> = ({ restaurantProps, locale, lunchDateProps }) => {
  const [restaurants, setRestaurants] = useState(restaurantProps);
  const [openRestaurantIds, setOpenRestaurantIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRestaurant, setModalRestaurant] = useState<{ name: string, id: number } | null>(null);
  const t = useTranslations('index');

  useEffect(() => { setRestaurants(restaurantProps) }, [restaurantProps])

  const toggleMenuOpen = (id: number) => {
    const idIndex = openRestaurantIds.indexOf(id)
    if (idIndex > -1) {
      setOpenRestaurantIds(openRestaurantIds.filter((i) => i !== id));
      return;
    }
    setOpenRestaurantIds(openRestaurantIds.concat(id));
  }

  const handleQueueUpdate = async (val: number) => {
    setModalOpen(false);

    if (!modalRestaurant?.name || !modalRestaurant?.id) {
      setModalRestaurant(null);
      return;
    }

    const res = await fetch("/api/restaurants/queues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        restaurantId: modalRestaurant.id,
        queueTime: val,
      })
    });

    const body = await res.json();

    if (body.restaurants) {
      setRestaurants(body.restaurants);
    }

    console.log(body);
  }

  const handleModalOpen = (
    restaurant: Restaurant &
      { queues: RestaurantQueue[], menus: RestaurantMenu[] }
  ) => {
    setModalRestaurant({ id: restaurant.id, name: restaurant.name });
    setModalOpen(true);
  }

  return (
    <Layout>
      <Modal open={modalOpen} restaurantName={modalRestaurant?.name} handleClose={() => setModalOpen(false)} handleQueueUpdate={handleQueueUpdate} />
      <div className="page pb-16">
        <div><h1 className="text-center mb-4 mt-6 text-5xl">{t('smartq')}</h1></div>
        <div>
          <h1 className="text-center text-3xl py-2">{t('next_lunchdates')}</h1>
          <div className="flex flex-row flex-wrap justify-center max-w-screen-md mx-auto">
            {
              lunchDateProps?.length > 0 ? (
                lunchDateProps.map((ld) => (
                  <LunchDate key={ld.id} lunchDate={ld} modalOpen={modalOpen} />
                ))
              ) : (
                <div>{t('no_lunchdates')}</div>
              )
            }
          </div>
        </div>
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-center text-3xl py-2">{t('menu_queue')}</h1>
          <p className="text-center py-2">{t('sorting_and_selection_in_next')}</p>
          {
            restaurants?.length > 0 && restaurants.map((p) => {
              return (
                <RestaurantItem
                  key={p.id}
                  menuOpen={openRestaurantIds.includes(p.id)}
                  toggleMenuOpen={toggleMenuOpen}
                  restaurant={p}
                  handleModalOpen={handleModalOpen}
                  locale={locale}
                  />
              );
            })
          }
        </div>
      </div>
    </Layout>
  );
};

export default Home;
