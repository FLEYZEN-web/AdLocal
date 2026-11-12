(function () {
  'use strict';

  var STEPS = [
    {
      id: 'business',
      title: 'Який у вас бізнес?',
      hint: 'Ніша та ваша аудиторія',
      options: [
        { value: 'barber', label: 'Барбершоп або салон' },
        { value: 'cafe', label: 'Кафе, бар або магазин' },
        { value: 'auto', label: 'Автобізнес або сервіс' },
        { value: 'other', label: 'Інше' }
      ]
    },
    {
      id: 'goal',
      title: 'Яка ваша ціль?',
      hint: 'Нові клієнти, повторні покупки чи впізнаваність',
      options: [
        { value: 'new', label: 'Нові клієнти' },
        { value: 'repeat', label: 'Повторні покупки' },
        { value: 'awareness', label: 'Впізнаваність бренду' }
      ]
    },
    {
      id: 'budget',
      title: 'Який бюджет розглядаєте?',
      hint: 'Знайдемо доречний формат і комплектацію',
      options: [
        { value: 'low', label: 'Невеликий (пілотна партія)' },
        { value: 'mid', label: 'Середній' },
        { value: 'high', label: 'Великий (масштабна кампанія)' },
        { value: 'unknown', label: 'Ще не визначився' }
      ]
    }
  ];

  var RECOMMENDATIONS = {
    barber: {
      title: 'Металевий гребінець',
      text: 'Компактний аксесуар на щодень. Гравіювання та QR-код ведуть до запису або спеціальної пропозиції.'
    },
    cafe: {
      title: 'Брелок-відкривачка',
      text: 'Корисна річ завжди під рукою. NFC-мітка або QR-код відкривають пропозицію бренду одним рухом.'
    },
    auto: {
      title: 'Автомобільний ароматизатор',
      text: 'Ваш бренд у кожній поїздці. QR-код нагадує про сервіс і спрощує повторний запис.'
    },
    other: {
      title: 'Індивідуальний формат',
      text: 'Підберемо річ і сценарій під вашу нішу. Залиште заявку — запропонуємо концепт.'
    }
  };

  var root = document.getElementById('quiz');
  if (!root) return;

  var $ = function (sel) { return root.querySelector(sel); };
  var preview = $('[data-quiz-preview]');
  var flow = $('[data-quiz-flow]');
  var result = $('[data-quiz-result]');
  var bar = $('[data-quiz-bar]');
  var stepEl = $('[data-quiz-step]');
  var questionEl = $('[data-quiz-question]');
  var hintEl = $('[data-quiz-hint]');
  var optionsEl = $('[data-quiz-options]');
  var backBtn = $('[data-quiz-back]');
  var resultTitle = $('[data-quiz-result-title]');
  var resultText = $('[data-quiz-result-text]');
  var restartBtn = $('[data-quiz-restart]');

  var current = 0;
  var answers = {};

  function show(which) {
    preview.hidden = which !== 'preview';
    flow.hidden = which !== 'flow';
    result.hidden = which !== 'result';
  }

  function renderStep() {
    var step = STEPS[current];
    stepEl.textContent = 'Крок ' + (current + 1) + ' з ' + STEPS.length;
    questionEl.textContent = step.title;
    hintEl.textContent = step.hint;
    bar.style.width = (current / STEPS.length) * 100 + '%';
    optionsEl.textContent = '';

    step.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz__option';
      btn.textContent = opt.label;
      btn.setAttribute('aria-pressed', String(answers[step.id] === opt.value));
      btn.addEventListener('click', function () { choose(step.id, opt.value); });
      optionsEl.appendChild(btn);
    });

    questionEl.focus({ preventScroll: true });
  }

  function start(index) {
    current = index || 0;
    show('flow');
    renderStep();
  }

  function choose(id, value) {
    answers[id] = value;
    if (current < STEPS.length - 1) {
      current += 1;
      renderStep();
    } else {
      finish();
    }
  }

  function finish() {
    var rec = RECOMMENDATIONS[answers.business] || RECOMMENDATIONS.other;
    resultTitle.textContent = rec.title;
    resultText.textContent = rec.text;
    bar.style.width = '100%';
    show('result');
    resultTitle.focus({ preventScroll: true });

    var detail = { answers: answers, recommendation: rec.title };
    try {
      sessionStorage.setItem('smartmerch_quiz', JSON.stringify(detail));
    } catch (e) {}

    document.dispatchEvent(new CustomEvent('smartmerch:quiz-complete', { detail: detail }));
  }

  function restart() {
    answers = {};
    current = 0;
    show('preview');
  }

  root.querySelectorAll('[data-quiz-start]').forEach(function (el) {
    el.addEventListener('click', function () {
      var idx = parseInt(el.getAttribute('data-quiz-start'), 10);
      start(isNaN(idx) ? 0 : idx);
    });
  });

  backBtn.addEventListener('click', function () {
    if (current > 0) {
      current -= 1;
      renderStep();
    } else {
      show('preview');
    }
  });

  restartBtn.addEventListener('click', restart);
})();
