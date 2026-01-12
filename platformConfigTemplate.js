const platform = 'PLATFORM';
const project = "clarity-pipelines"
const projectCodeName = "clarity-pipelines"
const resourcePrefix = `${projectCodeName}-${platform}`;
const accountID = '127824203942';
const namespace = x => `${resourcePrefix}-${x}`;

module.exports = {
  accountID,
  platform,
  project,
  projectCodeName,
  resourcePrefix,
  namespace,
  stepFunctionroleArn:`arn:aws:iam::${accountID}:role/${namespace('stepfunction-role')}`,
  lambdaRoleArn:`arn:aws:iam::${accountID}:role/${namespace('lambda-role')}`,
  stateMachineNamespace: resourcePrefix,
  athenaWorkgroup: resourcePrefix,
  catalogDatabase: resourcePrefix,
  sourceBucket:namespace('source'),
  targetBucket:namespace('target'),
  athenaBucket:namespace('athena'),
};