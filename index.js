#!/usr/bin/env node

var
  _ = require('lodash'),
  async = require('async'),
  twitter = require('twitter'),
  google_spreadsheet = require('google-spreadsheet'),
  refresh_interval = process.env.REFRESH_INTERVAL || 5 * 60 * 1000;

async.auto({
  fetch_sheet: function(callback) {
    if (!process.env.GOOGLE_SHEET_ID) {
      return callback(new Error('GOOGLE_SHEET_ID: Google Sheet Id undefined'));
    }
    var
      doc = new google_spreadsheet(process.env.GOOGLE_SHEET_ID),
      formatted_rows = [];
    doc.getRows(1, {}, function handleRows(error, rows) {
      if (error) {
        return callback(error);
      }
      formatted_rows = _.map(rows, function (row) {
        return {
          'date': Date.parse(row.date),
          'tweet': row.tweet.slice(0, 140)
        }
      });
      return callback(null, formatted_rows);
    });
  },
  check_times: ['fetch_sheet', function (callback, results) {
    var
      max_time = Date.now(),
      min_time = max_time - refresh_interval,
      tweets_to_send = [];
    tweets_to_send = _.filter(results.fetch_sheet, function (tweet) {
      console.log(min_time + "-" + max_time);
      console.log(tweet.date);
      return tweet.date > min_time && tweet.date < max_time;
    });
    tweets_to_send = _.map(tweets_to_send, "tweet");
    return callback(null, tweets_to_send);
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
  post_tweets: ['auth_twitter', function (callback, results) {
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
  report_back: ['post_tweets', function (callback, results) {
    console.log('This will report a status back to the Google Sheet');
    // async code to report status back to the Google Sheet
    callback(null);
  }]
}, function (err, results) {
  console.log('err = ', err);
  console.log('results = ', results);
});
