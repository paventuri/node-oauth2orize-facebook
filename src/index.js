'use strict';

import { TokenError } from 'oauth2orize-koa';
import { getFacebookProfile } from './util';

exports = module.exports;

/**
 * Auto-load bundled exchanges.
 */
exports.exchange = {};

/**
 * Exchanges facebook access token for api access tokens.
 *
 * This exchange middleware is used to by clients to obtain an api access token by
 * presenting an facebook access token.  An facebook access token must have previously
 * been issued by facebook.
 *
 * Callbacks:
 *
 * This middleware requires an `issue` callback, for which the function
 * signature is as follows:
 *
 *    function(client, profile, scope, req.body) { ... }
 *
 * `client` is the authenticated client instance attempting to obtain an access
 * token.  `profile` is the facebook profile gotten from facebook's /me endpoint.
 * `scope` is the list of scopes requesting access.
 * `req.body` is an optional parameter if request body access is required
 *
 *    Return an array containing:
 *
 * `accessToken` is the access token that will be sent to the client.  An
 * optional `refreshToken` will be sent to the client, if the server chooses to
 * implement support for this functionality.  Any additional `params` will be
 * included in the response.
 *
 * Options:
 *
 *     userProperty   property of `req` which contains the authenticated client (default: 'user')
 *     scopeSeparator separator used to split req.body.scope (default: ' ')
 *
 * Examples:
 *
 *     server.exchange(oauth2orizeFacebook(function(client, profile, scope) {
 *       AccessToken.create(client, profile, scope, function(err, accessToken) {
 *         if (err) { return throw new Error(err); }
 *         return accessToken;
 *       });
 *     }));
 *
 * @param {Object} options
 * @param {Object} fields
 * @param {Function} issue
 * @return {Function}
 * @api public
 */
exports.exchange.facebook = function (options, fields, issue) {
  if (typeof options === 'function') {
    issue = options;
    options = undefined;
    fields = undefined;
  }

  if (Array.isArray(options)) {
    issue = fields;
    fields = options;
    options = undefined;
  }

  if (fields && !Array.isArray(fields)) {
    throw new Error('You must specify the Facebook profile fields as an array.' +
      'Also, make sure you have permission to access these fields');
  }

  if (!issue) { throw new Error('oauth2orize.facebook exchange requires an issue callback.'); }

  options = options || {};

  const userProperty = options.userProperty || 'user';
  let separators = options.scopeSeparator || ' ';

  if (!Array.isArray(separators)) {
    separators = [ separators ];
  }

  return async function facebook(ctx) {
    const req = ctx.request;
    if (!req.body) { throw new Error('OAuth2orize requires body parsing. Did you forget app.use(express.bodyParser())?'); }

    // The `user` property of `req` holds the authenticated user. In the case
    // of the token end-point, this property will contain the OAuth 2.0 client.
    const client = ctx.state[userProperty],
      access_token = req.body.access_token,
      scope = req.body.scope;

    if (!access_token) { throw new TokenError('Missing required parameter: access_token', 'invalid_request'); }

    const profile = await getFacebookProfile(fields, access_token);

    if (scope) {
      for (let i = 0, len = separators.length; i < len; i++) {
        // Only separates on the first matching separator.
        // This allows for a sort of separator "priority"
        // (ie, favors spaces then fallback to commas).
        let separated = scope.split(separators[i]);

        if (separated.length > 1) {
          scope = separated;
          break;
        }
      }

      if (!Array.isArray(scope)) {
        scope = [ scope ];
      }
    }

    const arity = issue.length;
    let result;
    if (arity == 4) {
      result = await issue(client, profile, scope, req.body);
    } else { // arity == 3
      result = await issue(client, profile, scope);
    }

    let accessToken, refreshToken, params;
    if (Array.isArray(result)) {
      accessToken = result[0];
      refreshToken = result[1];
      params = result[2];
    } else {
      accessToken = result;
    }

    if (!accessToken) { throw new TokenError('Invalid facebook access token', 'invalid_grant'); }
    if (refreshToken && typeof refreshToken == 'object') {
      params = refreshToken;
      refreshToken = null;
    }

    let tok = {};
    tok.access_token = accessToken;
    if (refreshToken) { tok.refresh_token = refreshToken; }
    if (params) { tok = {...tok, ...params}; }
    tok.token_type = tok.token_type || 'Bearer';

    var json = JSON.stringify(tok);
    ctx.set('Content-Type', 'application/json');
    ctx.set('Cache-Control', 'no-store');
    ctx.set('Pragma', 'no-cache');
    ctx.body = json;
  };
};
