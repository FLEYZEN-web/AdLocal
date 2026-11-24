/**
 * SMART MERCH — Modals Script
 * File: modals.js
 * 
 * Логіка відкриття та закриття модальних вікон:
 * - Відкриття при кліку на картку товару (гребінець, відкривачка, ароматизатор)
 * - Динамічне підставлення даних: назва, фото, опис, ціна, наявність, характеристики
 * - Закриття: клік по хрестику, клік поза вікном (mousedown+mouseup на оверлеї), клавіша Escape
 * - Блокування скролу фонової сторінки без зсуву контенту (компенсація скролбару)
 * - Доступність (Accessibility / A11y, inert на .page-wrapper, повернення фокусу ДО aria-hidden="true")
 */

(function () {
  'use strict';

  // База даних товарів мерчу згідно з Figma SMART MERCH
  const PRODUCTS_DATA = {
    comb: {
      id: 'comb',
      category: 'Преміальні аксесуари',
      title: 'Сталевий гребінець із лазерним QR',
      price: '850 ₴',
      isAvailable: true,
      stockText: 'В наявності (24 шт.)',
      badgeClass: 'product-badge--in-stock',
      imageSrc: 'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Сталевий кишеньковий гребінець із лазерним QR',
      description: 'Прецизійно оброблений кишеньковий гребінець із матової нержавіючої сталі 316L. Короткі закруглені зубці забезпечують м’яке розчісування без пошкодження волосся. На руків’ї вигравірувано стійкий лазерний QR-код для миттєвого шерингу цифрової візитки, портфоліо або контактів бренду.',
      specs: [
        'Сталь 316L',
        'Лазерне QR-гравіювання',
        'Розмір: 110 × 30 × 2 мм',
        'Вага: 45 г',
        'Чохол у комплекті'
      ]
    },

    opener: {
      id: 'opener',
      category: 'Smart Tech Мерч',
      title: 'NFC-брелок відкривачка зі сталі',
      price: '620 ₴',
      isAvailable: true,
      stockText: 'В наявності (18 шт.)',
      badgeClass: 'product-badge--in-stock',
      imageSrc: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'NFC-брелок відкривачка з матової сталі',
      description: 'Флагманський продукт серії SMART MERCH. Компактна плоска відкривачка із масивної шліфованої сталі зі стійким кільцем для ключів. Оснащена високочутливим захищеним NFC-чіпом NTAG213 із фірмовою салатовою міткою. При піднесенні до будь-якого сучасного смартфона миттєво відкриває налаштоване посилання.',
      specs: [
        'Шліфована сталь',
        'NFC чіп NTAG213 (144 bytes)',
        'Сумісність з iOS та Android',
        'Не потребує підзарядки',
        'Посилене сталеве кільце'
      ]
    },

    freshener: {
      id: 'freshener',
      category: 'Автомобільна колекція',
      title: 'Мінімалістичний ароматизатор',
      price: '390 ₴',
      isAvailable: false, // обмежена серія
      stockText: 'Обмежена серія (тільки 5 шт.)',
      badgeClass: 'product-badge--limited',
      imageSrc: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Мінімалістичний автомобільний ароматизатор',
      description: 'Підвісний автомобільний дифузор глибокого графітового кольору з пресованої органічної повсті. Створений для шанувальників стриманого преміального стилю. На лицьовій стороні нанесено геометричний фірмовий знак бренду та QR-код для переходу до ексклюзивного музичного плейлиста бренду.',
      specs: [
        'Пресована графітова повсть',
        'Аромат: Black Cedar & Bergamot',
        'Тривалість дії: до 45 днів',
        'Еластичний підвіс на дзеркало',
        'Екологічні компоненти'
      ]
    }
  };

  // DOM Елементи
  const pageWrapper = document.querySelector('.page-wrapper');
  const modalOverlay = document.getElementById('productModal');
  const modalWindow = document.getElementById('modalWindow');
  const closeBtn = document.getElementById('modalCloseBtn');
  const actionCloseBtn = document.getElementById('modalActionCloseBtn');
  const orderBtn = document.getElementById('modalOrderBtn');
  const orderSuccessBlock = document.getElementById('modalOrderSuccess');

  // Елементи наповнення модального вікна
  const modalRubric = document.getElementById('modalRubric');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalStock = document.getElementById('modalStock');
  const modalDescription = document.getElementById('modalDescription');
  const modalTags = document.getElementById('modalTags');
  const modalMedia = document.getElementById('modalMedia');
  const modalMediaBadge = document.getElementById('modalMediaBadge');

  // Збереження елемента, з якого було відкрито модаль (для повернення фокусу)
  let previousActiveElement = null;

  // Захист від випадкового закриття: відстежуємо початок кліку (mousedown)
  let isMouseDownOnBackdrop = false;

  /**
   * Обчислює ширину системного скролбару, щоб сторінка не стрибала
   * при додаванні overflow: hidden до body
   */
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  /**
   * Заповнює поля модального вікна даними конкретного товару
   * @param {Object} product - об'єкт товару з PRODUCTS_DATA
   */
  function populateModal(product) {
    if (!product) return;

    modalRubric.textContent = product.category;
    modalTitle.textContent = product.title;
    modalPrice.textContent = product.price;
    modalDescription.textContent = product.description;

    // Скидаємо стан блоку успіху після попереднього замовлення
    if (orderSuccessBlock) {
      orderSuccessBlock.hidden = true;
      orderSuccessBlock.style.display = 'none';
    }
    if (orderBtn) {
      orderBtn.style.display = '';
      orderBtn.textContent = 'Замовити концепт →';
      orderBtn.disabled = false;
    }

    // Статус наявності в блоці ціни
    modalStock.textContent = product.stockText;
    modalStock.className = 'modal-stock-status ' + 
      (product.isAvailable ? 'modal-stock-status--available' : 'modal-stock-status--limited');

    // Бейдж на фотографії
    modalMediaBadge.textContent = product.stockText;
    modalMediaBadge.className = 'product-badge ' + product.badgeClass;

    // Рендер реального фото товару
    const artworkContainer = modalMedia.querySelector('.modal-media__artwork-box');
    if (artworkContainer) {
      artworkContainer.innerHTML = `<img class="modal-media__img" src="${product.imageSrc}" alt="${product.imageAlt}">`;
    }

    // Рендер чіпів характеристик
    modalTags.innerHTML = '';
    product.specs.forEach(function (specText) {
      const tag = document.createElement('span');
      tag.className = 'modal-tag';
      tag.textContent = specText;
      modalTags.appendChild(tag);
    });

    if (orderBtn) {
      orderBtn.setAttribute('data-current-product', product.id);
    }
  }

  /**
   * Відкриває модальне вікно
   * @param {string} productId - ID товару ('comb', 'opener', 'freshener')
   */
  function openModal(productId) {
    const product = PRODUCTS_DATA[productId];
    if (!product) {
      console.warn('Товар не знайдено за id:', productId);
      return;
    }

    // 1. Запам'ятовуємо елемент для повернення фокусу
    previousActiveElement = document.activeElement;

    // 2. Наповнюємо даними
    populateModal(product);

    // 3. Блокуємо скрол фонової сторінки з компенсацією скролбару
    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add('modal-open');

    // 4. Пастка фокусу: ставимо inert на .page-wrapper (фонова сторінка стає недоступною для Tab)
    if (pageWrapper) {
      pageWrapper.inert = true;
      pageWrapper.setAttribute('inert', '');
      pageWrapper.setAttribute('aria-hidden', 'true');
    }

    // 5. Показуємо модальне вікно
    modalOverlay.classList.add('is-active');
    modalOverlay.setAttribute('aria-hidden', 'false');

    // 6. Переводимо фокус на кнопку закриття
    requestAnimationFrame(function () {
      if (closeBtn) closeBtn.focus();
    });
  }

  /**
   * Закриває модальне вікно та повертає скрол сторінки
   * ВАЖЛИВО: повернення фокусу відбувається ДО встановлення aria-hidden="true",
   * щоб Chrome не видавав попередження про фокус на схованому елементі.
   */
  function closeModal() {
    if (!modalOverlay.classList.contains('is-active')) return;

    // 1. Знімаємо inert з фонової сторінки
    if (pageWrapper) {
      pageWrapper.inert = false;
      pageWrapper.removeAttribute('inert');
      pageWrapper.removeAttribute('aria-hidden');
    }

    // 2. Спочатку повертаємо фокус назад на картку ДО приховування модалки
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }

    // 3. Тепер безпечно ховаємо модаль і ставимо aria-hidden="true"
    modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.classList.remove('is-active');

    // 4. Відновлюємо скрол сторінки
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
  }

  // ==========================================================================
  // Прив'язка подій (Event Listeners)
  // ==========================================================================

  // 1. Відкриття при кліку на картку товару
  const productCards = document.querySelectorAll('[data-product-id]');
  productCards.forEach(function (card) {
    card.addEventListener('click', function () {
      const productId = this.getAttribute('data-product-id');
      if (productId) {
        openModal(productId);
      }
    });

    // Підтримка відкриття за допомогою Enter або Пробілу з клавіатури
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const productId = this.getAttribute('data-product-id');
        if (productId) {
          openModal(productId);
        }
      }
    });
  });

  // 2. Закриття при кліку на хрестик
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });
  }

  // Закриття на другорядну кнопку "Закрити"
  if (actionCloseBtn) {
    actionCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });
  }

  // 3. Захищене закриття при кліку на оверлей (mousedown + mouseup):
  // Закривається тільки якщо клік і почався, і закінчився на темному фоні.
  // Це запобігає закриттю, коли користувач виділяє текст у вікні й відпускає мишу на фоні!
  if (modalOverlay) {
    modalOverlay.addEventListener('mousedown', function (event) {
      isMouseDownOnBackdrop = (event.target === modalOverlay);
    });

    modalOverlay.addEventListener('mouseup', function (event) {
      if (isMouseDownOnBackdrop && event.target === modalOverlay) {
        closeModal();
      }
      isMouseDownOnBackdrop = false;
    });
  }

  // Захист від спливання подій кліку всередині модального вікна
  if (modalWindow) {
    modalWindow.addEventListener('mousedown', function (event) {
      event.stopPropagation();
    });
    modalWindow.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  }

  // 4. Закриття при натисканні на клавішу Escape та зациклення фокусу (Focus Trap Loop)
  document.addEventListener('keydown', function (event) {
    if (!modalOverlay || !modalOverlay.classList.contains('is-active')) return;

    // Закриття на Escape
    if (event.key === 'Escape' || event.key === 'Esc') {
      closeModal();
      return;
    }

    // Зациклення Tab / Shift + Tab всередині модалки
    if (event.key === 'Tab') {
      // Знаходимо всі інтерактивні елементи всередині вікна, які наразі видимі та активні
      const focusableSelectors = 'button:not([disabled]):not([style*="display: none"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(modalWindow.querySelectorAll(focusableSelectors))
        .filter(el => el.offsetParent !== null); // тільки фактично видимі елементи

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Якщо затиснуто Shift + Tab і ми на першому елементі — переходимо на останній
      if (event.shiftKey) {
        if (document.activeElement === firstElement || !modalWindow.contains(document.activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } 
      // Якщо звичайний Tab: якщо ми на останньому елементі АБО фокус опинився поза модалкою — переходимо на перший
      else {
        if (document.activeElement === lastElement || !modalWindow.contains(document.activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  // 5. Клік на «Замовити концепт →»: замість блокуючого alert() показуємо блок «Наступний крок» як у Figma
  if (orderBtn) {
    orderBtn.addEventListener('click', function () {
      if (orderSuccessBlock) {
        orderBtn.style.display = 'none';
        orderSuccessBlock.hidden = false;
        orderSuccessBlock.style.display = 'block';

        // Переводимо фокус на кнопку закриття, щоб фокус не губився після приховування кнопки замовлення
        if (actionCloseBtn) {
          actionCloseBtn.focus();
        } else if (closeBtn) {
          closeBtn.focus();
        }
      }
    });
  }

  // Експорт у глобальну область для тестування
  window.SmartMerchModal = {
    open: openModal,
    close: closeModal,
    data: PRODUCTS_DATA
  };

})();
