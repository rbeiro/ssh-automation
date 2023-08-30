import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";

import "server-only";

export const preload = () => {
  void getAllOLT();
};

export const getAllOLT = async () => {
  const session = await getServerSession(authOptions);
  const isUserAllowed =
    session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN"
      ? true
      : false;

  if (!isUserAllowed) {
    return {};
  }

  const allOLTs = await prisma.olt.findMany({
    select: {
      name: true,
      relatedAds: {
        select: {
          name: true,
        },
      },
    },
  });
  return allOLTs;
};
