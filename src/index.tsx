import { ActionPanel, Action, List, showToast, Toast, Image, closeMainWindow, showHUD, popToRoot } from "@raycast/api";
import { useSearch } from "./useSearch";
import { AddTrackToList } from "./spotify/api";
import { useCurrentTrack } from "./useCurrentTrack";

export default function Command() {
  const { search, items, isLoading } = useSearch();
  const { track } = useCurrentTrack();

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={search}
      enableFiltering
      searchBarPlaceholder="Search playlists..."
      throttle
    >
      <List.Section title="Playlists" subtitle={`Current Track is: "${track?.item && track.item.name}"`}>
        {track && items.map((item) => <SearchListItem key={item.name} searchResult={item} currentTrack={track} />)}
      </List.Section>
    </List>
  );
}

function SearchListItem({
  searchResult,
  currentTrack,
}: {
  searchResult: SpotifyApi.PlaylistObjectSimplified;
  currentTrack: SpotifyApi.CurrentlyPlayingResponse;
}) {
  const { length, [length - 1]: lastImage } = searchResult.images;

  const onAdd = async () => {
    if (currentTrack.item) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: `Adding track...`,
        message: `${currentTrack.item.name} to ${searchResult.name}...`,
      });
      await AddTrackToList(searchResult.id, currentTrack.item.uri);
      (toast.title = `Successfully added`), (toast.message = `${currentTrack.item.name} to ${searchResult.name}`);
      await showHUD(`✅ Successfully added ${currentTrack.item.name} to ${searchResult.name}`);
      popToRoot({ clearSearchBar: true });
      await closeMainWindow({ clearRootSearch: true });
    }
  };

  return (
    <List.Item
      icon={{
        source: lastImage.url,
        mask: Image.Mask.Circle,
      }}
      title={searchResult.name}
      subtitle={searchResult.description!}
      accessoryTitle={searchResult.owner.display_name}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action title="Add to playlist" onAction={onAdd} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
