import NextAuth from "next-auth";
import { buildNextAuthOptions } from "@/server/auth";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return (await NextAuth(
    req,
    res,
    buildNextAuthOptions(req, res)
  )) as typeof NextAuth;
}
