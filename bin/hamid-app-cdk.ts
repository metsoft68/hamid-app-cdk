#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as utils from '../utils';
import { HamidAppVpcStack } from '../lib/hamid-app-vpc-stack';
import { HamidAppDnsStack } from '../lib/hamid-app-dns-stack';
import { HamidAppAlbStack } from '../lib/hamid-app-alb-stack';
import { HamidAppElasicacheStack } from '../lib/hamid-app-elasticache-stack';
import { HamidAppRdsStack } from '../lib/hamid-app-rds-stack';
import { HamidAppOpensearchStack } from '../lib/hamid-app-opensearch-stack';

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

new HamidAppDnsStack(app, "HamidAppDnsStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  domainName: configjson.route53.domain,
  internalDomainNamespace: configjson.route53.internalDomainNamespace,
  vpc: HamidAppVpcStack.vpc
});

new HamidAppAlbStack(app, "HamidAppAlbStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  app_name: configjson.app.name,
  vpc: HamidAppVpcStack.vpc,
  sslCertificate: HamidAppDnsStack.sslCertificate
});

new HamidAppElasicacheStack(app, "HamidElasticacheStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  app_name: configjson.app.name,
  vpc: HamidAppVpcStack.vpc,
  name: configjson.redis.name,
  defaultRedisPassword: configjson.redis.defaultRedisPassword
});

new HamidAppRdsStack(app, "HamidAppRdsStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  app_name: configjson.app.name,
  vpc: HamidAppVpcStack.vpc,
  name: configjson.rds.name,
  allocatedStorage: configjson.rds.allocatedStorage
});

new HamidAppOpensearchStack(app, "HamidAppOpensearchStack", {
  env: { account: configjson.env.accountnumber, region: configjson.env.region },
  app_name: configjson.app.name,
  vpc: HamidAppVpcStack.vpc,
  name: configjson.opensearch.name,
  sourceIpPrefixAccess: configjson.vpc.cidr,
  volumeSize: configjson.opensearch.volumeSize,
  dataNodeInstanceType: configjson.opensearch.dataNodeInstanceType,
  dataNodes: configjson.opensearch.dataNodes
});

