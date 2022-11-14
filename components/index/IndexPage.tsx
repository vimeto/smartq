import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { lunchDateWithCountAndUserGroup } from "../../lib/types";
import Layout from "../Layout";
import Modal from "../Modal";
import LunchDateComponent from "./LunchDate";
import RestaurantItem from "./RestaurantItem";

const IndexPage: React.FC<{
  restaurantProps: (Restaurant & { queues: RestaurantQueue[], menus: RestaurantMenu[] })[],
  locale: string,
  lunchDateProps: lunchDateWithCountAndUserGroup[],
}> = ({ restaurantProps, locale, lunchDateProps }) => {
  const [restaurants, setRestaurants] = useState(restaurantProps);
  const [openRestaurantIds, setOpenRestaurantIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRestaurant, setModalRestaurant] = useState<{ name: string, id: number } | null>(null);
  const t = useTranslations('index');

  useEffect(() => {
    setRestaurants(restaurantProps);
    setOpenRestaurantIds(restaurantProps.map(r => r.id));
  }, [restaurantProps])

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
        <div>
          <h1 className="text-center text-4xl py-2">{t('next_lunchdates')}</h1>
          <div className="flex flex-row flex-wrap justify-center max-w-screen-md mx-auto">
            {
              lunchDateProps?.length > 0 ? (
                lunchDateProps.map((ld) => (
                  <LunchDateComponent key={ld.id} lunchDate={ld} modalOpen={modalOpen} />
                ))
              ) : (
                <div>{t('no_lunchdates')}</div>
              )
            }
          </div>
        </div>
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-center text-4xl py-2">{t('menu_queue')}</h1>
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

export default IndexPage;
