import { GetSpotifyClient } from "./api";


export const AddTrackToList = async (playlistId: string, trackId: string) => {
  const { spotify } = GetSpotifyClient();
  await spotify.addTracksToPlaylist(playlistId, [trackId]);
};
