import { useEffect, useState } from "react";
import { GetCurrentTrack } from "./spotify/get-current-track";


export const useCurrentTrack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [track, setTrack] = useState<SpotifyApi.CurrentlyPlayingResponse>();

  useEffect(() => {
    (async () => {
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
