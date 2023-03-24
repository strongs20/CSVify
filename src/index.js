import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login.js';
import Dashboard from './Dashboard';
import queryString from 'query-string';
import './index.css';

var parsedCode = queryString.parse(window.location.hash);
var code = queryString.stringify(parsedCode).split('&')[0].split('=')[1];

function Exportify() {
  return (
    <>
      <div className="app">
        <h1 className="main-logo">CSVify</h1>
        <br></br>
        <img src="https://i.imgur.com/KElzYZx.png" width="103" height="50" margin-left="100" alt="logo"></img>
        {/* <h1 className="main-desc">
        </h1> */}
        <br></br>
        {code ? <Dashboard code={code} /> : <Login />}
      </div>

      {/* <footer>
        <a href="https://strongs20.github.io">
          <h4 style={{ color: 'black' }}>strongs20.github.io</h4>
        </a>
      </footer> */}
    </>
  );
}

ReactDOM.render(<Exportify />, document.getElementById('root'));
