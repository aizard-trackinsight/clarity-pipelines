#!/bin/bash
platform=$(cat ./platform)
echo "Generating platformConfig.js (platform:$platform) for all lambdas..."
cat platformConfigTemplate.js | sed -e "s/PLATFORM/$platform/g" > platformConfig.js
cat unmanagedResourcesTemplate.yaml | sed -e "s/PLATFORM/$platform/g" > unmanagedResources.yaml