import formatRelative from "date-fns/formatRelative";
import { useRouter } from "next/router";
import { FaUser } from "react-icons/fa";
import { lunchDateWithCountAndUserGroup } from "../../lib/types";


const LunchDate: React.FC<{ lunchDate: lunchDateWithCountAndUserGroup, modalOpen: boolean }> = ({
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

export default LunchDate;
