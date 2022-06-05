import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';


// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface HamidAppAlbStackProps extends StackProps {
  readonly app_name: string;
  readonly vpc: ec2.Vpc;
  readonly sslCertificate: acm.Certificate;
}

export class HamidAppAlbStack extends Stack {
  constructor(scope: Construct, id: string, props: HamidAppAlbStackProps) {
    super(scope, id, props);

    const albSecGroup = new ec2.SecurityGroup(this, "albSecGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: "ALB Security Group",
      securityGroupName: props.app_name + "-" + "albSecGroup",
    });

    albSecGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "80 frm anywhere"
    );
    albSecGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "443 frm anywhere"
    );
    
    const ALBLoadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      "ALBLoadBalancer",
      {
        vpc: props.vpc,
        internetFacing: true,
        deletionProtection: false,
        http2Enabled: true,
        loadBalancerName: props.app_name,
        securityGroup: albSecGroup,
      }
    );

    new elbv2.ApplicationListener(this, "http-port", {
      loadBalancer: ALBLoadBalancer,
      defaultAction: elbv2.ListenerAction.redirect({
        host: "#{host}",
        path: "/#{path}",
        protocol: "HTTPS",
        port: "443",
        query: "#{query}",
      }),
      open: true,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    const port443 = new elbv2.ApplicationListener(this, "https-port", {
      loadBalancer: ALBLoadBalancer,
      open: true,
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [
        elbv2.ListenerCertificate.fromCertificateManager(props.sslCertificate),
      ],
      defaultAction: elbv2.ListenerAction.fixedResponse(403),
      sslPolicy: elbv2.SslPolicy.FORWARD_SECRECY_TLS12_RES_GCM,
    });
  }
}
