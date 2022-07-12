import { OAuth, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import SpotifyWebApi from "spotify-web-api-node";
import { ExtensionPreferenceValues } from "../PreferenceValues";
import { RefreshTokenExpiredError } from "./errors";

const clientId = getPreferenceValues<ExtensionPreferenceValues>().spotifyClientId;

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerId: "spotify",
  providerName: "Spotify",
  providerIcon:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png",
  description: "Connect your Spotify account...",
});

export const authorize = async () => {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      try {
        await client.setTokens(await refreshTokens(tokenSet.refreshToken));
      } catch (err) {
        if (err instanceof RefreshTokenExpiredError) {
          console.log("refresh token expired");
          await initialAuthorize();
        }
      }
    }
    return;
  }

  await initialAuthorize();
};

async function initialAuthorize() {
  const authRequest = await client.authorizationRequest({
    clientId,
    endpoint: "https://accounts.spotify.com/authorize",
    scope:
      "user-read-private user-read-currently-playing playlist-read-private playlist-modify-private playlist-modify-public",
  });

  const { authorizationCode } = await client.authorize(authRequest);
  await client.setTokens(await fetchTokens(authRequest, authorizationCode));
}

async function fetchTokens(authRequest: OAuth.AuthorizationRequest, authCode: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const { error } = JSON.parse(await response.text());

    if (error.toLowerCase() === "invalid_grant") {
      throw new RefreshTokenExpiredError();
    } else {
      console.error("refresh tokens error:", await response.text());
      throw new Error(response.statusText);
    }
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}

const createClient = async () => {
  const tokenSet = await client.getTokens();
  return new SpotifyWebApi({ accessToken: tokenSet?.accessToken });
};

export const GetPlaylists = async () => {
  const spotify = await createClient();
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

export const GetCurrentTrack = async () => {
  const spotify = await createClient();
  const response = await spotify.getMyCurrentPlayingTrack();
  return response.body;
};

export const AddTrackToList = async (playlistId: string, trackId: string) => {
  const spotify = await createClient();
  await spotify.addTracksToPlaylist(playlistId, [trackId]);
};
