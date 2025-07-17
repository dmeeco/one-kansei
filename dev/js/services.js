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