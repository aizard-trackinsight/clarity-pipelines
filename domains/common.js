const _ = require('lodash');

module.exports  = ({config,steep}) => {

  const getTableUpdateState = ({tableDefinition, source=false, delay=5, maxRetries=5, dynamic=false, args,uniqueName}) => {

    var Payload = {
      ...tableDefinition,
      overridableDatabaseName:source ? config.catalogSourceDatabase : null,
      recreate:(dynamic || args) ? false : true,
      cleanupFolder: source ? false : true,
      rawJSON:true,
      TableName:tableDefinition.tableName,
      delay: tableDefinition.delay || delay,
      maxRetries: tableDefinition.maxRetries || maxRetries,
    };

    if (dynamic) {
      let dynamicArgs = {};
      _.keys(tableDefinition.args).map(k => {
        tableDefinition.args
        dynamicArgs[`${k}.$`]=`$.${k}`;
      })
      Payload.args = dynamicArgs;
    }

    if (args) {
      Payload.args = args;
    }

    return steep.templates.getLambdaDefinition({
      StateName: (dynamic ? 'Dynamic Update':'Args Update')+' '+tableDefinition.tableName,
      FunctionName:'update-table',
      uniqueName,
      Payload
    })


  }

  const getTableWorkflow = ({tables, source=false, delay=5, maxRetries=5, dynamic=false,uniqueName}) => {
    
    var States = tables.map(tableDefinition => {
      return getTableUpdateState({tableDefinition, source, delay, maxRetries, dynamic,uniqueName});
    });

    var definition = steep.templates.sequence({States});
    
    return definition;
    
  };
 
  const updateTablesWorkflow = async ({tables,name,source=false, delay=5, maxRetries=5, dynamic=false,uniqueName=false}) => {
    
    var definition = getTableWorkflow({tables,source, delay, maxRetries, dynamic,uniqueName}) 
    
    // console.log(JSON.stringify(definition,undefined,2));

    await steep.stateMachines.updateOrCreateStateMachineByName({
      name,
      definition,
    });
    
  };

  return {
    getTableUpdateState,
    getTableWorkflow,
    updateTablesWorkflow,
  }

}