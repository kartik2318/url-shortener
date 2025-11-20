const express = require('express');
const db = require('../db/db');

const router = express.Router();

// route: GET /r/:shortId  -> redirect
router.get('/r/:shortId', async (req, res) => {
  const { shortId } = req.params;
  const { rows } = await db.query('SELECT id,long_url FROM links WHERE short_id=$1', [shortId]);
  const link = rows[0];
  if (!link) return res.status(404).send('Not found');

  // store click
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const ua = req.get('user-agent');
  const ref = req.get('referer') || null;
  await db.query('INSERT INTO clicks (link_id, ip, user_agent, referrer) VALUES ($1,$2,$3,$4)', [link.id, ip, ua, ref]);

  // redirect to long url
  return res.redirect(302, link.long_url);
});

module.exports = router;