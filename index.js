var
  p_json = require('./package.json')
  async = require('async'),
  program = require('commander');

program
  .version(p_json.version)
  .option('-s --sheetid', 'Google Sheet ID')
  .option('-t --twitter', 'Twitter Auth Somehow')
  .parse(process.argv);

async.auto({
  fetch_sheet: function(callback) {
    console.log('This will fetch the Google Sheet');
    // async code to fetch the sheet
    callback(null);
  },
  check_time: ['fetch_sheet', function (results, callback) {
    console.log('This will check sheet data for potential tweets');
    // async code to search sheet data for potential tweets
    callback(null);
  }],
  auth_twitter: ['check_time', function (callback) {
    console.log('This will OAuth with Twitter');
    // async code to use OAuth
    callback(null);
  }],
  post_tweets: ['check_time', function (results, callback) {
    console.log('This will send tweets that are scheduled to be posted');
    // async code to post tweets
    callback(null);
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
