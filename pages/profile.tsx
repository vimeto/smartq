import React from "react";
import { useTranslations } from 'next-intl';

import Layout from "../components/Layout";
import { getSession, signOut, useSession } from "next-auth/react";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import Image from "next/image";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props:{},
    };
  }

  const userFromDb = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });
  return {
    props: {
      user: JSON.parse(JSON.stringify(userFromDb))
    }
  }
}

const LunchDate: React.FC = ({ user }: { user: User }) => {
  // const { data, status } = useSession();
  const t = useTranslations('profile');

  return (
    <Layout>
      <div className="w-8/12 mx-auto pt-10 container-sm">
        <div className="mx-auto h-screen max-h-52 block relative">
          {
           user.image ? (
              <Image
                alt={t('profile_pic_alt')}
                src={user.image || ""}
                layout="fill"
                objectFit="contain"
                />
            ) : <p>{t('no_picture')}</p>
          }
        </div>
        <div className="mt-4">
          <p className="font-bold">{t("name")}</p>
          <p>{user.name}</p>
        </div>
        <div className="mt-4">
          <p className="font-bold">{t("username")}</p>
          <p>{user.username || "You have not assigned a username (not possible yet)"}</p>
        </div>
        <div className="mt-4">
          <p className="font-bold">{t("email")}</p>
          <p>{user.email}</p>
        </div>
        <div className="mt-4">
          <p>{t("more_customization_coming_soon")}</p>
        </div>

        <button
          className="px-4 py-2 rounded bg-red-300 mt-4"
          onClick={() => signOut()}>{t('logout')}</button>
      </div>
    </Layout>
  );
};

export default LunchDate;
