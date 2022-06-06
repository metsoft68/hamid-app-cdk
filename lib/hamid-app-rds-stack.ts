import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';


// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppRdsStackProps extends StackProps {
  readonly app_name: string;
  readonly vpc: ec2.Vpc;
  readonly name: string;
  readonly allocatedStorage: number;
}

export class HamidAppRdsStack extends Stack {

  constructor(scope: Construct, id: string, props: HamidAppRdsStackProps) {
    super(scope, id, props);
    
    const rds_sec_grp = new ec2.SecurityGroup(this, props.app_name + '-rds-SecGroup', {
      vpc: props.vpc,
      description: 'Allow access to RDS Postgres',
      allowAllOutbound: true
    });
    rds_sec_grp.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'allow access to Postgres');

    //setup 1 subnet group to assign to rds cluster
    const rds_subnet_group = new rds.SubnetGroup(this, props.app_name + 'RDS-SubnetGroup', {
      description: 'DB Subnet Group',
      vpc: props.vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      subnetGroupName: props.name + 'RDS-SubnetGroup',
      vpcSubnets: {
        availabilityZones: [Stack.of(this).availabilityZones[0], Stack.of(this).availabilityZones[1]],
        onePerAz: false,
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      }
    });

      //setup 1 rds postgres cluster

      new rds.DatabaseInstance(this, props.app_name + '_RDS_Instance', {
        engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_12_8 }),
        instanceIdentifier: props.name + "-rds",
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
        vpc: props.vpc,
        allocatedStorage: props.allocatedStorage,
        availabilityZone: Stack.of(this).availabilityZones[0],
        publiclyAccessible: false,
        subnetGroup: rds_subnet_group,
        securityGroups: [rds_sec_grp]
      });
  }
}
