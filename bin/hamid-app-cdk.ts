#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HamidAppCdkStack } from '../lib/hamid-app-cdk-stack';
import * as utils from '../utils';
import { HamidAppVpcStack } from '../lib/hamid-app-vpc-stack';

const app = new cdk.App();
const  configjson = utils.readJSON("./bin/config.json");

new HamidAppVpcStack(app, "HamidAppVpcStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  app_name: configjson.app.name,
  cidr: configjson.vpc.cidr,
  maxAzs: configjson.vpc.maxAzs,
  subnets: configjson.vpc.subnets,
  enableDnsHostnames: configjson.vpc.enableDnsHostnames,
  enableDnsSupport: configjson.vpc.enableDnsSupport,
});

new HamidAppCdkStack(app, 'HamidAppCdkStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

/*
  readonly app_name: string;
  readonly cidr: string;
  readonly maxAzs: number;
  readonly subnets: any[];
  readonly enableDnsHostnames: boolean;
  readonly enableDnsSupport: boolean;
*/
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});