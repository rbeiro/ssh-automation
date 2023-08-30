import { Client } from "ssh2";
import { NextResponse } from "next/server";
import { authOptions, getServerAuthSession } from "@/server/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";

type BodyRequestParams = {
  name: string;
  ipAddress: string;
  port: string;
  fromOlt: string;
};

export async function POST(request: Request) {
  const { name, ipAddress, port, fromOlt }: BodyRequestParams =
    await request.json();
  const session = await getServerSession(authOptions);

  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (session?.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "You're not allowed" }, { status: 405 });
  }

  const currentOlt = await prisma.olt.findFirst({
    where: {
      name: fromOlt,
    },
  });

  const response = await prisma.ads.create({
    data: {
      ipAddress,
      name,
      port,
      olt: {
        connect: {
          id: currentOlt?.id,
        },
      },
    },
  });
  return NextResponse.json({ data: response }, { status: 200 });
}
``;
