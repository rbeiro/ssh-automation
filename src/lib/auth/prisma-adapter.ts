import { prisma } from "../../server/db";
import { type NextApiResponse, type NextApiRequest } from "next";
import { type Adapter } from "next-auth/adapters";
import { destroyCookie, parseCookies } from "nookies";

export function PrismaAdapter(
  req?: NextApiRequest,
  res?: NextApiResponse
): Adapter {
  return {
    async createUser({ email, image, emailVerified }) {
      const prismaUser = await prisma.user.create({
        data: {
          email,
          role: "USER",
          image,
          emailVerified,
        },
      });

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email!,
        emailVerified: prismaUser.emailVerified,
        image: prismaUser.image!,
        role: prismaUser.role,
      };
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image!,
        role: user.role,
      };
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image!,
        role: user.role,
      };
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!account) return null;

      const { user } = account;

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: user.emailVerified,
        image: user.image!,
        role: user.role,
      };
    },

    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email!,
        emailVerified: prismaUser.emailVerified,
        image: prismaUser.image!,
        role: prismaUser.role,
      };
    },

    // async deleteUser(userId) {},
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },
    // async unlinkAccount({ providerAccountId, provider }) {},

    async createSession({ sessionToken, userId, expires }) {
      const session = await prisma.session.create({
        data: {
          userId,
          expires,
          sessionToken,
        },
      });

      return session;
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;

      return {
        session,
        user: {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          image: user.image!,
          role: user.role,
        },
      };
    },
    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.update({
        where: { sessionToken },
        data: {
          expires,
          userId,
        },
      });

      return prismaSession;
    },

    deleteSession: (sessionToken) =>
      prisma.session.delete({ where: { sessionToken } }),

    async createVerificationToken(data) {
      const verificationToken = await prisma.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if (error === "P2025") return null;
        throw error;
      }
    },
  };
}
