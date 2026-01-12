const _ = require('lodash');

module.exports = ({config,steep}) => {
  
  const webevents = require('./domains/webevents/workflows')({config, steep})

  const deployPipeline = async ({}) => {
    await webevents.deployPipeline({});
  };

  return {
    webevents,
    deployPipeline
  }

}