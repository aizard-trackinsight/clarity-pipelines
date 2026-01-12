const _ = require('lodash');
const webevents = require('./domains/webevents/sql');

module.exports = {

  // sourceTable({folder}) {
  //   return `select * from ${folder}`
  // }

};

_.extend(module.exports, webevents);

//module.exports.define = {};
//_.extend(module.exports.define, listings.define);
