(function () {
  var header = document.getElementById('header');
  var burger = header.querySelector('.header__burger');

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  }

  burger.addEventListener('click', function () {
    setOpen(!header.classList.contains('is-open'));
  });
  header.querySelectorAll('.header__nav a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
