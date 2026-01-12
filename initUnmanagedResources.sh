#!/bin/bash
codename="clarity-pipelines"
platform=$(cat ./platform)
. setupPlatformConfig.sh
echo "Deploying unmanaged resources (platform:$platform)..."
sam build -t unmanagedResources.yaml
sam deploy \
  --stack-name $codename-$platform-unmanaged-resources \
  --parameter-overrides Platform=$platform \
  --resolve-s3 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-3