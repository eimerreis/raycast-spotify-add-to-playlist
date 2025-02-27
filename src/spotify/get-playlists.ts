import { GetSpotifyClient } from "./api";

export const GetPlaylists = async () => {
  const { spotify } = GetSpotifyClient();
  const meResponse = await spotify.getMe();
  const limit = 50;
  let offset = 0;
  let totalItems = 0;

  let playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
  do {
    const playlistResponse = await spotify.getUserPlaylists({ limit, offset });
    totalItems = playlistResponse.body.total;
    offset += limit;

    playlists = [...playlists, ...playlistResponse.body.items];
  } while (playlists.length < totalItems);

  return playlists.filter((x) => x.owner.id === meResponse.body.id);
};
