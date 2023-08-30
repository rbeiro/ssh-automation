import { Client } from "ssh2";
import { NextResponse } from "next/server";
import { authOptions, getServerAuthSession } from "@/server/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";

type BodyRequestParams = {
  name: string;
  ipAddress: string;
  port: string;
  vendorName: string;
};

export async function POST(request: Request) {
  const { name, ipAddress, port, vendorName }: BodyRequestParams =
    await request.json();
  const session = await getServerSession(authOptions);

  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (session?.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "You're not allowed" }, { status: 405 });
  }

  console.log("TESTE: " + vendorName);

  const currentVendor = await prisma.vendor.findFirst({
    where: {
      name: vendorName,
    },
  });

  const response = await prisma.ads.create({
    data: {
      ipAddress,
      name,
      port,
      vendor: {
        connect: {
          id: currentVendor?.id,
        },
      },
    },
  });
  return NextResponse.json({ data: response }, { status: 200 });
}
``;
