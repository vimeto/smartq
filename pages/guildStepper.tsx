import { User, UserGroup } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FormStepper } from "../components/GuildStepper/Stepper";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login ",
      },
      props: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });

  if (user.guildConfigured) {
    return {
      redirect: {
        permanent: true,
        destination: "/ ",
      },
      props: {},
    };
  }

  const universities = await prisma.userGroup.findMany({
    where: {
      category: 0
    },
  });

  return {
    props: { universities: JSON.parse(JSON.stringify(universities)) },
  };
}


const RegistrationStepper: NextPage<{ universities: UserGroup[] }> = ({ universities }) => {
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      university: "",
      guild: "",
    },
  });

  const onSubmit: (data: any) => Promise<void> = async (data: any) => {
    try {
      setLoading(true);
      console.log(data)
      const res = await fetch("/api/userProperties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      // setLoading(false);
      if (res.status >= 400) throw new Error("Failed to update profile");
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };
  const handleFinish = methods.handleSubmit(onSubmit);

  // TODO: replace with spinner component

  return (
    <Layout>
      <FormProvider {...methods}>
        {!loading ? <FormStepper handleFinish={handleFinish} universities={universities} /> : "loading..."}
      </FormProvider>
    </Layout>
  );
}


export default RegistrationStepper;
