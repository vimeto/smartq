import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';

import { RestaurantNameAndIdAsValue, UserGroupsWithLunchDate } from "../../lib/lunchDates/types";
import Layout from "../Layout";
import { format } from 'date-fns';
import { lunchDateWithCountAndUserGroup, LunchDateWithCountAndUserGroupAndUserJoined } from '../../lib/types';
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';

const LunchDate: React.FC<{ lunchDate: LunchDateWithCountAndUserGroupAndUserJoined }> = ({
  lunchDate
}) => {
  const router = useRouter();

  const handleOpenChat = async (lunchDate: LunchDateWithCountAndUserGroupAndUserJoined) => {
    if (lunchDate.userJoined) {
      router.push(`/lunchDates/${lunchDate.id}`);
      return;
    }
    const res = await fetch("/api/lunchDates/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ lunchDateId: lunchDate.id })
    });

    if (res.status === 200) {
      router.push(`/lunchDates/${lunchDate.id}`)
    }
  }
  return (
    <div className='p-1 border rounded hover:border-emerald-200 mt-2'>
      <h3 className="font-light text-sm">{lunchDate.UserGroup.name}</h3>
      <div className='flex flex-row justify-between'>
        <p>{lunchDate.restaurant.name}</p>
        <p>{format(new Date(lunchDate.date), "HH:mm")}</p>
      </div>
      <div className='flex justify-center items-center gap-2'>
        <div className='flex items-center gap-1'>
          <p>{lunchDate._count.users}</p>
          <FaUser />
        </div>
        <button
          className={`py-2 px-6 rounded-full ${lunchDate.userJoined ? 'bg-cyan-200' : 'bg-emerald-200'}`}
          onClick={() => handleOpenChat(lunchDate)}
        >
          {lunchDate.userJoined ? 'Open' : 'Join'}
        </button>
      </div>
    </div>
  )
}

const Loader: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <div className="flex justify-center mt-2">
      {show && <CircularProgress />}
    </div>
  )
}

const NewLunchDatePage: React.FC<{
  userGroupsProps: UserGroupsWithLunchDate[],
  restaurants: RestaurantNameAndIdAsValue[],
}> = ({ userGroupsProps, restaurants }) => {
  const router = useRouter();

  const [value, setValue] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [lunchDates, setLunchDates] = useState<LunchDateWithCountAndUserGroupAndUserJoined[]>([]);
  // 0 = not fetched, 1 = fetched etc.
  const [step, setStep] = useState(0);
  const [groupValue, setGroupValue] = useState<{ label: string, id: string }>({ label: "", id: "" });
  const [restaurantValue, setRestaurantValue] = useState<{ label: string, id: string }>({ label: "", id: "" });
  const [myUserGroups, setMyUserGroups] = useState<{ label: string, id: string }[]>([]);

  const ress = () => restaurants.map(r => ({ label: r.name, id: r.value }));

  const fetchLunchDates = async (date: Date) => {
    setLoading(true);
    const res = await fetch(
      "/api/lunchDates/myGroups",
      {
        method: "POST",
        body: JSON.stringify({ date }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const body = await res.json();

    if (res.status == 200 && body.lunchDates) { setLunchDates(body.lunchDates); }

    setLoading(false);
    setStep(1);
  }

  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
    if (step <= 1) fetchLunchDates(newValue);
  };

  const sendResult = async () => {
    if (!value || !restaurantValue.id || !groupValue.id) { return; }

    const res = await fetch("/api/lunchDates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: value,
        restaurantId: restaurantValue.id,
        userGroupId: groupValue.id,
      })
    });

    if (res.status === 200) {
      router.push("/");
    }
  }

  const openCreateLunchDate = async () => {
    setLoading(true);
    const res = await fetch(
      "/api/userGroups/myGroups",
      { method: "GET" }
    );

    const body = await res.json();

    if (res.status == 200 && body.userGroups) {
      console.log(body.userGroups)
      setMyUserGroups(body.userGroups);
    }

    setLoading(false);
    setStep(2);
  }

  return (
    <Layout>
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-full mx-2 max-w-xs p-2 rounded-3xl bg-white shadow">
          <p className="pb-2 my-2 text-xl text-center">Find Company for Lunching</p>
          <div className="text-center">
            <MobileDatePicker
              label="Pick date"
              inputFormat="dd/MM/yyyy"
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </div>
          {step === 2 && (
            <>
              <div className="my-2">
                <TimePicker
                  label="Time"
                  value={value}
                  minutesStep={5}
                  ampm={false}
                  onChange={handleChange}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </div>
              <Autocomplete
                disablePortal
                id="select-user-group"
                options={myUserGroups}
                fullWidth
                // sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Group" />}
                value={groupValue}
                isOptionEqualToValue={(option, value) => option.label === value.label}
                onChange={(e, v) => { if (typeof v == "object") setGroupValue(v);}}
              />
              <Autocomplete
                disablePortal
                id="select-restaurant"
                options={ress()}
                fullWidth
                sx={{ marginTop: "8px" }}
                renderInput={(params) => <TextField {...params} label="Restaurant" />}
                value={restaurantValue}
                isOptionEqualToValue={(option, value) => option.label === value.label}
                onChange={(e, v) => { if (typeof v == "object") setRestaurantValue(v);}}
              />
              <div className="flex justify-center m-2" onClick={sendResult}>
                <button className="btn btn-outline">Create!</button>
              </div>
            </>
          )}
          <Loader show={loading} />
          {lunchDates.length === 0 && step === 1 && (
            <div className='flex justify-center'>No lunchdates for this day...</div>
          )}
          {step === 0 && (<div className="flex justify-center mt-2" onClick={() => fetchLunchDates(value)}>
            <button className="btn btn-outline">Search</button>
          </div>)}
          {step === 1 && (
            <>
              {lunchDates.map(ld => <LunchDate key={ld.id} lunchDate={ld} />)}
              <div className="flex justify-center mt-2">
                <button
                  className="btn btn-outline"
                  onClick={() => openCreateLunchDate()}
                >
                  {"Didn't find a suitable one? Create!"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewLunchDatePage;
