import express from 'express';
import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Kein Token bereitgestellt' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Token konnte nicht authentifiziert werden' });
    req.userId = decoded.id;
    next();
  });
};

router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = new Post({ title, content, author: req.userId });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId });
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
