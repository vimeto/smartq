import { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";
import { FaGoogle, FaExclamationTriangle } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (session) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
      props:{},
    };
  }

  return {
    props: {}
  }
}

const Login: React.FC = () => {
  const [loginSelected, setLoginSelected] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputStates, setInputStates] = useState({
    loginEmail: "",
    loginPassword: "",
    signUpName: "",
    signUpUsername: "",
    signUpEmail: "",
    signUpPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const updateInputState = (key: keyof typeof inputStates, value: string) => {
    setInputStates(current => ({ ...current, [key]: value }));
  }

  const setErrorMessageWithTimer = (message: string, timer = 4000) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), timer);
  }

  const handleLogin = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (inputStates.loginEmail.length === 0 || inputStates.loginPassword.length === 0) {
      setErrorMessageWithTimer("Fill in all required fields");
      return;
    }

    const res = await signIn('credentials', {
      email: inputStates.loginEmail,
      password: inputStates.loginPassword,
      redirect: false,
    });

    if (res.status === 401) {
      setErrorMessageWithTimer("invalid email or password");
      return;
    }

    Router.replace('/');
  }

  const handleGoogleLogin = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    signIn('google');
  }

  const handleSignUp = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (inputStates.signUpName.length === 0 ||
        inputStates.signUpUsername.length === 0 ||
        inputStates.signUpEmail.length === 0 ||
        inputStates.signUpPassword.length === 0) {
      setErrorMessageWithTimer("Fill in all required fields");
      return;
    }

    const newUserData = {
      name: inputStates.signUpName,
      username: inputStates.signUpUsername,
      email: inputStates.signUpEmail,
      password: inputStates.signUpPassword
    };

    const resCreation = await fetch("/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUserData)
    });

    if (resCreation.status !== 200) {
      setErrorMessageWithTimer("Unable to create an account");
      return;
    }

    const resSignIn = await signIn('credentials', {
      email: newUserData.email,
      password: newUserData.password,
      redirect: false,
    });

    if (resSignIn.status !== 200) {
      setErrorMessageWithTimer("Something happened, try to login..");
      return;
    }

    Router.replace('/');
  }

  return (
    <div className='animated-page'>
      <ul className="squares">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      <div className="w-screen h-screen flex justify-center items-center z-10 absolute">
        <div className="max-w-sm w-96 bg-white shadow-2xl rounded-xl">
          <div className="w-full rounded-t-xl flex flex-row center-items justify-around mb-1">
            <div
              onClick={() => setLoginSelected(true)}
              className={`cursor-pointer rounded-tl-xl font-semibold w-6/12 text-center text-xl py-3 ${loginSelected ? 'bg-white text-black' : `bg-gray-200 text-gray-600`}`}
              >
                LOGIN
            </div>
            <div
              onClick={() => setLoginSelected(false)}
              className={`cursor-pointer rounded-tr-xl font-semibold w-6/12 text-center text-xl py-3 ${!loginSelected ? 'bg-white text-black' : `bg-gray-200 text-gray-600`}`}
              >
                SIGN UP
            </div>
          </div>
          {
            errorMessage.length !== 0 && (
              <div className="p-2 border-2 mx-1 border-red-400 flex flex-row justify-start items-center">
                <FaExclamationTriangle color="red" display='inline-block' />
                <div className="inline-block pl-2">{errorMessage}</div>
              </div>
            )
          }
          {
            loginSelected ? (
              <div>
                <form>
                  <div className="py-1 px-2 border-t-2 border-gray-100 mb-2 mt-1 mx-1">
                    <p className="text-lg">Email / username</p>
                    <input
                      className="w-full text-lg"
                      placeholder="exampleuser001"
                      autoComplete='email'
                      value={inputStates.loginEmail}
                      onChange={(e) => updateInputState('loginEmail', e.target.value)}
                      />
                  </div>
                  <div className="py-1 px-2 border-t-2 border-b-2 border-gray-100 my-2 mx-1 flex flex-row items-end">
                    <div className="w-9/12">
                      <p className="text-xl">Password</p>
                      <input
                        className="w-full text-lg"
                        placeholder="Password"
                        autoComplete="current-password"
                        type={`${passwordVisible ? 'text' : 'password'}`}
                        value={inputStates.loginPassword}
                        onChange={(e) => updateInputState('loginPassword', e.target.value)}
                        />
                    </div>
                    <div className="w-3/12 pl-2 py-1 border-l-2 border-gray-100 align-text-bottom text-center">
                      <button
                        onClick={(e) => {e.preventDefault(); setPasswordVisible(!passwordVisible)}}
                        >
                          {passwordVisible ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>
                  <div className="text-center pt-2 pb-4">
                    <button
                      className="text-lg rounded py-2 w-8/12 bg-green-400"
                      onClick={handleLogin}
                      >
                        LOGIN
                    </button>
                  </div>
                </form>
                <div className="mb-3 flex items-center justify-center">
                  <div onClick={handleGoogleLogin} className="shadow-lg bg-gray-100 flex flex-row items-center py-2 px-4 rounded-full cursor-pointer">
                    <div className="inline-block"><FaGoogle /></div>
                    <div className="inline-block ml-4">Sign in with Google</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <form>
                  <div className="py-1 px-2 border-t-2 border-gray-100 my-2 mx-1">
                    <p className="text-lg">Name</p>
                    <input
                      className="w-full text-lg"
                      placeholder="Emil Example"
                      autoComplete="name"
                      value={inputStates.signUpName}
                      onChange={(e) => updateInputState('signUpName', e.target.value)}
                      />
                  </div>
                  <div className="py-1 px-2 border-t-2 border-gray-100 my-2 mx-1">
                    <p className="text-lg">Username</p>
                    <input
                      className="w-full text-lg"
                      placeholder="e_example0123"
                      autoComplete="username"
                      value={inputStates.signUpUsername}
                      onChange={(e) => updateInputState('signUpUsername', e.target.value)}
                      />
                  </div>
                  <div className="py-1 px-2 border-t-2 border-gray-100 my-2 mx-1">
                    <p className="text-lg">Email</p>
                    <input
                      className="w-full text-lg"
                      placeholder="e.example@gmail.com"
                      autoComplete="email"
                      value={inputStates.signUpEmail}
                      onChange={(e) => updateInputState('signUpEmail', e.target.value)}
                      />
                  </div>
                  <div className="py-1 px-2 border-t-2 border-b-2 border-gray-100 my-2 mx-1 flex flex-row items-end">
                    <div className="w-9/12">
                      <p className="text-xl">Password</p>
                      <input
                        className="w-full text-lg"
                        placeholder="Password"
                        autoComplete="new-password"
                        type={`${passwordVisible ? 'text' : 'password'}`}
                        value={inputStates.signUpPassword}
                        onChange={(e) => updateInputState('signUpPassword', e.target.value)}
                        />
                    </div>
                    <div className="w-3/12 pl-2 py-1 border-l-2 border-gray-100 align-text-bottom text-center">
                      <button
                        onClick={(e) => {e.preventDefault(); setPasswordVisible(!passwordVisible)}}
                        >
                          {passwordVisible ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>
                  <div className="text-center pt-2 pb-4">
                    <button
                      className="text-lg rounded py-2 w-8/12 bg-blue-300"
                      onClick={handleSignUp}
                      >
                        Sign Up
                    </button>
                  </div>
                </form>
              </div>
            )
          }
        </div>
      </div>
      <style jsx>{`
          .animated-page{
            background: #88a7fc;
            background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);
            width: 100%;
            height:100vh;
          }
          .squares{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          .squares li{
            position: absolute;
            display: block;
            list-style: none;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            animation: animate 25s cubic-bezier(0,.4,.97,1.09) infinite;
            bottom: -150px;
          }
          .squares li:nth-child(1){
            left: 25%;
            width: 120px;
            height: 120px;
            animation-delay: 0s;
          }

          .squares li:nth-child(2){
            left: 10%;
            width: 10px;
            height: 10px;
            animation-delay: 2s;
            animation-duration: 12s;
          }

          .squares li:nth-child(3){
            left: 70%;
            width: 30px;
            height: 30px;
            animation-delay: 4s;
          }

          .squares li:nth-child(4){
            left: 40%;
            width: 60px;
            height: 60px;
            animation-delay: 0s;
            animation-duration: 18s;
          }

          .squares li:nth-child(5){
            left: 65%;
            width: 90px;
            height: 90px;
            animation-delay: 0s;
          }

          .squares li:nth-child(6){
            left: 75%;
            width: 160px;
            height: 160px;
            animation-delay: 3s;
          }

          .squares li:nth-child(7){
            left: 35%;
            width: 40px;
            height: 40px;
            animation-delay: 7s;
          }

          .squares li:nth-child(8){
            left: 50%;
            width: 120px;
            height: 120px;
            animation-delay: 15s;
            animation-duration: 45s;
          }

          .squares li:nth-child(9){
            left: 20%;
            width: 15px;
            height: 15px;
            animation-delay: 2s;
            animation-duration: 35s;
          }

          .squares li:nth-child(10){
            left: 85%;
            width: 150px;
            height: 150px;
            animation-delay: 0s;
            animation-duration: 11s;
          }

          @keyframes animate {

            0%{
              transform: translateY(0) rotate(0deg);
              opacity: 1;
              border-radius: 0;
            }

            100%{
              transform: translateY(-1000px) rotate(720deg);
              opacity: 0;
              border-radius: 50%;
            }
          }
        `}</style>
    </div>
  );
};

export default Login;
