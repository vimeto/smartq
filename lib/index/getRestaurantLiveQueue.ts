import { Restaurant, RestaurantMenu, RestaurantQueue } from "@prisma/client";

const ablocCalc = (x: number) => (
  x < 11.5 ?
    (5 * x - 49) :
    x < 13 ? (
      (-28.9 * x * x) + (706.8 * x) - 4297
    ) : (
      -x + 23
    )
)

const titeCale = (x: number) => (
  x < 11.5 ?
    (5 * x - 48) :
    x < 13 ? (
      (-28.9 * x * x) + (706 * x) - 4296
    ) : 3
)


const taffacalc = (x: number) => (
  x < 11.5 ?
    (5 * x - 47) :
    x < 13 ? (
      (-29 * x * x) + (709 * x) - 4296
    ) : 3
)

const kvarkkicalc = (x: number) => (
  x < 11.5 ?
    (5 * x - 50) :
    x < 13 ? (
      (-7.5 * x * x) + (177 * x) - 1030.3
    ) : 3
)


const data = {
  "Tietotekniikantalo": {
    opens: 10,
    closes: 15,
    calculator: titeCale
  },
  "Täffä": {
    opens: 10,
    closes: 14,
    calculator: taffacalc
  },
  "Kvarkki": {
    opens: 10,
    closes: 15,
    calculator: kvarkkicalc
  },
  "A Bloc": {
    opens: 10,
    closes: 18,
    calculator: ablocCalc
  },
}

const getRestaurantLiveQueue = (restaurant: Restaurant &
{ queues: RestaurantQueue[], menus: RestaurantMenu[] }) => {
  if (!data[restaurant.name]) {
    return undefined;
  }

  const today = new Date()
  const timehours = today.getHours() + (today.getMinutes() / 60)
  // const timehours = 11;

  const res = data[restaurant.name] as { opens: number, closes: number, calculator: (a: number) => number };

  if (timehours < res.opens || timehours > res.closes) {
    return -1;
  }

  const name = restaurant.name;
  const d = Math.round(data[name].calculator(timehours));
  return d;
}

export {
  getRestaurantLiveQueue,
}
