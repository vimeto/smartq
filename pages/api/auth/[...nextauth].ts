import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import Providers from "next-auth/providers";
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from 'bcryptjs';
// import EmailProvider from 'next-auth/providers/email'
import prisma from '../../../lib/prisma'


const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

export const options: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Account email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const payload = {
          email: credentials.email,
          password: credentials.password,
        };

        const possibleUser = await prisma.user.findUnique({
          where: {
            email: payload.email
          }
        }) || await prisma.user.findUnique({
          where: {
            username: payload.email
          }
        });

        if (!possibleUser) { return null; }

        const correctPassword = await bcryptjs.compare(payload.password, possibleUser.passwordDigest)

        if (correctPassword) {
          return possibleUser;
        } else {
          return null
        }
      }
    }),

    // EmailProvider({
    //   name: "passwordless",
    //   server: {
    //     host: process.env.SMTP_HOST,
    //     port: Number(process.env.SMTP_PORT),
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   },
    //   from: process.env.SMTP_FROM,
    // }),
  ],
  adapter: PrismaAdapter(prisma),
  // callBacks: {
  //   async jwt({ token, user, account }) {
  //     console.log("jwt called");
  //     if (account && user) {
  //       return {
  //         ...token,
  //         accessToken: user.data.token,
  //         refreshToken: user.data.refreshToken,
  //       }
  //     }

  //     return token;
  //   },

  //   async session({ session, token }) {
  //     session.user.accessToken = token.accessToken;
  //     session.user.refreshToken = token.refreshToken;
  //     session.user.accessTokenExpires = token.accessTokenExpires;

  //     return session;
  //   }
  // },
  secret: process.env.SECRET,
  pages: {
    signIn: "/login",
  }
};
