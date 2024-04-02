const express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var axios = require('axios');

// let client_id = process.env.SPOTIFY_API_ID;
// let client_secret = process.env.SPOTIFY_CLIENT_SECRET;
let redirect_uri = "http://localhost:8000/callback";
let client_uri = "http://localhost:5173/Share";
let client_id = "1892c29e22e44ec686fa22a8e891b0f9"
let client_secret = "011fa442dd504a46b6bd4d89aeab4036"
//let redirect_uri = "http://localhost:5173/Share";

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

const app = express();

app.set('port', 8000 );

// app.use(cors({
//   'allowedHeaders': ['Content-Type'],
//   'origin': '*',
//   'preflightContinue': true
// }));

app.use(cors())

// app.get('/', (req, res) => {
//     res.send('Hello from our server!')
// })

//in frotnend, we will call axios.get('http://localhost:8080/login')... in whatever function for login
// app.get('/login', function(req, res) {
//     var state = generateRandomString(16);
//     res.cookie(stateKey, state);
//     var scope = 'user-read-private user-read-email user-top-read';
  
//     res.redirect('https://accounts.spotify.com/authorize?' +
//       querystring.stringify({
//         response_type: 'code',
//         client_id: client_id,
//         scope: scope,
//         redirect_uri: redirect_uri,
//         state: state
//       }));
//   });

  app.get('/login', (req, res) => {
    // Construct the Spotify authorization URL
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code', 
      scope: 'user-read-private user-read-email user-top-read',
      state: generateRandomString(16)
    });
  
    // Redirect the user to Spotify
    // res.redirect(spotifyAuthUrl);
    res.send(spotifyAuthUrl);
  });

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there

        //PASS CLIENT URI HERE AS WELL  res.redirect(`${client_uri}/#` + querystring.stringify({ access_token, refresh_token }))
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
});

app.get('/topSongs', function(req, res) {
  // //request token using getAuth() function
  // const access_token = await getAuth();
  // //console.log(access_token);

  // const api_url = TRACKS;
  // //console.log(api_url);
  // try{
  //   const response = await axios.get(api_url, {
  //     headers: {
  //       'Authorization': `Bearer ${access_token}`
  //     }
  //   });
  //   //console.log(response.data);
  //   return response.data;
  // }catch(error){
  //   console.log(error);
  // }  
});



app.listen(8000, () => {
  console.log('server listening on port 8000')
})