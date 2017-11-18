'use strict';

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('dotenv');

exports.getFacebookProfile = (() => {
  var _ref = _asyncToGenerator(function* (fields, accessToken) {
    const facebookAppSecret = process.env.FB_APP_SECRET;

    if (!facebookAppSecret) {
      throw Error('FB_APP_SECRET needs to be on your environment properties.', 'invalid_request');
    }

    const appSecretProof = _crypto2.default.createHmac('sha256', facebookAppSecret).update(accessToken).digest('hex');
    let url = `https://graph.facebook.com/me?access_token=${accessToken}&appsecret_proof=${appSecretProof}`;

    if (fields) {
      const fieldsString = fields.join();
      url += `&fields=${fieldsString}`;
    }

    return (0, _requestPromise2.default)({ url: url, json: true }).then(function (profile) {
      if (!profile) {
        throw Error('Could not get Facebook profile using provided access token.', 'invalid_request');
      }
      return profile;
    }).catch(function (err) {
      throw Error(`Could not get Facebook profile using provided access token - ${err}`, 'invalid_request');
    });
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();