'use strict';

require('dotenv');

import request from 'request-promise';
import crypto from 'crypto';

exports.getFacebookProfile = async function(fields, accessToken) {
  const facebookAppSecret = process.env.FB_APP_SECRET;

  if (!facebookAppSecret) {
    throw Error('FB_APP_SECRET needs to be on your environment properties.', 'invalid_request');  
  }

  const appSecretProof = crypto.createHmac('sha256', facebookAppSecret).update(accessToken).digest('hex');
  let url = `https://graph.facebook.com/me?access_token=${accessToken}&appsecret_proof=${appSecretProof}`;

  if (fields) {
    const fieldsString = fields.join();
    url += `&fields=${fieldsString}`;
  }
 
  return request({url: url, json: true})
    .then(function (profile) {
        if (!profile) { throw Error('Could not get Facebook profile using provided access token.', 'invalid_request'); }
        return profile;
    })
    .catch(function (err) {
        throw Error(`Could not get Facebook profile using provided access token - ${err}`, 'invalid_request');
    });
};
