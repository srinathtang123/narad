const express = require('express');
const router = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// GET /api/articles?tab=foryou&city=Mumbai&category=Politics&q=search
router.get('/', async (req, res) => {
  const { tab, city, category, q } = req.query;

  let query = supabase
    .from('articles')
    .select(`
      id, title, body, category, location_text, image_url, status, created_at,
      users (id, name, city)
    `)
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(30);

  if (tab === 'mycity' && city) {
    query = query.ilike('location_text', `%${city}%`);
  }

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`*, users (id, name, city)`)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Article not found' });
  res.json(data);
});

// POST /api/articles — submit new article (authenticated)
router.post('/', requireAuth, async (req, res) => {
  const { title, body, category, location_text, image_url } = req.body;

  if (!title || !body || !category) {
    return res.status(400).json({ error: 'title, body, and category are required' });
  }

  const { data, error } = await supabase
    .from('articles')
    .insert({
      author_id: req.user.id,
      title,
      body,
      category,
      location_text,
      image_url,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/articles/:id/status — admin approve/reject
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!['live', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be live or rejected' });
  }

  const { data, error } = await supabase
    .from('articles')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
