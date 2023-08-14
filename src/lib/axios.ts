import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export const netlifyApi = axios.create({
  baseURL: "https://ssh-api.netlify.app/.netlify/functions/api",
});
