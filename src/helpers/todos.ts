import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()

export async function getTodosForUser(userId): Promise<TodoItem[]> {
    return todosAccess.getUserTodos(userId)
}
export async function createTodoForUser(createTodoRequest: CreateTodoRequest, event): Promise<TodoItem> {

    //Generate new uuid for new tdo Item
    const itemId = uuid.v4()
    const userId = getUserId(event)

    const createdTodo = await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: "Not implemented"
    })

    return todosAccess.createTodo(createdTodo)
}

/**
 * 
 * createdAt": "2019-07-27T20:01:45.424Z",
 "name": "Buy milk",
 "dueDate": "2019-07-29T20:01:45.424Z",
 "done": false,
 "attachmentUrl": "http://example.com/image.png"
}


{
 "item": {
  "todoId": "123",
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Buy milk",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "done": false,
  "attachmentUrl": "http://example.com/image.png"
}
}
 */