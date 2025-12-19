import axiosClient from "axios";
// TEST
//export const API_ROUTE = "https://apps.mediabox.bi:9141";

export const API_URL = process.env.REACT_APP_API_URL;
export const axios = axiosClient.create({
  baseURL: API_URL,
})

