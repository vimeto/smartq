import { User } from ".prisma/client";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import Layout from "../Layout";

interface ProfilePageProps {
  user: User;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const t = useTranslations('profile');

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    const filename = encodeURIComponent(file.name);

    const formData = new FormData();
    formData.append("file", file as Blob);

    const upload = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      }
      // headers: {
      //   'Content-Type': "form-data"
      //   // 'Content-Type': "multipart/form-data; boundary=---------------------------974767299852498929531610575"
      // }
    });

    console.log(upload.status)



    // const res = await fetch(`/api/storage/upload-url?file=${filename}`);
    // const { url, fields } = await res.json();
    // const formData = new FormData();

    // Object.entries({ ...fields, file }).forEach(([key, value]) => {
    //   formData.append(key, value as string | Blob);
    // });

    // console.log(url);

    // const upload = await fetch(url, {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     'Access-Control-Allow-Origin': '*'
    //   }
    // });

    // if (upload.ok) {
    //   console.log('Uploaded successfully!');
    // } else {
    //   console.error('Upload failed.');
    // }
  };

  return (
    <Layout>
      <div className="w-8/12 mx-auto pt-10 container-sm">
        <p>Upload a .png or .jpg image (max 1MB).</p>
        <input
          onChange={uploadPhoto}
          type="file"
          accept="image/png, image/jpeg"
        />
        <div className="mx-auto h-screen max-h-52 block relative">
          {
           user.image ? (
              <Image
                alt={t('profile_pic_alt')}
                src='https://storage.googleapis.com/smart-q-bucket/smartq/pics/Screenshot%202022-10-28%20at%2010.39.52.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=smart-q-storage%40teknet-362114.iam.gserviceaccount.com%2F20221103%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20221103T083506Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=439ad70e07f73f34fe588f6914bd65b92f2787115808a873dc4a9735311ae965ff835e257582f42a27385d29a315ca4324c4d5d81e6efeaaa2db10f891433248d31ff9edaf19042fe641d4c606f873298240fb16513e5666b33d405bcca7aea43350007541bd0225ad56833af4246d6318460af826b38a601dfeb4f64d2fc89f6d2ae33e006cddc30dbd661306ed83cafbe230cb5cff18d7a8c236698791b9c9402f5b949a71875100f693702bec753a6f6da22101acb264ed811ad9105abb1dddac5acab4afb138de2327d5ee15595c8eb5e79539b19e74b5013f1ec510dc678e5982d2a25dd561958fa4072f5bc49b06c6a3a2cc7a2c56c69c8d23494966ae'
                // src={user.image || ""}
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
}

export default ProfilePage;
