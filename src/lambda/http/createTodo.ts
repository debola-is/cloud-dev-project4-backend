import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {TodoItem} from '../../models/TodoItem'
import { getUserId } from '../utils';
import { createTodoForUser } from '../../helpers/todos'

export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log ("Processing Event: ", event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    
    // TODO: Implement creating a new TODO item
    const newItem = await createTodoForUser(newTodo, event)
   try {
    return {
      statusCode: 201,
      headers: {
          "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
          newItem
      })
    }
   }
   catch(e) {
    return {
      statusCode: 400,
      headers: {
          "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify("Could not create this todo")
    }
  }

    
}