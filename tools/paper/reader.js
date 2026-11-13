/* Fit the fixed A4 pages to the screen, and hand the notify form to the mail app. */
(function () {
  var PAGE = 794;
  function fit() {
    var w = document.documentElement.clientWidth - (window.innerWidth < 700 ? 16 : 64);
    document.documentElement.style.setProperty('--fit', Math.min(1.15, w / PAGE).toFixed(4));
  }
  fit();
  window.addEventListener('resize', fit);

  var form = document.querySelector('[data-notify]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('[name=email]').value.trim();
    var body = 'Please send me the next Torchbearer paper when it is published.\n\nEmail: ' + email;
    window.location.href = 'mailto:' + form.getAttribute('data-notify') +
      '?subject=' + encodeURIComponent('Notify me: next Torchbearer paper') +
      '&body=' + encodeURIComponent(body);
  });
})();
