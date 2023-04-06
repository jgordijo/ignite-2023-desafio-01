import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is required' }),
        )
      }

      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'description is required' })
        )
      }

      const task = {
        id: randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
        title,
        description,
      }

      database.insert('tasks', task);

      return res.writeHead(201).end();
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select('tasks', {
        title: search,
        description: search
      });

      return res.writeHead(202).end(JSON.stringify(tasks));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title && !description) {
        return res.writeHead(400).end(JSON.stringify({ message: 'title or description is required' }))
      };

      const task = database.select('tasks', { id })[0];

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({ message: 'task not found' })
        )
      }

      const fieldsToUpdate = {
        ...(title && { title }),
        ...(description && { description }),
        updated_at: new Date(),
      };

      database.update('tasks', id, fieldsToUpdate);

      return res.writeHead(202).end(JSON.stringify());
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select('tasks', { id })[0];

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({ message: 'task not found' })
        )
      }

      database.delete('tasks', id);

      return res.writeHead(204).end(JSON.stringify());
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select('tasks', { id })[0];

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({ message: 'task not found' })
        )
      }

      const fieldsToUpdate = {
        updated_at: new Date(),
        completed_at: task.completed_at ? null : new Date(),
      }

      database.update('tasks', id, fieldsToUpdate);

      return res.writeHead(204).end(JSON.stringify());
    }
  }
]