// Profile Avatar Loader
// Carrega o avatar do usuário no header a partir da API /me ou localStorage

(async function() {
  'use strict';

  // Função para atualizar avatar no header
  function updateAvatarInHeader(avatarUrl) {
    if (!avatarUrl) return;
    
    // Avatar no header (ícone superior)
    const headerAvatar = document.querySelector('.user-img img');
    if (headerAvatar) headerAvatar.src = avatarUrl;
    
    // Avatar no dropdown
    const dropdownAvatar = document.querySelector('.avatar.avatar-sm img');
    if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
  }

  // Tenta carregar da API primeiro
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Se não tem token, tenta do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const avatarUrl = user?.avatarUrl || user?.avatar || '';
        updateAvatarInHeader(avatarUrl);
      }
      return;
    }

    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const me = await response.json();
      const avatarUrl = me?.avatarUrl || me?.avatar || '';
      updateAvatarInHeader(avatarUrl);
      
      // Atualiza localStorage com dados mais recentes
      localStorage.setItem('user', JSON.stringify(me));
    } else {
      // Se falhar API, tenta do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const avatarUrl = user?.avatarUrl || user?.avatar || '';
        updateAvatarInHeader(avatarUrl);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar avatar:', error);
    
    // Fallback: tenta do localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const avatarUrl = user?.avatarUrl || user?.avatar || '';
        updateAvatarInHeader(avatarUrl);
      }
    } catch (e) {
      console.error('Erro ao parsear localStorage:', e);
    }
  }
})();
