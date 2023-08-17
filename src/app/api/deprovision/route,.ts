import { Client } from "ssh2";
import { NextResponse } from "next/server";

const fetchCache = "force-no-store";

interface BodyRequestParams {
  slotGPON: number;
  PONport: number;
  ONUposition: number;
}

export async function GET(request: Request) {
  if (request.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
  const { params }: { params: BodyRequestParams } = await request.json();
  const sshClient = new Client();
  const outputData: Array<{ id: string; line: string }> = [];

  const connectToSshAndExecuteCommands = () => {
    return new Promise((resolve, reject) => {
      sshClient // Connect to the SSH server
        .connect({
          host: process.env.SSH_HOST,
          password: process.env.SSH_PASS,
          username: process.env.SSH_USER,
          port: Number(process.env.SSH_PORT),
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
``;
