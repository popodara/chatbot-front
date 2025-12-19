import axiosClient from "axios";

export const API_URL = process.env.REACT_APP_API_URL;
export const axios = axiosClient.create({
  baseURL: API_URL,
})