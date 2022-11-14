import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useLunchDates } from "../../lib/lunchDates/hook";
import { RestaurantNameAndIdAsValue, UserGroupsWithLunchDate } from "../../lib/lunchDates/types";
import Layout from "../Layout";
import Group from "./Group";


const LunchDatePage: React.FC<{
  userGroupsProps: UserGroupsWithLunchDate[],
  restaurants: RestaurantNameAndIdAsValue[],
}> = ({ userGroupsProps, restaurants }) => {
  const [selectedCreateJoinTab, setSelectedCreateJoinTab] = useState<number | null>(null);
  const t = useTranslations("lunch_dates")

  const {
    joinExistingGroupState,
    createNewGroupState,
    userGroups,
    handleJoinCodeUpdate,
    handleCreateCodeUpdate,
    handleNewGroupNameUpdate,
    joinNewUserGroup,
    createNewUserGroup,
    createNewLunchDate
  } = useLunchDates(userGroupsProps, restaurants);

  return (
    <Layout>
      <div className="page pb-16">
        <div><h1 className="text-center mb-4 mt-6 text-5xl">{t('lunch_dates')}</h1></div>
        <div className="max-w-screen-md mx-auto">
          <div className="m-2 flex flex-row gap-2">
            <div
              className={`shadow-lg bg-gradient-to-r from-emerald-200 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-center w-6/12 rounded-full py-2 px-4 cursor-pointer flex items-center justify-center`}
              onClick={() => {setSelectedCreateJoinTab(selectedCreateJoinTab === 1 ? null : 1)}}
              >
              {t("create_new.title")}
            </div>
            <div
              className={`shadow-lg bg-gradient-to-r from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 text-center w-6/12 rounded-full py-2 px-4 inline-block`}
              onClick={() => {setSelectedCreateJoinTab(selectedCreateJoinTab === 2 ? null : 2)}}
              >
              {t("join_existing.title")}
            </div>
          </div>
          <div className={`m-2 shadow rounded-3xl p-6 flex flex-row justify-between items-end ${selectedCreateJoinTab === 2 ? 'block' : 'hidden'}`}>
            <div>
              <p className="text-xl mb-4 pl-1">
                {t('join_existing.login_code')}
              </p>
              <div className="flex flex-row items-center gap-2">
                <input
                  className="p-1"
                  placeholder={t('join_existing.login_code_placeholder')}
                  type="text"
                  value={joinExistingGroupState.externalId}
                  onChange={handleJoinCodeUpdate}
                  />
                <FaCheck
                  color="#03AF13"
                  visibility={joinExistingGroupState.id ? 'visible' : 'hidden'}
                  />
              </div>
            </div>
            <div>
              <button
                className={`shadow-sm bg-stone-200 rounded-full py-2 px-6 ${!joinExistingGroupState.id ? 'opacity-30' : 'hover:bg-stone-300'}`}
                disabled={!joinExistingGroupState.id}
                onClick={joinNewUserGroup}
                >
                  {t('join_existing.join')}
                </button>
            </div>
          </div>
          <div className={`m-2 shadow rounded-3xl bg-white p-6 flex flex-row justify-between items-end ${selectedCreateJoinTab === 1 ? 'block' : 'hidden'}`}>
            <div>
              <div>
                <p className="text-xl mb-4 pl-1">
                  {t('create_new.group_name')}
                </p>
                <input
                  placeholder={t('create_new.group_name_placeholder')}
                  type="text"
                  value={createNewGroupState.name}
                  onChange={handleNewGroupNameUpdate}
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
                    value={createNewGroupState.externalId}
                    onChange={handleCreateCodeUpdate}
                    />
                  <FaCheck
                    color="#03AF13"
                    visibility={(createNewGroupState.id || createNewGroupState.externalId.length !== 8) ? 'hidden' : 'visible'}
                    />
                </div>
              </div>
            </div>
            <div>
              <button
                className={`py-2 px-6 bg-emerald-200 rounded-full ${(createNewGroupState.id || createNewGroupState.externalId.length !== 8) ? 'opacity-30' : 'hover:bg-emerald-300'}`}
                disabled={!(createNewGroupState.id || createNewGroupState.externalId.length === 8)}
                onClick={createNewUserGroup}
                >
                  {t('create_new.create')}
              </button>
            </div>
          </div>
          {
            userGroups?.length > 0 && userGroups.map(g => (
              <Group key={g.id} group={g} restaurants={restaurants} handleCreateNewLunchDate={createNewLunchDate} />
            ))
          }
        </div>
      </div>
    </Layout>
  );
};

export default LunchDatePage;
