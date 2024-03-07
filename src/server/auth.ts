import {
  type NextApiRequest,
  type GetServerSidePropsContext,
  type NextApiResponse,
} from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env.mjs";

import { createTransport } from "nodemailer";
import { html } from "../utils/createHTMLForEmail";
import { PrismaAdapter } from "@/lib/auth/prisma-adapter";
//import { type Role } from "@prisma/client";

function randomStr(len: number, arr: string) {
  let ans = "";
  for (let i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export function buildNextAuthOptions(
  req?: NextApiRequest,
  res?: NextApiResponse
): NextAuthOptions {
  return {
    secret: env.NEXTAUTH_SECRET,
    // cookies: {
    //   sessionToken: {
    //     name:
    //       process.env.NODE_ENV === "production"
    //         ? `__Secure-next-auth.session-token`
    //         : `next-auth.session-token`,
    //     options: {
    //       httpOnly: true,
    //       sameSite: "lax",
    //       path: "/",
    //       domain: "localhost",
    //       secure: process.env.NODE_ENV === "production" ? true : false,
    //     },
    //   },
    // },
    callbacks: {
      session: ({ session, user }) => ({
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      }),
    },
    pages: {
      signIn: "/get-started",
    },
    adapter: PrismaAdapter(req, res),
    providers: [
      DiscordProvider({
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
      }),
      EmailProvider({
        server: env.EMAIL_SERVER,
        from: env.EMAIL_FROM,
        sendVerificationRequest: ({
          identifier: email,
          url,
          token,
          provider: { server, from },
          theme,
        }) => {
          return new Promise((resolve, reject) => {
            // Strip protocol from URL and use domain as site name
            const { host } = new URL(url);
            createTransport(server).sendMail(
              {
                to: email,
                from,
                subject: `Authentication code: ${token}`,
                text: text({ url, host }),
                html: html({ url, host, token, theme }),
              },
              (error) => {
                if (error) {
                  console.error("SEND_VERIFICATION_EMAIL_ERROR", email, error);
                  return reject(
                    new Error(`SEND_VERIFICATION_EMAIL_ERROR`, {
                      cause: error,
                    })
                  );
                }
                return resolve();
              }
            );
          });
        },

        generateVerificationToken() {
          const token = randomStr(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
          return token;
        },
      }),
      /**
       * ...add more providers here.
       *
       * Most other providers require a bit more work than the Discord provider. For example, the
       * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
       * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
       *
       * @see https://next-auth.js.org/providers/github
       */
    ],
  };
}

export const authOptions = buildNextAuthOptions();

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
