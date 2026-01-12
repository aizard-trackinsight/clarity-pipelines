var workflowTables = [
  { tableName: "filtered_traffic_v1", args: {year:'2023',month:'07',},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:25},
  { tableName: "normalized_traffic_v2", args: {year:'2023',month:'07'},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:25},
  { tableName: "filtered_traffic_v2", args: {year:'2023',month:'07'},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:25},
  { tableName: "merged_traffic", args: {year:'2023',month:'07'},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:25},
  { tableName: "users", partitions:[{project:'trackinsight.com'}],delay:5},
  { tableName: "sessions", args: {year:'2023',month:'03'},partitions:[{project:'trackinsight.com'}],delay:5},
  { tableName: "session_clusters", args: {year:'2023',month:'03'},partitions:[{project:'trackinsight.com'}],delay:10},
  { tableName: "master_sessions", args: {year:'2023',month:'03'},partitions:[{project:'trackinsight.com'}],delay:10},
  { tableName: "enriched_traffic", args: {year:'2023',month:'07'},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:9},
  { tableName: "enriched_traffic_master_sessions", args: {year:'2023',month:'07'},partitions:[{project:'trackinsight.com'},{eventtype_class:'PAGEVIEWS'}],delay:10},
];

module.exports = ({config, steep}) => {

  var common = require('../common')({config,steep});

  //exporting for jest testing
  const getUpdateWorkflow = ({}) => {

    var workflow = steep.blueprints.getUpdateWorkflow({
      StateMachineName:'workflow-update',
      StateName:'Update Workflow',
      workflowTables
    });  
    return workflow;
  };

  const updateWorkflows = async ({workflowTable}) => {

    var {tableName, args, partitions} = workflowTable;

    console.log('updating workflows: '+tableName);
  
    console.log(`${tableName}-update`);
    await steep.blueprints.updateUpdateWorkflow({
      name:`${tableName}-update`,
      StateName:'Update Workflow',
      workflowTables:workflowTables.filter(w => w.tableName==tableName)
    });
    
    console.log(`${tableName}-reset`);
    await steep.blueprints.updateResetWorkflow({
      name:`${tableName}-reset`,
      StateName:'Reset Workflow',
      workflowTables:workflowTables.filter(w => w.tableName==tableName)
    });

    if (args && args.year) {
    
      var inputs = [
        {year:"2023",month:"03"},
        {year:"2023",month:"04"},
        {year:"2023",month:"05"},
        {year:"2023",month:"06"},
        {year:"2023",month:"07"},
        {year:"2023",month:"08"},
        {year:"2023",month:"09"},
        {year:"2023",month:"10"},
        {year:"2023",month:"11"}
      ];

      // Workflow to reset tables + recompute history
      console.log(`${tableName}-update-history`);
      await steep.blueprints.updateChainWorkflow({      
        name:`${tableName}-update-history`,
        StateMachineName:`${tableName}-update`,
        inputs
      });

      // Workflow to reset tables + recompute history
      console.log(`${tableName}-reset-update-history`);
      var resetHistoryDefinition = steep.blueprints.chainWorkflows({workflows:[
        steep.blueprints.getUpdateWorkflow({
          recreate:true,
          StateName:'Reset Workflow',
          workflowTables:workflowTables.filter(w => w.tableName==tableName)
        }),
         steep.blueprints.getChainWorkflow({      
          StateMachineName:`${tableName}-update`,
          inputs
        }),
      ]});

      await steep.stateMachines.updateOrCreateStateMachineByName({
        name:`${tableName}-reset-update-history`,
        definition:resetHistoryDefinition});

    }
  };

  const updateFullMonthlyWorkflow = async ({partial=false}) => {

    var workflows = workflowTables
    .filter(w => !partial || ["sessions","enriched_traffic"].indexOf(w.tableName) !=-1)
    .map(w => {
      return steep.blueprints.getUpdateWorkflow({
        recreate:w.tableName=='users',
        StateName:'Update '+w.tableName,
        workflowTables:[w]
      });
    });

    var definition = steep.blueprints.chainWorkflows({workflows})
    
    await steep.stateMachines.updateOrCreateStateMachineByName({
      name:`update-${partial ? 'partial':'all'}-monthly`,
      definition,
    })

  };

  const updateFullMonthlyHistoryWorkflow = async ({}) => {

    var inputs = [
      {year:"2023",month:"03"},
      {year:"2023",month:"04"},
      {year:"2023",month:"05"},
      {year:"2023",month:"06"},
      {year:"2023",month:"07"},
      {year:"2023",month:"08"},
      {year:"2023",month:"09"},
      {year:"2023",month:"10"},
      {year:"2023",month:"11"}
    ];

    await steep.blueprints.updateChainWorkflow({      
      name:`update-all-monthly-history`,
      StateMachineName:`update-all-monthly`,
      inputs
    })
  };

  const updateFullUpdateHistoryWorkflow = async ({from_table}) => {

    var tables = workflowTables.filter(w => ['users','enriched_traffic'].indexOf(w.tableName)==-1);
    
    if (from_table) {
      var idx = tables.map(w => w.tableName).indexOf(from_table);
      tables = tables.filter( (w,i) => i >= idx);
    }

    var argsList = [
      {year:"2023",month:"03"},
      {year:"2023",month:"04"},
      {year:"2023",month:"05"},
      {year:"2023",month:"06"},
      {year:"2023",month:"07"},
      {year:"2023",month:"08"},
      {year:"2023",month:"09"},
      {year:"2023",month:"10"},
      {year:"2023",month:"11"}
    ];

    var States = [];

    tables.map(w => {

      argsList.map(args => {

        var State = common.getTableUpdateState({
          tableDefinition:w,
          args,
          source:false,
          delay:w.delay,
          maxRetries:w.maxRetries,
          uniqueName:true
        });
        // console.log(JSON.stringify(State,undefined,2));
        States.push(State);

      })

    })

    var usersTable = workflowTables.filter(w => w.tableName=='users')[0];
    States.push(common.getTableUpdateState({
      tableDefinition:usersTable,
      source:false,
      delay:usersTable.delay,
      maxRetries:usersTable.maxRetries,
      uniqueName:true
    }));
    
    var enrichedTrafficTable = workflowTables.filter(w => w.tableName=='enriched_traffic')[0];
    argsList.map(args => {

      var State = common.getTableUpdateState({
        tableDefinition:enrichedTrafficTable,
        args,
        source:false,
        delay:enrichedTrafficTable.delay,
        maxRetries:enrichedTrafficTable.maxRetries,
        uniqueName:true
      });
      // console.log(JSON.stringify(State,undefined,2));
      States.push(State);

    })

    
    var definition = steep.templates.sequence({States});
    // console.log(JSON.stringify(definition,undefined,2));
    
    await steep.stateMachines.updateOrCreateStateMachineByName({
      name:`full-update-history`,
      definition,
    });


  };

  //exporting for jest testing 
  const getChainWorkflow = ({}) => {

    var inputs = [
      {year:"2023",month:"03"},
      {year:"2023",month:"04"},
      {year:"2023",month:"05"},
      {year:"2023",month:"06"},
    ]

    return steep.blueprints.getChainWorkflow({
      name:'workflow-history',
      StateMachineName:'workflow-update',
      inputs
    });
  
  };

  const deployPipeline = async ({}) => {
  
    for (let i in workflowTables) {
      
      let workflowTable = workflowTables[i];
      
      try {
        await updateWorkflows({workflowTable})
      } catch (e) {
        console.log(e)
      }

    }

    await updateFullMonthlyWorkflow({});
    await updateFullMonthlyWorkflow({partial:true});
    await updateFullMonthlyHistoryWorkflow({});
    await updateFullUpdateHistoryWorkflow({from_table:'merged_traffic'});

  };

  return {
    deployPipeline,
    //exporting for jest testing 
    getUpdateWorkflow,
    getChainWorkflow
    
  }

};