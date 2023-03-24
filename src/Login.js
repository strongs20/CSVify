import React from 'react';

const generateRandomString = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

function Login() {
  // const classes = useStyles();

  var client_id = '<CLIENT_ID>'; // Your client id
  var redirect_uri = 'https://csvify.netlify.app/callback/'; // Your redirect uri
  // var redirect_uri = 'http://localhost:3000/callback/'; // Your redirect uri

  var stateKey = 'spotify_auth_state';

  var state = generateRandomString(16);

  localStorage.setItem(stateKey, state);
  localStorage.setItem('accessToken', encodeURIComponent(client_id));
  var scope =
    'playlist-read-private playlist-read-collaborative user-library-read';

  var url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  url += '&state=' + encodeURIComponent(state);

  return (
    <>
    <br></br><br></br><br></br><br></br>
    <div className='log_link'>
      <a href={url}>LOGIN WITH SPOTIFY</a>
    </div>
      <footer>
        <a href="https://samstrong.netlify.app/">
          <h4 style={{ color: 'black' }}>samstrong.netlify.app</h4>
        </a>
      </footer>
      <br />
    </>
  );
}

export default Login;
