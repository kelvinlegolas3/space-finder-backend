import { Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'
import { GenericTable } from './GenericTable'


export class SpaceStack extends Stack {

    private api = new RestApi(this, "SpaceApi");
    private spaceTable = new GenericTable(
        "SpaceTable",
        "SpaceId",
        this
    );

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        // Creates a Lambda Node.js function
        const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
            entry: (join(__dirname, "..", "services", "lambda", "listBuckets.ts")),
            handler: "handler"
        });

        // Create IAM Policy
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions("s3:ListAllMyBuckets");
        s3ListPolicy.addResources("*");

        // Passes IAM Policy to Lambda so that it can list S3 Buckets
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

        // API Gateway and Lambda Integration

        const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
        const helloLambdaResource = this.api.root.addResource("listBuckets");
    
        helloLambdaResource.addMethod("GET", helloLambdaIntegration);
    }
}