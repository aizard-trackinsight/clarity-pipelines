codename="clarity-pipelines"
platform=$(cat ./platform)
echo "Deploy on platform: $platform"
. setupPlatformConfig.sh
sam build
sam deploy \
  --stack-name $codename-$platform \
  --parameter-overrides Platform=$platform \
  --resolve-s3 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-3
npm run deployPipeline