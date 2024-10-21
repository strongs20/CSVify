import { useFetch } from './useFetch';
import React, { useState, useEffect } from 'react';
import paginated_fetch from './fetch';
import { useCallback } from 'react';

function getAccessToken() {
  // Get access token from URL
  const accessToken = window.location.hash
    .substr(1)
    .split('&')[0]
    .split('=')[1];

  // Store access token in localStorage or session storage
  // for later use (e.g. setting it on the SpotifyWebApi object)
  return accessToken;
}

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  redirectUri: 'https://csvify.netlify.app/',
  accessToken: getAccessToken(),
});

getAccessToken();

function downloadCSV(csv, fileName) {
  var a = document.createElement('a');
  var file = new Blob([csv], { type: 'text/csv' });
  a.href = URL.createObjectURL(file);
  a.download = fileName + ".csv";
  a.click();
}

const Playlists = ({ url, offset, limit, headers, searchVal }) => {
  const { loading, products } = useFetch(url, headers);
  const [playlists, setPlaylists] = useState([]);
  const [fetchedPlaylists, setFetchedPlaylists] = useState(false);

  const fetchAllPlaylists = useCallback(async () => {
    await paginated_fetch(url, offset, headers, products.total).then(
      (products) => {
        let fetchedData = [];
        for (let chunk of products) {
          chunk.items.map((item) => {
            return fetchedData.push({
              name: item.name,
              href: item.tracks.href,
              total: item.tracks.total,
            });
          });
        }

        setPlaylists(fetchedData);
        setFetchedPlaylists(true);
        //return fetchedData;
      }
    );
  }, [products, headers, offset, url]);

  useEffect(() => {
    if (!fetchedPlaylists && loading === true && products !== null) {
      fetchAllPlaylists();
    }
  }, [loading, products, playlists, fetchedPlaylists]);

  return (
    <>
      {loading
        ? 'Loading...'
        : playlists.map((item) => {
          let name = item.name.toString()
          if (name.toLowerCase().includes(searchVal.toLowerCase()))
          {
            return (
              <Tracks
                url={item.href}
                offset={offset}
                limit={limit}
                headers={headers}
                name={item.name}
                total={item.total}
              ></Tracks>
            );
          }
          return true;
        })}
    </>
  );
};

const Tracks = ({ url, offset, limit, headers, name, total, searchVal }) => {
  const { loading, products } = useFetch(url, headers);
  const [isDownloading, setIsDownloading] = useState(false);  // Add a flag to prevent multiple downloads

  function dataToCSV(data) {
    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    );
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    downloadCSV(csv, name);
  }

  async function fetchInfo() {
    const playlistId = url.split('/')[5];
    const tracks_info = [];

    try {
      const playlist = await spotifyApi.getPlaylist(playlistId);
      const trackItems = playlist.body.tracks.items;

      for (const trackItem of trackItems) {
        const trackId = trackItem.track.id;
        try {
          const data = await spotifyApi.getTrack(trackId);
          const album = await spotifyApi.getAlbum(data.body.album.id);
          let artists = "";
          for (const artist of data.body.artists) {
            // don't put a comma on the final one
            artists += artist.name + (artist !== data.body.artists[data.body.artists.length - 1] ? ', ' : '');
          }
          const song_info = {
            isrc: data.body.external_ids.isrc,
            link: data.body.external_urls.spotify,
            song_name: data.body.name,
            artists: artists,
            song_id: data.body.id,
            song_duration: data.body.duration_ms,
            song_popularity: data.body.popularity,
            song_explicit: data.body.explicit,
            song_disc_number: data.body.disc_number,
            album_name: album.body.name,
            album_release_date: album.body.release_date,
            album_total_tracks: album.body.total_tracks,
            album_type: album.body.album_type,
            label: album.body.label,
          };
          tracks_info.push(song_info);
        } catch (err) {
          console.log('Something went wrong with track!', err);
        }
      }
      dataToCSV(tracks_info);
    } catch (err) {
      console.log('Something went wrong!', err);
    } finally {
      setIsDownloading(false); // Reset downloading state
    }
  }

  const download = async () => {
    if (isDownloading) return;  // Prevent multiple downloads
    setIsDownloading(true);     // Set downloading state to prevent multiple calls

    if (name === null) {
      name = 'Liked Songs';
    }
    console.log("Downloading...");
    await fetchInfo();
  };

  return (
    <>
      <h2>
        {loading ? (
          'Loading...'
        ) : (
          <article>
            <h2>{name || 'Liked Songs'}</h2>
            <h4>{(total || products.total) + ' tracks found'}</h4>
            <button className="button" type="button" onClick={download} disabled={isDownloading}>
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </article>
        )}
      </h2>
    </>
  );
};


const Dashboard = ({ code }) => {
  const [search, setSearch] = useState("");
  const authBearer = `Bearer ${code}`;

  const offset = 0;
  const limit = 50;

  const urlPlaylists = 'https://api.spotify.com/v1/me/playlists';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: authBearer,
  };

  // if (search === "") {
  return (
    <>
    <br></br>
      <input type="text"
      placeholder="Search by keyword"
      onChange={(e) => {
      setSearch(e.target.value);
      }}></input>

      <Playlists
        url={urlPlaylists}
        offset={offset}
        limit={limit}
        headers={headers}
        searchVal={search}
      ></Playlists>
    </>
  );
};

export default Dashboard;
