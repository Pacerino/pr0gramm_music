import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';

interface APIResponse {
  success: boolean;
  message: string;
  data: Data;
}

interface Data {
  entityUniqueID: string;
  userCountry: string;
  pageURL: string;
  linksByPlatform: LinksByPlatform;
}

interface LinksByPlatform {
  deezer: Deezer;
  appleMusic: AppleMusic;
  itunes: AppleMusic;
  soundcloud: Deezer;
  spotify: Deezer;
  tidal: Deezer;
  yandex: Deezer;
  youtube: Deezer;
  youtubeMusic: Deezer;
}

interface AppleMusic {
  country: string;
  url: string;
  nativeAppURIMobile: string;
  nativeAppURIDesktop: string;
  entityUniqueId: string;
}

interface Deezer {
  country: string;
  url: string;
  entityUniqueId: string;
  nativeAppURIDesktop?: string;
}

dotenv.config();
const instance = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 60000,
});

function getMetadata(acrID: string): Promise<AxiosResponse<APIResponse>> {
  return instance.get(`/crawl/${acrID}`);
}

export default getMetadata;
