import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
// import { CiHome, CiUser, CiChat1 } from 'react-icons/ci';
import { FaHome, FaUser, FaUtensils } from 'react-icons/fa';

// use signOut() to sign out

// const MyButton = React.forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement>(({ onClick, href }, ref) => {
//   return (
//     <a href={href} onClick={onClick} ref={ref}>
//       Click Me
//     </a>
//   )
// })

const Header: React.FC = () => {
  const router = useRouter();
  const isActive = (pathname: string) => router.pathname === pathname;
  const { data: session, status } = useSession();

  if (!session) {
    return <></>;
  }

  return (
    <nav className="fixed bottom-0 inset-z-0 w-screen shadow-inner h-16 bg-white z-10">
      <div className="container mx-auto py-2">
        <div className="flex flex-row justify-around">
          <Link href="/lunchDates">
            <a>
              <FaUtensils className={`text-5xl ${isActive("/lunchDates") ? "text-black" : "text-gray-600"}`} />
              {/* <CiChat1 className={`text-5xl ${isActive("/lunchDate") ? "text-black" : "text-gray-600"}`} /> */}
            </a>
          </Link>
          <Link href="/">
            <a>
              <FaHome className={`text-5xl ${isActive("/") ? "text-black" : "text-gray-600"}`} />
              {/* <CiHome className={`text-5xl ${isActive("/") ? "text-black" : "text-gray-600"}`} /> */}
            </a>
          </Link>
          <Link href="/profile">
            <a>
              <FaUser className={`text-5xl ${isActive("/profile") ? "text-black" : "text-gray-600"}`} />
              {/* <CiUser className={`text-5xl ${isActive("/profile") ? "text-black" : "text-gray-600"}`} /> */}
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
