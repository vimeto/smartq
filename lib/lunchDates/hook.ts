import { useEffect, useState } from "react";
import { RestaurantNameAndIdAsValue, UserGroupsWithLunchDate } from "./types";


const useLunchDates = (initialUserGroups: UserGroupsWithLunchDate[], initialRestaurants: RestaurantNameAndIdAsValue[]) => {
  const [userGroups, setUserGroups] = useState<UserGroupsWithLunchDate[]>([]);
  const [joinExistingGroupState, setJoinExistingGroupState] = useState({
    externalId: "",
    id: null as (null | string),
  });
  const [createNewGroupState, setCreateNewGroupState] = useState({
    name: "",
    externalId: "",
    id: null as (null | string),
  });

  useEffect(() => {
    setUserGroups(initialUserGroups)
  }, [initialUserGroups])

  const handleJoinCodeUpdate: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const joinCode = event.target.value.slice(0, 8);
    setJoinExistingGroupState({ externalId: joinCode, id: null })
    if (joinCode.length !== 8) { return; }

    const body = await (await fetch("/api/userGroups/externalIds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: joinCode,
      })
    })).json();

    setJoinExistingGroupState({ externalId: joinCode, id: body?.id })
  }

  const handleCreateCodeUpdate: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const createCode = event.target.value.slice(0, 8);

    setCreateNewGroupState({ ...createNewGroupState, externalId: createCode })
    if (createCode.length !== 8) { return; }

    const body = await (await fetch("/api/userGroups/externalIds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: createCode,
      })
    })).json();

    setCreateNewGroupState({ ...createNewGroupState, externalId: createCode, id: body?.id })
  }

  const joinNewUserGroup = async () => {
    if (!joinExistingGroupState.id) {
      return;
    }

    const body = await (await fetch("/api/userGroups/joinById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: joinExistingGroupState.id,
      })
    })).json();

    if (body.userGroup?.id) {
      setJoinExistingGroupState({ externalId: "", id: null });
      // TODO: update this to smth more efficient
      setUserGroups(current => {
        if (current.find(oldusergroup => oldusergroup.id === body.userGroup.id)) {
          return current.map(oldusergroup => oldusergroup.id === body.userGroup.id ? body.userGroup : oldusergroup);
        } else {
          return current.concat(body.userGroup);
        }
      });
    }
  }

  const createNewUserGroup = async () => {
    if (createNewGroupState.id || !createNewGroupState.name || !createNewGroupState.externalId) {
      return;
    }

    const body = await (await fetch("/api/userGroups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        externalId: createNewGroupState.externalId,
        name: createNewGroupState.name,
      })
    })).json();

    if (body.userGroup) {
      setCreateNewGroupState({ externalId: "", id: null, name: "" });
      setUserGroups(current => {
        if (current.find(oldusergroup => oldusergroup.id === body.userGroup.id)) {
          return current.map(oldusergroup => oldusergroup.id === body.userGroup.id ? body.userGroup : oldusergroup);
        } else {
          return current.concat(body.userGroup);
        }
      });
    }
  }

  const createNewLunchDate = async (date: Date, restaurantId: string, userGroupId: string) => {
    if (!date || !restaurantId) { return; }

    const body = await (await fetch("/api/lunchDates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        restaurantId,
        userGroupId,
      })
    })).json();

    if (body.lunchDate) {
      setUserGroups((current) =>
        current.map(group => (
          group.id === body.lunchDate?.userGroupId ?
            ({ ...group, lunchDates: group.lunchDates.concat(body.lunchDate) })
            : group
        ))
    )
    }
  }

  const handleNewGroupNameUpdate: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setCreateNewGroupState({ ...createNewGroupState, name: event.target.value })
  }

  return {
    joinExistingGroupState,
    createNewGroupState,
    userGroups,
    handleJoinCodeUpdate,
    handleCreateCodeUpdate,
    handleNewGroupNameUpdate,
    joinNewUserGroup,
    createNewUserGroup,
    createNewLunchDate
  }

}

export { useLunchDates };
