import { Client } from "ssh2";
import { NextResponse } from "next/server";
import { authOptions, getServerAuthSession } from "@/server/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";

const fetchCache = "force-no-store";

type BodyRequestParams = {
  name: string;
};

export async function POST(request: Request) {
  const { name }: { name: string } = await request.json();
  const session = await getServerSession(authOptions);

  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (session?.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "You're not allowed" }, { status: 405 });
  }

  const response = await prisma.olt.create({
    data: {
      name,
    },
  });
  return NextResponse.json({ data: response }, { status: 200 });
}
``;
