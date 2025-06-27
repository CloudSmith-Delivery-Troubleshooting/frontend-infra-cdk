import { IAspect, IConstruct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

/**
 * Aspect that applies a prefix to resource names
 * This helps avoid naming conflicts when deploying multiple instances of the same stack
 */
export class PrefixAspect implements IAspect {
  constructor(private readonly prefix: string) {}

  visit(node: IConstruct): void {
    // Apply prefix to CloudFormation resources
    if (node instanceof cdk.CfnResource) {
      this.applyPrefixToResource(node);
    }
  }

  private applyPrefixToResource(resource: cdk.CfnResource): void {
    const resourceType = resource.cfnResourceType;

    // Handle different resource types that support custom naming
    switch (resourceType) {
      case 'AWS::S3::Bucket':
        this.applyPrefixToProperty(resource, 'BucketName');
        break;

      case 'AWS::CloudFront::Distribution':
        // CloudFront distributions don't have a name property, but we can add tags
        this.addPrefixTag(resource);
        break;

      case 'AWS::CloudFront::OriginAccessControl':
        this.applyPrefixToProperty(resource, 'OriginAccessControlConfig.Name');
        break;

      case 'AWS::CertificateManager::Certificate':
        // ACM certificates are identified by domain name, not a custom name
        this.addPrefixTag(resource);
        break;

      case 'AWS::Route53::RecordSet':
        // Route53 records are identified by name and type
        this.addPrefixTag(resource);
        break;

      case 'AWS::IAM::Policy':
        this.applyPrefixToProperty(resource, 'PolicyName');
        break;

      case 'AWS::IAM::Role':
        this.applyPrefixToProperty(resource, 'RoleName');
        break;

      case 'AWS::Lambda::Function':
        this.applyPrefixToProperty(resource, 'FunctionName');
        break;

      default:
        // For resources that don't have specific naming properties,
        // we can still add a tag for identification
        this.addPrefixTag(resource);
        break;
    }
  }

  private applyPrefixToProperty(resource: cdk.CfnResource, propertyPath: string): void {
    const properties = propertyPath.split('.');
    let current: any = resource;

    // Navigate to the parent of the target property
    for (let i = 0; i < properties.length - 1; i++) {
      if (!current[properties[i]]) {
        current[properties[i]] = {};
      }
      current = current[properties[i]];
    }

    const finalProperty = properties[properties.length - 1];
    const currentValue = current[finalProperty];

    // Only add prefix if the property doesn't already start with the prefix
    if (currentValue && typeof currentValue === 'string' && !currentValue.startsWith(this.prefix)) {
      current[finalProperty] = `${this.prefix}-${currentValue}`;
    } else if (!currentValue) {
      // If no current value, we can't apply a prefix meaningfully
      // This is handled by the individual resource constructs
    }
  }

  private addPrefixTag(resource: cdk.CfnResource): void {
    if (!resource.tags) {
      resource.tags = cdk.TagManager.of(resource);
    }

    // Add a tag to identify the prefix used
    cdk.Tags.of(resource).add('Prefix', this.prefix);
    cdk.Tags.of(resource).add('Application', `${this.prefix}-frontend`);
  }
}
