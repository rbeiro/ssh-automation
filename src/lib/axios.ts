import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 3000,
});

export const netlifyApi = axios.create({
  baseURL: "https://ssh-api.netlify.app/.netlify/functions/api",
  timeout: 1500,
});
