import axiosClient from "axios";
// TEST
 export const API_ROUTE = "http://localhost:9141";


export const API_URL = API_ROUTE;
export const axios = axiosClient.create({
  baseURL: API_URL,
})