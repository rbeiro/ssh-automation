import { env } from "@/env.mjs";
import axios from "axios";

export const serverApi = axios.create({
  baseURL: env.NEXTAUTH_URL + "/api",
  timeout: 15000,
});
