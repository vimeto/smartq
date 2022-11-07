import React from "react";
import { User } from "@prisma/client";

import ProfilePage from "../components/profile/ProfilePage";
import { getProfileServerSideProps } from "../lib/profile/utils";

export const getServerSideProps = getProfileServerSideProps

const Profile: React.FC = ({ user }: { user: User }) => {
  return (
    <ProfilePage user={user} />
  );
};

export default Profile;
