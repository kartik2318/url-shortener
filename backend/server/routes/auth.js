const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const router = express.Router(); 

router.post('/register', async (req, res) => { 
  const { email, password } = req.body; 
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' }); 
  const pwHash = await bcrypt.hash(password, 10); 
  try { 
    const { rows } = await db.query
    ('INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id,email,created_at', 
      [email, pwHash]); 
      const user = rows[0]; 
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET); 
      res.json({ token, user: { id: user.id, email: user.email } }); 
    } catch (err) 
    { 
      if (err.code === '23505') 
        return res.status(400).json({ error: 'Email already exists' }); 
      console.error(err); res.status(500).json({ error: 'Server error' }); } }); 
      
      router.post('/login', async (req, res) => 
        { 
          try { 
            const { email, password } = req.body; 
            const { rows } = await db.query('SELECT id,email,password_hash FROM users WHERE email=$1', [email]); 
            const user = rows[0]; 
            if (!user) return res.status(400).json({ error: 'Invalid credentials' }); 
            const ok = await bcrypt.compare(password, user.password_hash); 
            if (!ok) return res.status(400).json({ error: 'Invalid credentials' }); 
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET); 
            res.json({ token, user: { id: user.id, email: user.email } }); 
          } catch (err) { 
            console.error(err); res.status(500).json({ error: 'Server error' }); } }); 
            
            module.exports = router;