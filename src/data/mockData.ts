
import { SpotifyPlaylist, SpotifyTrackDetail } from "@/types";

export const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: "1",
    name: "Playlist 1",
    description: "A sample playlist",
    images: [{ url: "/lovable-uploads/e2e8c740-2d98-4425-bb1b-49addb8f7f87.png" }],
    owner: {
      id: "user1",
      display_name: "Username"
    },
    tracks: {
      total: 10,
      items: []
    }
  },
  {
    id: "2",
    name: "Playlist 1",
    description: "A sample playlist",
    images: [{ url: "/lovable-uploads/e2e8c740-2d98-4425-bb1b-49addb8f7f87.png" }],
    owner: {
      id: "user1",
      display_name: "Username"
    },
    tracks: {
      total: 10,
      items: []
    }
  },
  {
    id: "3",
    name: "Playlist 1",
    description: "A sample playlist",
    images: [{ url: "/lovable-uploads/e2e8c740-2d98-4425-bb1b-49addb8f7f87.png" }],
    owner: {
      id: "user1",
      display_name: "Username"
    },
    tracks: {
      total: 10,
      items: []
    }
  },
  {
    id: "4",
    name: "Playlist 1",
    description: "A sample playlist",
    images: [{ url: "/lovable-uploads/e2e8c740-2d98-4425-bb1b-49addb8f7f87.png" }],
    owner: {
      id: "user1",
      display_name: "Username"
    },
    tracks: {
      total: 10,
      items: []
    }
  }
];

export const mockTracks: SpotifyTrackDetail[] = [
  {
    id: "1",
    name: "Animalistic",
    duration_ms: 244000,
    album: {
      id: "album1",
      name: "Dirtybird Miami 2020",
      images: [{ url: "/lovable-uploads/1ad98850-c4b2-4676-911c-caae096ee3b0.png" }],
      release_date: "2020-03-01"
    },
    artists: [
      {
        id: "artist1",
        name: "Lubelski, Various Artists"
      }
    ],
    audio_features: {
      tempo: 135,
      key: 8,
      mode: 0,
      time_signature: 4,
      duration_ms: 244000
    }
  },
  {
    id: "2",
    name: "Complications",
    duration_ms: 329000,
    album: {
      id: "album2",
      name: "Random Album Title",
      images: [{ url: "/lovable-uploads/ba71ba26-d9e3-4c61-ad52-f9fefdf66ac2.png" }],
      release_date: "2008-09-02"
    },
    artists: [
      {
        id: "artist2",
        name: "deadmau5"
      }
    ],
    audio_features: {
      tempo: 140,
      key: 8,
      mode: 1,
      time_signature: 4,
      duration_ms: 329000
    }
  },
  {
    id: "3",
    name: "We Like To Party! (The Vengabus)",
    duration_ms: 222000,
    album: {
      id: "album3",
      name: "The Party Album!",
      images: [{ url: "/lovable-uploads/ba71ba26-d9e3-4c61-ad52-f9fefdf66ac2.png" }],
      release_date: "1999-01-01"
    },
    artists: [
      {
        id: "artist3",
        name: "Vengaboys"
      }
    ],
    audio_features: {
      tempo: 138,
      key: 9,
      mode: 1,
      time_signature: 4,
      duration_ms: 222000
    }
  }
];
