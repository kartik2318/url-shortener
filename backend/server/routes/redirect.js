const express = require('express');
const db = require('../db/db');

const router = express.Router();

// route: GET /:shortId  -> redirect
router.get('/:shortId', async (req, res) => {
  try {
  const { shortId } = req.params;
  const { rows } = await db.query('SELECT id,long_url FROM links WHERE short_id=$1', [shortId]);
  const link = rows[0];
  if (!link) return res.status(404).send('Not found');

  // store click
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const ua = req.get('user-agent');
  const ref = req.get('referer') || null;

  // check for recent click from same IP + User-Agent in last 1 minute
  const { rows: recentRows } = await db.query(
    `SELECT id FROM clicks
     WHERE link_id=$1 AND ip=$2 AND user_agent=$3 AND created_at > NOW() - INTERVAL '1 minute'`,
    [link.id, ip, ua]
  );

  if (recentRows.length === 0) {
    // insert click only if none found recently
    await db.query(
      'INSERT INTO clicks (link_id, ip, user_agent, referrer) VALUES ($1, $2, $3, $4)',
      [link.id, ip, ua, ref]
    );
  }
  // redirect to long url
  return res.redirect(302, link.long_url);
}catch (err) {
  console.error('Redirect error:', err);
  return res.status(500).send('Server error');
}
});

module.exports = router;