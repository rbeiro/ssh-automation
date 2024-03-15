import { Client } from "ssh2";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

interface BodyRequestParams {
  slotGPON: number;
  PONport: number;
  ONUposition: number;
  currentAdsName: string;
  currentVendorName: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log("inside the deprovision route");
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const isUserAllowed =
    session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN"
      ? true
      : false;
  if (!isUserAllowed) {
    return NextResponse.json({ error: "You're not allowed" }, { status: 405 });
  }
  console.log("isUserAllowed: ", isUserAllowed);

  const { params }: { params: BodyRequestParams } = await request.json();

  const currentVendorData = await prisma.vendor.findFirst({
    where: {
      name: params.currentVendorName,
    },
    select: {
      name: true,
      relatedAds: true,
    },
  });

  const doesAdsExsit = Array.isArray(currentVendorData?.relatedAds);
  console.log("doesAdsExsit: ", doesAdsExsit);

  if (!doesAdsExsit) {
    return NextResponse.json({ error: "No ADS Found" }, { status: 405 });
  }

  console.log(params.currentAdsName);

  const currentAdsData = currentVendorData?.relatedAds.find(
    ({ name }) => name === params.currentAdsName
  );

  console.log("currentAdsData: ", currentAdsData);

  if (!currentAdsData) {
    return NextResponse.json({ error: "No ADS Found" }, { status: 405 });
  }

  const sshClient = new Client();
  const outputData: Array<{ id: string; line: string }> = [];

  const connectToSshAndExecuteCommands = () => {
    return new Promise((resolve, reject) => {
      sshClient // Connect to the SSH server
        .connect({
          host: currentAdsData?.ipAddress,
          password: process.env.SSH_PASS,
          username: process.env.SSH_USER,
          port: Number(currentAdsData?.port),
          algorithms: {
            kex: [
              "diffie-hellman-group1-sha1",
              "diffie-hellman-group-exchange-sha1",
              "diffie-hellman-group14-sha1",
              "diffie-hellman-group-exchange-sha256",
              "ecdh-sha2-nistp521",
              "ecdh-sha2-nistp384",
              "ecdh-sha2-nistp256",
            ],
            cipher: [
              "aes128-ctr",
              "aes192-ctr",
              "aes256-ctr",
              "aes128-gcm",
              "aes128-gcm@openssh.com",
              "aes256-gcm",
              "aes256-gcm@openssh.com",
              "aes256-cbc",
              "aes192-cbc",
              "aes128-cbc",
              "3des-cbc",
            ],
          },
        });

      // Handle events when the connection is established

      sshClient.on("ready", () => {
        console.log("Connected via SSH!");

        sshClient.shell(false, {}, (err, stream) => {
          if (err) throw err;

          stream
            .on("close", () => {
              console.log("Stream :: close");
              resolve(outputData);
              return;
            })
            .on("data", (data: Buffer) => {
              const dataAsString = data.toString();
              console.log(dataAsString);
              outputData.push({
                id: crypto.randomUUID(),
                line: dataAsString,
              });

              switch (dataAsString) {
                case "end":
                  sshClient.end();

                default:
              }
            });

          const ONTInterfaceBase = `1/1/${params.slotGPON}/${params.PONport}/${params.ONUposition}`;

          stream.stdin.write(
            `configure equipment ont interface ${ONTInterfaceBase} admin-state down\n`
          );
          stream.stdin.write(`exit\n`);
          stream.stdin.write(
            `configure equipment ont no interface ${ONTInterfaceBase}\n`
          );
          stream.stdin.write(`exit\n`);
          stream.stdin.write("end");
        });

        // Now you can execute commands, transfer files, etc.
      });

      // Handle errors during the SSH connection process

      sshClient.on("error", (err) => {
        console.error(err);
        reject;
      });
    });
  };

  const response = await connectToSshAndExecuteCommands();
  return NextResponse.json({ commandLineResult: response }, { status: 201 });
}
