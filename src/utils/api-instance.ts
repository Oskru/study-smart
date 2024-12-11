import axios from 'axios';
import { API_ROOT_URL } from './consts/api.ts';

export const apiInstance = axios.create({
  baseURL: API_ROOT_URL,
});
