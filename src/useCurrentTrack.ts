import { useEffect, useState } from "react";
import { authorize, GetCurrentTrack } from "./spotify/api";


export const useCurrentTrack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [track, setTrack] = useState<SpotifyApi.CurrentlyPlayingResponse>();

  useEffect(() => {
    (async () => {
      await authorize();
      const track = await GetCurrentTrack();
      setTrack(track);
      setIsLoading(false);
    })();
  }, []);

  return {
    track,
    isLoading,
  };
};
