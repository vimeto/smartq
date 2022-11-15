import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "../prisma";


export const getProfileServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {},
    };
  }

  const userFromDb = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });

  if (!userFromDb.guildConfigured) {
    return {
      redirect: {
        permanent: true,
        destination: "/guildStepper",
      },
      props: {},
    };
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify(userFromDb))
    }
  }
}
