import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";
import differenceInDays from "date-fns/differenceInDays";
import differenceInHours from "date-fns/differenceInHours";
import differenceInMinutes from "date-fns/differenceInMinutes";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { AnimatePresence, motion } from "framer-motion";
import localeFi from 'date-fns/locale/fi';
import parseISO from "date-fns/parseISO";
import { useTranslations } from "next-intl";

const getQueueTimeBackgroundColor = (queueTime: number) => {
  const percentage = (60 - Math.min(queueTime, 60)) / 60 * 100;

  return `hsl(${percentage}, 86%, 51%)`
}

const getLinearGradient = (
  restaurant: Restaurant &
  { queues: RestaurantQueue[], menus: RestaurantMenu[] }
) => {
  const backGroundCol = getQueueTimeBackgroundColor(Number(restaurant.queues[0].queueTime) || 0)
  const backGroundCol2 = getQueueTimeBackgroundColor(Number(restaurant.queues[0].queueTime) + 10 || 10)

  return `linear-gradient(0.25turn, ${backGroundCol}, ${backGroundCol2})`;
}

const getDifference = (t: string) => {
  const today = new Date();
  const time = parseISO(t);

  if (differenceInSeconds(today, time) < 10) {
    return 'NOW'
  } if (differenceInSeconds(today, time) < 60) {
    return '1 min'
  } if (differenceInHours(today, time) < 1) {
    return `${Math.ceil(differenceInMinutes(today, time) / 5) * 5} min`
  } if (differenceInDays(today, time) < 1) {
    return `${Math.ceil(differenceInHours(today, time))} h`
  }

  return 'over 24h ago'
}

const RestaurantMenu: React.FC<{ restaurant: Restaurant & { queues: RestaurantQueue[], menus: RestaurantMenu[] } }> = ({
  restaurant
}) => {
  const t = useTranslations('index');

  return (
    <div className="px-4 pb-2">
      {restaurant.menus.length > 0 ? (
        <>
          <div className="text-lg">{`Menu ${restaurant.menus[0].menuDate}`}</div>
          {(restaurant.menus[0].menu as { title: string, properties: string[] }[])?.map((menu, index) => (
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
          ))}
        </>
      ) : <p>{t('menu_data_not_available')}</p>
      }
    </div>
  )
}

const parentVarent = {
  show: {
    opacity: 1,
    height: "auto"
  },
  hide: {
    opacity: 0,
    height: 0,
  }
};

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

  // const backGroundCol = getQueueTimeBackgroundColor(Number(restaurant.queues[0].queueTime) || 0)
  // const backGroundCol2 = getQueueTimeBackgroundColor(Number(restaurant.queues[0].queueTime) + 1 || 1)

  return (
    <AnimatePresence>
      <div className="rounded-3xl m-2 shadow bg-white">
        <div className="h-14 py-2 pr-2 pl-4 flex flex-row items-center justify-between">
          <p className="cursor-pointer text-2xl select-none" onClick={() => toggleMenuOpen(restaurant.id)}>{restaurant.name}</p>
          <div className="cursor-pointer flex flex-row items-center gap-2" onClick={() => handleModalOpen(restaurant)}>
            {restaurant.queues.length > 0 ? (
              <>
                <div className="text-base font-light">{`${getDifference(restaurant.queues[0].updatedAt as unknown as string)}`}</div>
                <div style={{ background: getLinearGradient(restaurant) }} className="rounded-full w-20 py-2 flex justify-center">{`${restaurant.queues[0].queueTime} min`}</div>
              </>
            ) : (
              <div className="pr-2">{t('no_recent_data')}</div>
            )}
          </div>
        </div>

        <motion.div
          // whileHover={{ scale: 1.2 }}
          animate={menuOpen ? "show" : "hide"}
          style={{ originY: "0%" }}
          variants={parentVarent}
          className="overflow-hidden"
        >
          <RestaurantMenu restaurant={restaurant} />
        </motion.div>
      </div>
    </AnimatePresence >
  )
}

export default RestaurantItem;
