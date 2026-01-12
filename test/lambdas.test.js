const _ = require('lodash');
const config = require('../platformConfig');
const lambdas = require('../lambdas');

test('getQuery returns without errors', async () => {

  var baseEvent = {
    tableName: "filtered_traffic",
    args: {year:'2023',month:'05'},
    partitions:[{project:'trackinsight.com',eventtype_class:'PAGEVIEWS'}],
  }
  var query1 = await lambdas.getQuery({...baseEvent});
  //console.log(query);
  expect(query1).toBeDefined;
  
  var query2 = await lambdas.getQuery({...baseEvent,ctas:true});
  //console.log(query);
  expect(query2).toBeDefined;

  var query3 = await lambdas.getQuery({...baseEvent,insert:true});
  // console.log(query3);
  expect(query3).toBeDefined;


})

test('workflows are namespaced', async () => {
  var workflow = lambdas.workflows.webevents.getUpdateWorkflow({});
  //console.log(JSON.stringify(workflow,undefined,2));
  for (let stateName in workflow.States) {
    let State = workflow.States[stateName];
    for (let b in State.Branches) {
      let Branch = State.Branches[b];
      for (let stateName in Branch.States) {

        let State = Branch.States[stateName];
        if (State.Resource == 'arn:aws:states:::lambda:invoke') {
          expect(State.Parameters.FunctionName.indexOf(config.resourcePrefix)).toBe(0);
        }
      }
    }
  }

})

test('getChainWorkflow is correct', async () => {

  var workflow = lambdas.workflows.webevents.getChainWorkflow({});
  
  expect(workflow).toBeDefined();

})