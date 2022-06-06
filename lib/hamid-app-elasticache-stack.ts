import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { aws_elasticache as elasticache } from 'aws-cdk-lib';


// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppElasticcacheStackProps extends StackProps {
  readonly app_name: string;
  readonly vpc: ec2.Vpc;
  readonly name: string;
  readonly defaultRedisPassword: string;

}

export class HamidAppElasicacheStack extends Stack {

  constructor(scope: Construct, id: string, props: HamidAppElasticcacheStackProps) {
    super(scope, id, props);
    
    const pvt_subnets = props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED });

    //setup 1 security group for elasticache redis
    const redis_sec_grp = new ec2.SecurityGroup(this, props.app_name + '-SecurityGroup', {
      vpc: props.vpc,
      description: 'Allow access to Elasticache Redis',
      allowAllOutbound: true,
      securityGroupName: props.name + '-redis-cluster-sgrp'
    });
    redis_sec_grp.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379), 'allow access to elasticache');

    //Create 1 R/W user in Elasticache
    const cfnUser = new elasticache.CfnUser(this, 'RedisUser', {
      engine: 'redis',
      userId: props.name + '-master',
      userName: props.name + '-master',
      accessString: 'on ~* +info +@all',
      noPasswordRequired: false,
      passwords: [props.defaultRedisPassword]
    });
  }
}
