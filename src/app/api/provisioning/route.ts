import { Client } from "ssh2";
import { NextResponse } from "next/server";

interface BodyRequestParams {
  serialNumber: string;
  slotGPON: number;
  PONport: number;
  ONUposition: number;
  QoSProfilePPPoE: string;
  VLANClient: number;
  clientNameOLT: string;
  clientNameOLT2: string;
}

export async function POST(request: Request) {
  //console.log(request);
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
  const sshClient = new Client();
  const { params }: { params: BodyRequestParams } = await request.json();
  const outputData: Array<{ id: string; line: string }> = [];
  console.log(params);

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
      console.log("ALOU");

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
              outputData.push({
                id: crypto.randomUUID(),
                line: dataAsString,
              });
              console.log(outputData);

              switch (dataAsString) {
                case "end":
                  console.log("End command");
                  sshClient.end();
                // case "Completed.":
                //   NextResponse;
                //   return NextResponse.json({ message: "Sucesso" }, { status: 201 });

                default:
              }
            });

          const ONTInterfaceBase = `1/1/${params.slotGPON}/${params.PONport}/${params.ONUposition}`;

          stream.stdin.write(
            `configure equipment ont interface ${ONTInterfaceBase} sernum ${params.serialNumber} sw-ver-pland disabled optics-hist enable\n`
          );
          stream.stdin.write(
            `configure equipment ont interface ${ONTInterfaceBase} desc1 "${params.clientNameOLT}" admin-state up\n`
          );
          stream.stdin.write(
            `configure equipment ont interface ${ONTInterfaceBase} desc2 "${params.clientNameOLT2}"\n`
          );
          stream.stdin.write(
            `configure equipment ont slot ${ONTInterfaceBase}/14 plndnumdataports 1 plndnumvoiceports 0 planned-card-type veip admin-state up\n`
          );
          stream.stdin.write(
            `configure qos           interface ${ONTInterfaceBase}/14/1 upstream-queue 0 bandwidth-profile name:${params.QoSProfilePPPoE}\n`
          );
          stream.stdin.write(
            `configure interface port      uni:${ONTInterfaceBase}/14/1 admin-up\n`
          );
          stream.stdin.write(
            `configure bridge             port ${ONTInterfaceBase}/14/1 max-unicast-mac 32 max-committed-mac 1\n`
          );
          stream.stdin.write(
            `vlan-id ${params.VLANClient} tag single-tagged\n`
          );
          stream.stdin.write("exit\n");
          stream.stdin.write("exit all\n");
          stream.stdin.write("admin save\n");
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
  console.log("Response: ", response);
  return NextResponse.json({ commandLineResult: response }, { status: 201 });
}
``;
