const express = require('express');
const router = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// GET /api/users/me — own profile + articles
router.get('/me', requireAuth, async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'User not found' });

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, category, status, created_at, image_url')
    .eq('author_id', req.user.id)
    .order('created_at', { ascending: false });

  res.json({ ...user, articles: articles || [] });
});

// PUT /api/users/me — update profile (name, city)
router.put('/me', requireAuth, async (req, res) => {
  const { name, city } = req.body;

  const { data, error } = await supabase
    .from('users')
    .upsert({ id: req.user.id, name, city })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
