import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';



// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppOpensearchStackProps extends StackProps {
  readonly app_name: string;
  readonly vpc: ec2.Vpc;
  readonly name: string;
  readonly sourceIpPrefixAccess: string;
  readonly volumeSize: number;
  readonly dataNodeInstanceType: string;
  readonly dataNodes: number;
}

export class HamidAppOpensearchStack extends Stack {

  constructor(scope: Construct, id: string, props: HamidAppOpensearchStackProps) {
    super(scope, id, props);
    
      const pvt_subnets = props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED });

      //setup 1 security group for Opensearch Cluster
      const opensearch_sec_grp = new ec2.SecurityGroup(this, props.app_name + '-opensearch_sec_grp', {
        vpc: props.vpc,
        description: 'Allow access to opensearch cluster',
        allowAllOutbound: true
      });
      opensearch_sec_grp.addIngressRule(ec2.Peer.ipv4(props.sourceIpPrefixAccess), ec2.Port.tcp(443), 'allow access to Opensearch');
  
      //setup opensearch configuration
      const ClusterdomainProps: opensearch.DomainProps = {
        domainName: props.name + '-opensearch-cluster',
        version: opensearch.EngineVersion.OPENSEARCH_1_0,
        removalPolicy: RemovalPolicy.DESTROY,
        vpc: props.vpc,
        vpcSubnets: [pvt_subnets],
        ebs: {
          volumeSize: props.volumeSize,
        },
        zoneAwareness: {
          enabled: true,
        },
        capacity: {
          dataNodeInstanceType: props.dataNodeInstanceType,
          dataNodes: props.dataNodes
        },
        securityGroups: [opensearch_sec_grp],
        accessPolicies: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['es:*'],
            principals: [
              new AnyPrincipal(),
            ],
            resources: ["*"],
          })
        ],
  
      };
  
      new opensearch.Domain(this, 'elasticsearch_cluster', ClusterdomainProps);
  }
}
