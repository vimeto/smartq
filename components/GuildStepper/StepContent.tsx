import { UserGroup } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext, useController, Controller } from "react-hook-form";
import { ActivityLevel, UserWithUserGroups } from "../../lib/types";

export const IntroStep = () => {
  return (
    <div className="text-center mb-10">
      <h2 className="font-semibold text-xl">{'Welcome!'}</h2>
      <div>{'Couple steps before you can start using the app.'}</div>
    </div>
  );
};

export const UniversityStep = ({ universities }: { universities: UserGroup[] }) => {
  const { control } = useFormContext();

  const {
    field: { onChange, value },
  } = useController({
    name: "university",
    control,
  });

  return (
    <div className="text-center mb-10">
      <h2 className="font-semibold text-xl">{"Select your university"}</h2>
      <select
        className="select select-bordered w-full max-w-xs mt-2"
        onChange={onChange}
        value={value ?? ""}
      >
        <option value={""} disabled>Pick your university</option>
        {universities.map((uni) => (
          <option key={uni.id} value={uni.id}>{uni.name}</option>
        ))}
        {/* <option value={"Aalto"}>Aalto University</option>
        <option value={"Helsinki"}>Helsinki University</option> */}
      </select>
    </div>
  );
};

export const GuildStep = () => {
  const [loading, setLoading] = useState(true);
  const [guilds, setGuilds] = useState<UserGroup[]>([]);
  const { control } = useFormContext();

  const {
    field: { value: uniValue },
  } = useController({
    name: "university",
    control,
  });

  useEffect(() => {
    const a = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/userGroups/getChildren/${uniValue}`,
      );

      const data = await res.json();

      console.log(res.status, data);
      data?.userGroups && setGuilds(data?.userGroups);
      setLoading(false);
    }
    uniValue && a();
  }, [uniValue]);

  const {
    field: { onChange, value },
  } = useController({
    name: "guild",
    control,
  });

  return (
    <div className="text-center mb-10">
      <h2 className="font-semibold text-xl">{"Select your guild"}</h2>
      {loading ? <p>loading...</p> : (
        <select
          className="select select-bordered w-full max-w-xs mt-2"
          onChange={onChange}
          value={value ?? ""}
        >
          <option value={""} disabled>Pick your guild</option>
          {guilds.map((guild) => (
            <option key={guild.id} value={guild.id}>{guild.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export const ConclusionStep = () => {
  const { control } = useFormContext();

  const {
    field: { value: selectedGuild },
  } = useController({
    name: "guild",
    control,
  });

  const {
    field: { value: selectedUniversity },
  } = useController({
    name: "university",
    control,
  });

  return (
    <div className="text-center mb-10">
      <h2 className="font-semibold text-xl">{"Ok, here's your selection"}</h2>
      <div>
        <p>{selectedUniversity}</p>
        <p>{selectedGuild}</p>
      </div>
    </div>
  );
};

export const SharingStep = () => {
  const t = useTranslations("registration");

  const { control } = useFormContext();

  const {
    field: { onChange, value },
  } = useController({
    name: "sharing",
    control,
  });

  return (
    <div className="w-3/4 mx-auto">
      <h2>{t("steps.sharing.header")}</h2>
      <div>{t("steps.sharing.description")}</div>
      <div className="pt-6">
        <div className="pb-2">
          <div
            onClick={() => onChange(true)}
          >
            <div className="p-2 flex flex-col items-center justify-center">
              <div>{t("steps.sharing.share")}</div>
            </div>
          </div>
        </div>
        <div className="pb-2">
          <div
            onClick={() => onChange(false)}
          >
            <div className="p-2 flex flex-col items-center justify-center">
              <div>{t("steps.sharing.dontShare")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
