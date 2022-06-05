import { Stack, StackProps } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';


// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppDnsStackProps extends StackProps {
  readonly domainName: string;
  readonly internalDomainNamespace: string;
  readonly vpc: ec2.Vpc;
}

export class HamidAppDnsStack extends Stack {
  static sslCertificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: HamidAppDnsStackProps) {
    super(scope, id, props);
    
    const myHostedZone = route53.HostedZone.fromLookup(this, 'baseZone', {
      domainName: props.domainName
    });

    const sslcertificiate = new acm.Certificate(this, 'Certificate', {
      domainName: "*." + props.domainName,
      validation: acm.CertificateValidation.fromDns(myHostedZone),
    });

    HamidAppDnsStack.sslCertificate=sslcertificiate;

    const dnsNamespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "PrivateDnsNamespace",
      {
        name: props.internalDomainNamespace + "." + props.domainName,
        vpc: props.vpc,
        description: "Private DnsNamespace for hamid testlab",
      }
    );

  }
}
