import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor( 
        private readonly docClient: DocumentClient = createDynamodbClient(),
        private readonly todosTable = process.env.TODOS_TABLE

    ){}

    async getTodos (): Promise<TodoItem[]> {
        console.log("Getting all todo items")

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log("Creating a new todo item")

        try{
            await this.docClient.put({
                TableName: this.todosTable,
                Item: todo
            }).promise()

            return todo
        }
        catch(e) {
            console.log("Unable to add new todo item to database", e)
        }
    }

    async updateTodo(todoUpdate: TodoUpdate ) {
        // to be implemented
    }
}

function createDynamodbClient() {
    if (process.env.IS_OFFLINE) {
        console.log("Interacting with offline version of dynamodb")
        return new AWS.DynamoDB.DocumentClient({
            region: "localhost",
            endpoint: "http://localhost:8000"
        })
    }
    return new AWS.DynamoDB.DocumentClient()
}