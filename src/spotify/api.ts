import { OAuth, getPreferenceValues } from "@raycast/api";
import { ExtensionPreferenceValues } from "../PreferenceValues";
import { OAuthService, withAccessToken } from "@raycast/utils";
import SpotifyWebApi from "spotify-web-api-node";

const clientId = getPreferenceValues<ExtensionPreferenceValues>().spotifyClientId;

export let spotify: SpotifyWebApi | undefined;

const scope = [
  "playlist-modify-private",
  "playlist-modify-public",
  "playlist-read-collaborative",
  "playlist-read-private",
  "user-follow-read",
  "user-library-modify",
  "user-library-read",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-private",
  "user-top-read",
].join(" ");

export const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Spotify",
  providerIcon:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png",
  description: "Connect your Spotify account",
  providerId: "spotify",
});

export const provider = new OAuthService({
  client: oauthClient,
  clientId: clientId,
  scope: scope,
  authorizeUrl: "https://accounts.spotify.com/authorize/",
  tokenUrl: "https://accounts.spotify.com/api/token",
  refreshTokenUrl: "https://accounts.spotify.com/api/token",
  bodyEncoding: "url-encoded",
});

provider.onAuthorize = ({ token }) => {
  spotify = new SpotifyWebApi({ accessToken: token });
};

export async function SetSpotifyClient() {
  const accessToken = await provider.authorize();

  spotify = new SpotifyWebApi({ accessToken });
}

export const withSpotifyClient = withAccessToken(provider);

export const GetSpotifyClient = () => {
  if (!spotify) {
    throw new Error("Spotify client must be used when authenticated");
  }

  return {
    spotify,
  };
};
