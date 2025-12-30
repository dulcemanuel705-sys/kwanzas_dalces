import express from 'express';
import { supabase } from './config/supabase.js';

const app = express();
app.use(express.json());

app.get('/usuarios', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*');

  if (error) return res.status(500).json(error);

  res.json(data);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
