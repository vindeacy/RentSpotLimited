import express from 'express';
import { register, login } from '../controller/userController.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

export default router;
