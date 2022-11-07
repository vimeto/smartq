import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";
import formatDistance from "date-fns/formatDistance";
import localeFi from 'date-fns/locale/fi';
import { useTranslations } from "next-intl";

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

export default RestaurantItem;
