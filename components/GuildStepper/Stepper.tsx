import { UserGroup } from "@prisma/client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FaAngleLeft, FaAngleRight, FaCheck } from "react-icons/fa";
import { UserWithUserGroups } from "../../lib/types";
import {
  GuildStep,
  IntroStep,
  UniversityStep,
  ConclusionStep,
} from "./StepContent";

const Steps = ({ step }: { step: number }) => (
  <ul className="steps">
    <li className={`step ${step >= 0 && "step-primary"}`}>Info</li>
    <li className={`step ${step >= 1 && "step-primary"}`}>Choose Uni</li>
    <li className={`step ${step >= 2 && "step-primary"}`}>Choose Guild</li>
    <li className={`step ${step >= 3 && "step-primary"}`}>Finish</li>
  </ul>
);

const getStepContent = (step: number, universities: UserGroup[]) => {
  switch (step) {
    case 0:
      return <IntroStep />;
    case 1:
      return <UniversityStep universities={universities} />;
    case 2:
      return <GuildStep />;
    case 3:
      return <ConclusionStep />;
    default:
      return "Unknown step";
  }
};

export const FormStepper = ({ handleFinish, universities }: { handleFinish: () => void, universities: UserGroup[] }) => {
  const [step, setStep] = useState<number>(0);
  const { control } = useFormContext();

  const { field: { value: uniValue } } = useController({ name: "university", control });
  const { field: { value: guildValue } } = useController({ name: "guild", control });

  return (
    <div className="flex items-center w-full h-screen flex-col justify-end">
      <div>{getStepContent(step, universities)}</div>
      <div className="justify-self-end pb-16 flex items-center flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="p-4">
            <button
              className="btn btn-outline gap-2"
              onClick={() => setStep(Math.max(step - 1, 0))}
            >
              <FaAngleLeft />
              back
            </button>
          </div>
          <div className="p-4">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn btn-outline gap-2"
                >
                  {"next"}
                  <FaAngleRight />
              </button>
            ) : uniValue && guildValue && (
              <button
                onClick={handleFinish}
                className="btn btn-outline btn-success gap-2"
                >
                  {"finish"}
                  <FaCheck />
              </button>
            )}
          </div>
        </div>
        <div className="p-2">
          <Steps step={step} />
        </div>
      </div>
    </div>
  );
};
