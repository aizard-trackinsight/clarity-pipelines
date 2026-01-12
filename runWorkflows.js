const config = require('./platformConfig');
const lambdas = require('./lambdas');
// const outputs = require('@trackinsight/outputs');
// const liveParams = require('./liveParams')({config});
// const eventBridgeRules = require('./eventBridgeRules')({config});
// const logGroups = require('./logGroups')({config});

const AWS = require('aws-sdk');
const region = 'eu-west-3'; // Replace with your desired AWS region
AWS.config.update({ region: region });
const stepfunctions = new AWS.StepFunctions();
const lambda = new AWS.Lambda();

var AthenaBucket = config.athenaBucket;
var Database = config.catalogTargetDatabase;
var WorkGroup = config.athenaWorkgroup;
var TargetBucket = config.targetBucket;
var stepFunctionroleArn = config.stepFunctionroleArn;
var accountID = config.accountID;

const sanitize = name => {
  name = name.replace(/-/g,'_')
  return name
};


var args = {
  Database,
  WorkGroup,
  AthenaBucket,
  TargetBucket,
  stepFunctionroleArn,
  accountID,
  sanitize,
  namespaceLambda: config.namespace,
  namespaceStateMachine:config.namespace
};

console.log(JSON.stringify(args,undefined,2));
//console.log(args.namespaceStateMachine.toString());

const steep = require('@trackinsight/steep')(args);
// const pipelines = require('./pipelines')({config,steep});


const invokeLambda = (name,Payload) => {

  var params = {
    FunctionName: config.lambdaArn(name),
    InvocationType: 'Event', // Use 'Event' for asynchronous invocation
    Payload:JSON.stringify(Payload)
  }
  console.log(params);
  return lambda.invoke(params).promise();

}

(async function () { 

  var months = ["03","04","05","06","07","08","09","10","11"];
  months = ["11"];

  for (let i in months) {

    var month = months[i];

    // var tableDefinition = { tableName: "merged_traffic", args: {year:'2023',month},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:25};
    // var tableDefinition = { tableName: "users", partitions:[{project:'trackinsight.com'}],delay:5};
    // var tableDefinition = { tableName: "sessions", args: {year:'2023',month},partitions:[{project:'trackinsight.com'}],delay:5};
    var tableDefinition = { tableName: "enriched_traffic", args: {year:'2023',month},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:9};
    
    let Payload = {
      ...tableDefinition,
      recreate:true,
      cleanupFolder:true,
      // args
      // args:{
      //   "stamp.$":"$.stamp",
      //   'environment.$':'$.detail.environment'
      // },
      source:false,
      delay:tableDefinition.delay,
    }

    console.log(JSON.stringify(Payload,undefined,2));
    
    var q = await lambdas.updateTable(Payload);
  }

})();