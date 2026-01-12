const config = require('./platformConfig');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-3' });
const sql = require('./sql');
const moment = require('moment');

const sanitize = name => {
  name = name.replace(/-/g,'_')
  return name
};

var Database = config.catalogDatabase;
var WorkGroup = config.athenaWorkgroup;
var TargetBucket = config.targetBucket;
var AthenaBucket = config.athenaBucket;
var stepFunctionroleArn = config.stepFunctionroleArn;
var accountID = config.accountID;

var args = {
  Database,
  WorkGroup,
  TargetBucket,
  AthenaBucket,
  stepFunctionroleArn,
  accountID,
  sanitize,
  namespaceLambda: config.namespace,
  namespaceStateMachine:config.namespace
};
console.log(JSON.stringify(args,undefined,2));
console.log(args.namespaceStateMachine.toString());

const steep = require('@trackinsight/steep')(args);
const workflows = require('./workflows')({config, steep});

exports.cleanUpTable = steep.owl.lambdaHandlers.cleanUpTable;

exports.getQuery = async (event, context) => {
  
  var tableName = event.tableName;
  var getBody = sql[tableName];
  
  if(getBody == null) {
    throw new Error(`No request found for ${tableName}`);
  }

  var args = event.args;
  var QueryString = getBody(args);

  if (event.insert) {
    var insertQuery = steep.owl.getInsert({
      tableName:tableName,
      QueryString
    });
    return insertQuery;
  } else if (event.ctas) {
    var folder = event.folder;
    var partitionBy = event.partitionBy;
    var ctasQuery = steep.owl.getCTAS({
      tableName,
      QueryString,
      folder,
      partitionBy
    })
    return ctasQuery;
  } else {
    return QueryString
  }

};

exports.deployPipeline = async (event, context) => {
  await workflows.deployPipeline({})
}

exports.workflows = workflows;

exports.getParams = async (event, context) => {

  var params = {};

  return params;

};


exports.updateTable = async (event, context) => {
  
  var cleanupArgs = steep.templates.getCleanUpInput({
    tableName:event.tableName,
    overridableDatabaseName:event.overridableDatabaseName,
    recreate:event.recreate,
    cleanupFolder:event.cleanupFolder,
    args:event.args,
    rawJSON:true});

  cleanupArgs.TableName = event.tableName;

  // console.log(JSON.stringify(cleanupArgs,undefined,2));
  
  var cleanupR = await steep.owl.lambdaHandlers.cleanUpTable(cleanupArgs);
  // console.log(cleanupR);

  var getQueryArgs = steep.templates.getUpdateDynamicTableInput(event);
  event.QueryString = await exports.getQuery(getQueryArgs);
  console.log(event.QueryString);

  await steep.owl.lambdaHandlers.runQuery(event)

  if (event.overridableDatabaseName != null) { // if source data, we sometimes need to registered partition folders. We can run it everytime without problems.
    await steep.owl.lambdaHandlers.runQuery({
      QueryString:"MSCK REPAIR TABLE "+event.overridableDatabaseName +"."+ event.tableName,
      maxRetries:5,
      delay:5})
  }

};

