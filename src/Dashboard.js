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

const AccessToken = 'BQCxb7_SqV0lTT9uVanCW5yUY_UdrNIhdXJ0hesJTeJpj4Z4-GDlbW4infGgfJIZK0adGNbvRnmNDkRPsCchHt1O6MFJLChoLHPm7Ymia4aWf3S39iBi8QnuIf1hHe-dzH_87F09TWWiIAGqVh5DF7eG8h0TzZxNmCE49-MJpvlZecLcxSW8Wg7V2swbqxtrHtQ9gm1RVtB5vLOZSQycWpN-YSItZak';
console.log(AccessToken);
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: '<CLIENT_ID>',
  clientSecret: '<CLIENT_SECRET>',
  redirectUri: 'https://csv.netlify.app/callback/',
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
        console.log(fetchedData);
        //return fetchedData;
      }
    );
  }, [products, headers, offset, url]);

  useEffect(() => {
    if (loading === true && products !== null) {
      fetchAllPlaylists();
    }
  }, [loading, products, playlists, fetchAllPlaylists]);

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
  const [ trackData, setTrackData ] = useState([]);

  function dataToCSV(data) {
    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    // download the csv
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
          const artists = "";
          for (const artist of data.body.artists) {
            // dont put comma on the final one
            if (artist === data.body.artists[data.body.artists.length - 1]) {
              artists += artist.name;
            } else {
              artists += artist.name + ', ';
            }
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
    }
  }


  const download = async () => {
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
            <button className="button" type="button" onClick={download}>
              Download
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
  //const maxSongs = 10000;

  const urlPlaylists = 'https://api.spotify.com/v1/me/playlists';
  // const urlTracks = 'https://api.spotify.com/v1/me/tracks';

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

      {/* <Tracks
        url={urlTracks}
        offset={offset}
        limit={limit}
        headers={headers}
        name={null}
        total={null}
        searchVal={search}
      ></Tracks> */}

      <Playlists
        url={urlPlaylists}
        offset={offset}
        limit={limit}
        headers={headers}
        searchVal={search}
      ></Playlists>
    </>
  );
  // }
  // else {
  //   return (
  //     <>
  //       <input type="text"
  //       placeholder="Search by keyword"
  //       onChange={(e) => {
  //       setSearch(e.target.value);
  //       }}></input>

  //       <Playlists
  //         url={urlPlaylists}
  //         offset={offset}
  //         limit={limit}
  //         headers={headers}
  //         searchVal={search}
  //       ></Playlists>

  //     </>
      
  //   );
  // }
};

export default Dashboard;
