// Auto-capture and persist authentication tokens from login endpoints
(function() {
  'use strict';

  // Add authentication indicator to UI
  function addAuthIndicator() {
    if (document.getElementById('auth-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'auth-indicator';
    indicator.textContent = '🔒 Not Authenticated';
    document.body.appendChild(indicator);
    
    updateAuthIndicator();
  }

  // Update authentication indicator status
  function updateAuthIndicator() {
    const indicator = document.getElementById('auth-indicator');
    const token = localStorage.getItem('swagger_auth_token');
    
    if (indicator) {
      if (token) {
        indicator.textContent = '🔓 Authenticated';
        indicator.classList.add('authenticated');
      } else {
        indicator.textContent = '🔒 Not Authenticated';
        indicator.classList.remove('authenticated');
      }
    }
  }

  // Override fetch to intercept login responses
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    // Clone response so we can read it without consuming it
    const clonedResponse = response.clone();
    
    // Check if this is a login endpoint
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (url && (
      url.includes('/auth/admin/login') ||
      url.includes('/auth/login') ||
      url.includes('/admin/auth/login')
    )) {
      try {
        const data = await clonedResponse.json();
        
        // Extract token from various possible response structures
        const token = data.token || data.data?.token || data.accessToken || data.data?.accessToken;
        
        if (token) {
          // Save token to localStorage
          localStorage.setItem('swagger_auth_token', token);
          console.log('✅ Authentication token captured and saved');
          
          // Auto-authorize in Swagger UI
          setTimeout(() => {
            autoAuthorize(token);
            updateAuthIndicator();
          }, 500);
        }
      } catch(e) {
        console.error('Failed to parse login response:', e);
      }
    }
    
    return response;
  };

  // Check whether Swagger UI's redux store actually marked the scheme as authorized
  function isSchemeAuthorized(schemeName) {
    try {
      const authorized = window.ui.authSelectors && window.ui.authSelectors.authorized && window.ui.authSelectors.authorized();
      return !!(authorized && typeof authorized.get === 'function' && authorized.get(schemeName));
    } catch (e) {
      return false;
    }
  }

  // Auto-authorize with token in Swagger UI
  function autoAuthorize(token) {
    // Method 1: Try to use Swagger UI's preauthorizeApiKey if available
    // NOTE: for an `http`/`bearer` security scheme, Swagger UI/swagger-client prepends
    // "Bearer " itself when building the Authorization header, so the value handed
    // here must be the raw token — passing "Bearer <token>" double-prefixes it and
    // the scheme never actually shows as authorized.
    if (window.ui && typeof window.ui.preauthorizeApiKey === 'function') {
      window.ui.preauthorizeApiKey('bearerAuth', token);

      setTimeout(() => {
        if (isSchemeAuthorized('bearerAuth')) {
          console.log('✅ Token applied via preauthorizeApiKey');
          alert('✅ Authentication token saved!\n\nYou can now access protected endpoints.\nThe token will persist across page refreshes.');
        } else {
          console.error('❌ preauthorizeApiKey did not authorize "bearerAuth" — falling back to UI interaction');
          authorizeViaUiInteraction(token);
        }
      }, 300);
      return;
    }

    authorizeViaUiInteraction(token);
  }

  // Method 2: Simulate clicking authorize button and filling in token
  function authorizeViaUiInteraction(token) {
    const authBtn = document.querySelector('.btn.authorize.unlocked');
    if (authBtn) {
      authBtn.click();

      setTimeout(() => {
        const input = document.querySelector('input[name="bearerAuth"]');
        if (input) {
          input.value = token;

          // Click authorize button in modal
          const modalAuthBtn = document.querySelector('.auth-btn-wrapper .btn.modal-btn.auth.authorize');
          if (modalAuthBtn) {
            modalAuthBtn.click();
            console.log('✅ Token applied via UI interaction');
            setTimeout(() => {
              // Close modal
              const closeBtn = document.querySelector('.close-modal');
              if (closeBtn) closeBtn.click();

              alert('✅ Authentication token saved!\n\nYou can now access protected endpoints.\nThe token will persist across page refreshes.');
            }, 300);
          }
        }
      }, 500);
    }
  }

  // Load saved token on page load
  function loadSavedToken() {
    const savedToken = localStorage.getItem('swagger_auth_token');
    
    if (savedToken) {
      console.log('📌 Loading saved authentication token...');
      
      // Wait for Swagger UI to fully load
      setTimeout(() => {
        autoAuthorize(savedToken);
      }, 2000);
    }
  }

  // Initialize everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        addAuthIndicator();
        loadSavedToken();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      addAuthIndicator();
      loadSavedToken();
    }, 1000);
  }
})();
