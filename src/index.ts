// src/index.ts
import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from TypeScript Express!' });
});

// Example route with parameters
app.get('/users/:id', (req: Request, res: Response) => {
  res.json({ userId: req.params.id });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});