import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getTodosForUser } from '../../helpers/todos';
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)

    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
          todos
      })
   }
  
  }
