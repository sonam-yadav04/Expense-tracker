import express from 'express';
import {auth} from  '../middleware/auth.js';
import {login , signup, profile, updateProfile, changePassword} from '../controller/authUser.js';
const router = express.Router();
router.post('/register', signup);
router.post('/login',login)
router.get('/me', auth, profile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

export default router;