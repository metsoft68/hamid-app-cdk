import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppVpcStackProps extends StackProps {
  readonly app_name: string;
  readonly cidr: string;
  readonly maxAzs: number;
  readonly subnets: any[];
  readonly enableDnsHostnames: boolean;
  readonly enableDnsSupport: boolean;
}

export class HamidAppVpcStack extends Stack {

  static vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: HamidAppVpcStackProps) {
    super(scope, id, props);
    
    const subnetConfig: any[] = [];
    props.subnets.forEach(function (subnet) {
      const tempDict: any = {};
      switch(subnet.type) {
        case "public":
          tempDict.subnetType=ec2.SubnetType.PUBLIC;
          break;
        case "private_isolated":
          tempDict.subnetType=ec2.SubnetType.PRIVATE_ISOLATED;
          break;
        case "private_with_nat":
          tempDict.subnetType=ec2.SubnetType.PRIVATE_WITH_NAT;
          break;
      }
      tempDict.cidrMask=subnet.cidrMask;
      tempDict.name=subnet.name;
      subnetConfig.push(tempDict);
    });
    
    const vpc = new ec2.Vpc(this, props.app_name + "-vpc", {
      cidr: props.cidr,
      enableDnsHostnames: props.enableDnsHostnames,
      enableDnsSupport: props.enableDnsSupport,
      maxAzs: props.maxAzs,
      subnetConfiguration: subnetConfig
    });

    HamidAppVpcStack.vpc=vpc;
  }
}
