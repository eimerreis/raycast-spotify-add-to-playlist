import { GetSpotifyClient } from "./api";

export const GetCurrentTrack = async () => {
  const { spotify } = GetSpotifyClient();
  const response = await spotify.getMyCurrentPlayingTrack();
  return response.body;
};
