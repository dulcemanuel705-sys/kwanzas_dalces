const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middlewares/auth');

// Rota temporária sem verificação de role
router.get('/temp/bancos/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if(!id) return res.status(400).json({ message: 'id_invalido' });
    
    console.log('Buscando banco com ID:', id);
    const found = await db.FinancaBanco.findByPk(id);
    
    if(!found) {
      return res.status(404).json({ message: 'banco_nao_encontrado' });
    }
    
    res.json(found);
  } catch(e) { 
    console.error('Erro na rota temporária:', e);
    res.status(500).json({ 
      message: 'erro_obter_banco_financa', 
      detail: e.message 
    }); 
  }
});

module.exports = router;
