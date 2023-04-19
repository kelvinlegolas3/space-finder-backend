import { Stack, StackProps } from 'aws-cdk-lib'
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { join } from 'path'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { GenericTable } from './GenericTable'
import { NodejsFunction  } from 'aws-cdk-lib/aws-lambda-nodejs'

export class SpaceStack extends Stack 
{
    constructor(scope: Construct, id: string, props: StackProps)
    {
        super(scope, id, props)
        
        const helloLambda = new LambdaFunction(this, "helloLambda", 
        {
            runtime: Runtime.NODEJS_16_X,
            code: Code.fromAsset(join(__dirname, '..', "services", "hello")),
            handler: "hello.main"
        })

        const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
            entry: (join(__dirname, "..", "services", "node-lambda", "hello.ts")),
            handler: "handler"
        })

        //DynamoDB Integration
        const spaceTable = new GenericTable(
            "SpaceTable",
            "SpaceId",
            this
        )

        // Hello Api Lambda Integration
        const api = new RestApi(this, "SpaceApi")
        const helloLambdaIntegration = new LambdaIntegration(helloLambda)
        const helloLambdaResource = api.root.addResource("hello")
    
        helloLambdaResource.addMethod("GET", helloLambdaIntegration)
    }
}