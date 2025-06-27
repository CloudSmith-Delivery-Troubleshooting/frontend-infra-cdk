# Frontend Infrastructure CDK

A comprehensive AWS CDK application in TypeScript for deploying frontend infrastructure with S3, CloudFront, and optional Route53/ACM certificate support.

## 🏗️ Architecture

This CDK app provisions:

- **S3 Bucket**: Private bucket for hosting static files with versioning and encryption
- **CloudFront Distribution**: Global CDN with Origin Access Control (OAC) for secure S3 access
- **Origin Access Control (OAC)**: Secure access to S3 bucket (recommended over OAI)
- **SSL/TLS Certificate**: Optional ACM certificate with DNS validation
- **Route53 Records**: Optional A records for custom domain
- **Prefix Support**: Environment variable-based resource prefixing to avoid naming conflicts

## 🚀 Features

- **Environment-based Prefixing**: Use `PREFIX` environment variable to deploy multiple instances
- **Security Best Practices**: Private S3 bucket, OAC, HTTPS redirect, proper IAM policies
- **SPA Support**: Error page routing for Single Page Applications (404/403 → index.html)
- **TypeScript**: Fully typed with comprehensive error checking
- **Testing**: Jest test suite with CDK assertions
- **CI/CD Ready**: GitHub Actions workflow for automated deployment
- **Flexible Domain**: Support for custom domains with automatic SSL certificates

## 📋 Prerequisites

- Node.js 20 or higher
- AWS CLI configured
- AWS CDK v2 installed globally: `npm install -g aws-cdk`
- An AWS account with appropriate permissions

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Bootstrap CDK** (one-time setup per AWS account/region):
   ```bash
   cdk bootstrap
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PREFIX` | Resource name prefix | `frontend` | No |
| `AWS_ACCOUNT_ID` | AWS Account ID | CDK default | No |
| `AWS_REGION` | AWS Region | `us-east-1` | No |

### Stack Properties

You can customize the stack by passing properties:

```typescript
new FrontendInfraStack(app, 'MyStack', {
  domainName: 'example.com',          // Custom domain
  hostedZoneId: 'Z1234567890ABC',     // Route53 hosted zone ID
  certificateArn: 'arn:aws:acm:...',  // Existing certificate ARN
});
```

## 🚀 Deployment

### Local Deployment

1. **Set environment variables**:
   ```bash
   export PREFIX=myapp
   export AWS_REGION=us-east-1
   ```

2. **Deploy the stack**:
   ```bash
   npm run build
   npm run synth
   npm run deploy
   ```

### Multiple Environments

Deploy different environments with different prefixes:

```bash
# Development
PREFIX=dev npm run deploy

# Staging
PREFIX=staging npm run deploy

# Production
PREFIX=prod npm run deploy
```

## 🔄 GitHub Actions CI/CD

### Setup

1. **Create GitHub repository secrets**:
   - `AWS_ACCOUNT_ID`: Your AWS account ID
   - `AWS_REGION`: Target AWS region

2. **Set up AWS authentication** (choose one method):

   **Option A: OIDC (Recommended)**
   ```bash
   # Create OIDC role in AWS (replace with your GitHub org/repo)
   aws iam create-role --role-name GitHubActionsRole --assume-role-policy-document '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
             "token.actions.githubusercontent.com:sub": "repo:YOUR-ORG/YOUR-REPO:ref:refs/heads/main"
           }
         }
       }
     ]
   }'
   ```

   **Option B: Access Keys (Less Secure)**
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key

### Workflow Behavior

- **Push to `main`**: Deploys with `PREFIX=prod`
- **Push to `develop`**: Deploys with `PREFIX=dev`
- **Pull Request**: Creates preview environment with `PREFIX=pr-{number}`
- **PR Closed**: Automatically destroys preview environment

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🏗️ Project Structure

```
├── bin/
│   └── frontend-infra-cdk.ts          # CDK app entry point
├── lib/
│   ├── frontend-infra-stack.ts        # Main infrastructure stack
│   └── aspects/
│       └── prefix-aspect.ts           # Resource prefix aspect
├── test/
│   └── frontend-infra-stack.test.ts   # Test suite
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions workflow
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── cdk.json                           # CDK configuration
├── jest.config.js                     # Jest test configuration
└── README.md                          # This file
```

## 🎯 Usage Examples

### Basic Deployment

```bash
PREFIX=myapp npm run deploy
```

### With Custom Domain

```typescript
new FrontendInfraStack(app, 'MyStack', {
  domainName: 'myapp.example.com',
  hostedZoneId: 'Z1D633PJN98FT9',
});
```

### Deploy Static Files

Uncomment the `BucketDeployment` construct in the stack and create a `website/` directory:

```bash
mkdir website
echo '<html><body><h1>Hello World!</h1></body></html>' > website/index.html
npm run deploy
```

## 🔍 Monitoring & Debugging

### Useful Commands

```bash
# View CloudFormation template
npm run synth

# Compare deployed stack vs current code
npm run diff

# View stack outputs
aws cloudformation describe-stacks --stack-name PREFIX-FrontendInfraStack

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DISTID --paths "/*"
```

### Stack Outputs

The stack provides these outputs:

- `BucketName`: S3 bucket name
- `DistributionId`: CloudFront distribution ID
- `DistributionDomainName`: CloudFront domain name
- `CloudFrontURL`: Full CloudFront URL
- `CustomDomainURL`: Custom domain URL (if configured)

## 🛡️ Security Features

- **Private S3 Bucket**: No public access, secured with OAC
- **HTTPS Only**: All traffic redirected to HTTPS
- **Origin Access Control**: Latest AWS security best practice
- **Encryption**: S3 bucket encrypted at rest
- **IAM Policies**: Least privilege access
- **Prefix Isolation**: Prevents resource conflicts in shared accounts

## 🧹 Cleanup

To destroy the stack:

```bash
PREFIX=myapp npm run destroy
```

Or using CDK directly:

```bash
cdk destroy --force
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting: `npm run lint`
6. Run tests: `npm test`
7. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Bootstrap Error**: Run `cdk bootstrap` in your target account/region
2. **Permission Denied**: Ensure your AWS credentials have sufficient permissions
3. **Bucket Name Conflict**: Use a unique `PREFIX` value
4. **Certificate Validation**: Ensure DNS validation records are created for custom domains

### Support

- Check the [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- Review [CloudFormation Events](https://console.aws.amazon.com/cloudformation/) for deployment issues
- Check [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/) for runtime issues
