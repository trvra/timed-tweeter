var
  _ = require('lodash'),
  p_json = require('./package.json')
  async = require('async'),
  twitter = require('twitter');

async.auto({
  fetch_sheet: function(callback) {
    console.log('This will fetch the Google Sheet');
    // async code to fetch the sheet
    console.log(process.env.GOOGLE_SHEET_ID);
    callback(null);
  },
  check_times: ['fetch_sheet', function (results, callback) {
    console.log('This will check sheet data for potential tweets');
    // async code to search sheet data for potential tweets
    callback(null);
  }],
  auth_twitter: ['check_times', function (callback) {
    var
      twitterAuthEnv = [
        'TWITTER_CONSUMER_KEY',
        'TWITTER_CONSUMER_SECRET',
        'TWITTER_ACCESS_TOKEN_KEY',
        'TWITTER_ACCESS_TOKEN_SECRET',
        'TWITTER_HANDLE',
      ];
    _.forEach(twitterAuthEnv, function (env) {
      if (!process.env[env]) {
        return callback(new Error(env + ': Twitter authentication undefined'));
      }
    });

    callback(null, new twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    }));
  }],
  post_tweets: ['auth_twitter', function (results, callback) {
    var
      client = results.auth_twitter,
      params = {
        screen_name: process.env.TWITTER_HANDLE,
      };
    async.eachSeries(results.check_times, function (tweetText, eachCb) {
      params.status = tweetText;
      client.post('statuses/update', params, function (error, tweet, response) {
        if (error) {
          return eachCb(error);
        }
        console.log(tweet);  // Tweet body.
        console.log(response);  // Raw response object.
        eachCb(null);
      });
    }, callback);
  }],
  report_back: ['post_tweets', function (results, callback) {
    console.log('This will report a status back to the Google Sheet');
    // async code to report status back to the Google Sheet
    callback(null);
  }]
}, function (err, results) {
  console.log('err = ', err);
  console.log('results = ', results);
});
