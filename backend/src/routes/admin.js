const express = require('express');
const router = express.Router();
const { requireAuth, supabase } = require('../middleware/auth');

// Simple admin guard — checks if user email is in ADMIN_EMAILS env var
function requireAdmin(req, res, next) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Not an admin' });
  }
  next();
}

// GET /api/admin/articles?status=pending
router.get('/articles', requireAuth, requireAdmin, async (req, res) => {
  const { status = 'pending' } = req.query;

  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, body, category, location_text, image_url, status, created_at,
      users (id, name, city, phone)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/admin/articles/:id — approve or reject
router.patch('/articles/:id', requireAuth, requireAdmin, async (req, res) => {
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
