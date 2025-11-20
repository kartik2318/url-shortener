const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db/db');
const auth = require('../middleware/auth');

const router = express.Router();

const SHORT_LEN = Number(process.env.SHORT_ID_LENGTH || 6);

// Create a new shortened link
router.post('/', auth, async (req, res) => {
  const { long_url, title } = req.body;
  if (!long_url) return res.status(400).json({ error: 'long_url required' });
  // generate unique short id (simple loop)
  let shortId;
  for (let i = 0; i < 5; i++) {
    shortId = nanoid(SHORT_LEN);
    const { rowCount } = await db.query('SELECT 1 FROM links WHERE short_id=$1', [shortId]);
    if (!rowCount) break;
    shortId = null;
  }
  if (!shortId) return res.status(500).json({ error: 'Could not generate short id' });
  const { rows } = await db.query(
    'INSERT INTO links (user_id,long_url,short_id,title) VALUES ($1,$2,$3,$4) RETURNING id,long_url,short_id,title,created_at',
    [req.user.id, long_url, shortId, title || null]
  );
  res.json(rows[0]);
});

// List user's links
router.get('/', auth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id,long_url,short_id,title,created_at FROM links WHERE user_id=$1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

// Delete link
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM links WHERE id=$1 AND user_id=$2', [id, req.user.id]);
  res.json({ success: true });
});

// Get link stats (counts + recent clicks)
router.get('/:id/stats', auth, async (req, res) => {
  const { id } = req.params;
  // ensure ownership
  const { rows: linkRows } = await db.query('SELECT id,short_id,long_url FROM links WHERE id=$1 AND user_id=$2', [id, req.user.id]);
  const link = linkRows[0];
  if (!link) return res.status(404).json({ error: 'Not found' });

  const { rows: countRows } = await db.query('SELECT COUNT(*)::int as total FROM clicks WHERE link_id=$1', [id]);
  const { rows: recent } = await db.query(
    'SELECT clicked_at, ip, user_agent, referrer FROM clicks WHERE link_id=$1 ORDER BY clicked_at DESC LIMIT 50',
    [id]
  );
  res.json({ link, totalClicks: countRows[0].total, recent });
});

module.exports = router;
