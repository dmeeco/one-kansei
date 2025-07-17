/**
 * Services page functionality
 * Handles popover initialization and tab interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Services.js loaded successfully');
  
  // Check if Bootstrap is available
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap is not loaded!');
    return;
  }
  
  console.log('Bootstrap is available:', bootstrap);
  
  // Initialize popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  console.log('Found popover triggers:', popoverTriggerList.length);
  
  const popoverList = Array.from(popoverTriggerList).map(function(popoverTriggerEl) {
    console.log('Initializing popover for:', popoverTriggerEl.textContent);
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus',
      placement: 'top',
      customClass: 'services-custom-popover'
    });
  });

  // Initialize tabs
  const tabTriggerList = document.querySelectorAll('[data-bs-toggle="pill"]');
  console.log('Found tab triggers:', tabTriggerList.length);
  
  const tabList = Array.from(tabTriggerList).map(function(tabTriggerEl) {
    return new bootstrap.Tab(tabTriggerEl);
  });

  // Bootstrap handles tab switching automatically
  // The CSS will provide visual feedback for active states
});

// Newsletter form handler
if (document.getElementById('newsletter-form')) {
  document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const button = e.target.querySelector('button');
    const message = document.getElementById('message');
    
    button.disabled = true;
    button.textContent = 'Subscribing...';
    
    try {
      // Trigger GitHub Action via repository dispatch
      await fetch('https://api.github.com/repos/yourusername/yourrepo/dispatches', {
        method: 'POST',
        headers: {
          'Authorization': 'token YOUR_GITHUB_TOKEN',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'newsletter-signup',
          client_payload: { email, name }
        })
      });
      
      message.innerHTML = '<div class="alert alert-success">Welcome email sent! Please check your inbox.</div>';
      e.target.reset();
    } catch (error) {
      message.innerHTML = '<div class="alert alert-danger">Something went wrong. Please try again.</div>';
    } finally {
      button.disabled = false;
      button.textContent = 'Subscribe';
    }
  });
} 