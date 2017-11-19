# oauth2orize-facebook

This is a koa port of [oauth2orize-facebook](https://github.com/ngthanhtrung/node-oauth2orize-facebook).

## Installation

```sh
npm i oauth2orize-koa-facebook -S
```

## Usage

Before using this package, you should enable the 'Require App Secret' option in the advanced settings of your Facebook app.
You also must provide the app secret by exporting it

```sh
export FB_APP_SECRET={your Facebook app secret}
```

or by adding FB_APP_SECRET={your Facebook app secret} to your .env file.

Then, you can have fun

```js
var oauth2orize = require('oauth2orize-koa');
var oauth2orizeFacebook = require('oauth2orize-koa-facebook');

var server = oauth2orize.createServer();

server.exchange(oauth2orizeFacebook.exchange.facebook(['email', 'first_name', 'last_name'], function (client, profile) {
  // Get access token from client and Facebook profile information.
  var accessToken = 'access token';

  // Refresh token could be returned if it is supported by your OAuth2 server.
  // If not available, just pass `null` as argument.
  var refreshToken = 'optional refresh token';

  // Additional parameters to return in response. Pass `null` if not available.
  var params = {
    'welcome_to': 'our OAuth2 server',
    'glad_to': 'meet you'
  };

  return [accessToken, refreshToken, params];
  // Or just `return accessToken` is enough.
}));
```

## License

MIT licensed.

[oauth2orize-koa]: https://www.npmjs.com/package/oauth2orize-koa
