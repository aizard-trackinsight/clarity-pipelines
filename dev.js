var sql = require('./domains/webevents/sql');
var fs = require('fs');

var query = sql.flagged_traffic({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/flagged_traffic.sql',query);

query = sql.enriched_traffic({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/enriched_traffic.sql',query);

query = sql.filtered_traffic_v2({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/filtered_traffic_v2.sql',query);

query = sql.filtered_traffic_v1({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/filtered_traffic_v1.sql',query);

query = sql.sessions({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/sessions.sql',query);


query = sql.merged_traffic({year:'2023','month':'09'});
console.log(query);
fs.writeFileSync('./tmp/merged_traffic.sql',query);
