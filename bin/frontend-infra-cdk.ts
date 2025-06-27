#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendInfraStack } from '../lib/frontend-infra-stack';
import { PrefixAspect } from '../lib/aspects/prefix-aspect';

const app = new cdk.App();

// Get environment variables
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';
const prefix = process.env.PREFIX || 'frontend';

const stack = new FrontendInfraStack(app, `${prefix}-FrontendInfraStack`, {
  env: {
    account: account,
    region: region,
  },
  description: 'Frontend infrastructure stack with S3, CloudFront, and optional Route53/ACM',
});

// Apply prefix aspect to all resources
cdk.Aspects.of(stack).add(new PrefixAspect(prefix));

app.synth();
