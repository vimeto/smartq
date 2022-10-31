import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import type { LunchDate, User, Chat, Restaurant } from '@prisma/client'
import { getSession } from "next-auth/react";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import { FaArrowCircleUp } from "react-icons/fa";
import Layout from "../../components/Layout";
import { formatRelative } from "date-fns";
import { io } from "socket.io-client";
import styles from '../../styles/LunchDateChat.module.css';
import { useTranslations } from "next-intl";

type LunchDateProp = LunchDate & {
  users: User[];
  restaurant: Restaurant,
  chats: (Chat & {
      user: User;
  })[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { id } = context.params;

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/login ",
      },
      props:{},
    };
  }

  try {
    const lunchDate = await prisma.lunchDate.findUniqueOrThrow({
      where: {
        id: String(id),
      },
      include: {
        users: true,
        restaurant: true,
        chats: {
          include: {
            user: true
          }
        }
      }
    });

    const me = await prisma.user.findUniqueOrThrow({
      where: {
        email: session.user.email
      }
    })

    return {
      props: {
        lunchDateProps: JSON.parse(JSON.stringify(lunchDate)),
        user: JSON.parse(JSON.stringify(me)),
      }
    }
  } catch(err) {
    console.log(err);
    return {
      notFound: true,
    }
  }
}

const LunchDate: React.FC<{ lunchDateProps: LunchDateProp, user: User }> = ({
  lunchDateProps, user
}) => {
  const bottomRef = useRef(null);
  const [lunchDate, setLunchDate] = useState(lunchDateProps);
  const [newMessage, setNewMessage] = useState("");
  const t = useTranslations('chat');

  useEffect(() => {
    setLunchDate(lunchDateProps)
  }, [lunchDateProps])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lunchDate])

  // useEffect(() => {
  //   const enterKeypress = (e: KeyboardEvent) => {
  //     if (e.key === "Enter") {
  //       handleMessageSend();
  //     }
  //   }

  //   const elem = document.getElementById("new-message-input")

  //   elem.addEventListener("keypress", enterKeypress, true);

  //   return () => elem.removeEventListener("keypress", enterKeypress)
  // });

  const enterKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleMessageSend();
    }
  }

  useEffect(() => {
    (async () => await initializeSocket())();
  }, []);

  const handleMessageSend = async () => {
    if (newMessage.length === 0) { return; }

    await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lunchDateId: lunchDate.id,
        content: newMessage
      })
    })

    setNewMessage("");
  }

  const initializeSocket = async () => {
    await fetch("/api/socket")
    const socket = io();

    socket.on("connect", () => {
      console.log("socket connected")
    });

    socket.on("message", msg => {
      console.log(msg);
      setLunchDate(current => {
        return { ...current, chats: current.chats.concat(msg) }
      });
    });
  }

  return (
    <Layout>
      <div className="w-screen">
        <div className={`z-10 fixed bottom-16 px-2 py-2 w-full flex justify-between bg-gray-200`}>
          <input
            id="new-message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full py-2 px-2 rounded-l-lg focus-visible:outline-none"
            placeholder={t("new_message")}
            onKeyDown={enterKeypress}
            />
          <button
            className="bg-white rounded-r-lg"
            onClick={handleMessageSend}
            >
            <FaArrowCircleUp
              className="text-green-600 text-3xl mx-1"
              />
          </button>
        </div>
        <div
          className="text-2xl text-center border-b-2 bg-white py-2 fixed top-0 w-full h-12"
          >
            {`${lunchDate?.restaurant.name ? lunchDate?.restaurant.name : ''} ${lunchDate?.date ? ` ${formatRelative(new Date(lunchDate?.date), new Date())}` : ''}`}
            {/* { lunchDate?.date ? formatRelative(new Date(lunchDate?.date), new Date()) : '' } */}
            {/* `${lunchDate?.restaurant.name} on: ${formatRelative(new Date(lunchDate?.date), new Date())}`} */}
        </div>
        <div className={`fixed w-screen overflow-x-scroll top-12 ${styles.container}`}>
          <div className="px-2 pt-4">
            {
              lunchDate?.chats.map((chat) => (
                <div key={chat.id}>
                  {
                    user.id === chat.userId ? (
                      <div className="w-full mb-4 text-right flex justify-end">
                        <div className="bg-blue-500 p-2 text-white w-8/12 text-right rounded-xl rounded-br-none">
                          <div className="text-lg">{chat.content}</div>
                          <div className="text-sm">{chat.user.name}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full mb-4 text-left flex justify-start">
                        <div className="bg-gray-300 p-2 text-black w-8/12 text-left rounded-xl rounded-bl-none">
                          <div className="text-lg">{chat.content}</div>
                          <div className="text-sm">{chat.user.name}</div>
                        </div>
                      </div>
                      // <div className="bg-gray-300 text-black w-8/12 text-left float-left mb-4 p-2 rounded-xl rounded-bl-none">
                      //   <div className="text-lg">{chat.content}</div>
                      //   <div className="text-sm">{chat.user.name}</div>
                      // </div>
                    )
                  }

                </div>
              ))
            }
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LunchDate;
