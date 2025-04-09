import express, { Request, Response, Router, NextFunction } from 'express';
import Book from '../models/book.model';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Fix: All routes should use AuthRequest type since they're protected
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { author, category, rating, title, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (author) query.author = new RegExp(String(author), 'i');
    if (category) query.category = category;
    if (rating) query.rating = { $gte: Number(rating) };
    if (title) query.title = new RegExp(String(title), 'i');

    const books = await Book.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: 'Invalid update data' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;