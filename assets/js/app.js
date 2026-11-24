/* 灶间 ZAOJIAN — menu, basket and reservation interactions */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ data */

  var MENU = [
    {
      id: "beef-ribs",
      name: "炭火牛肋排",
      price: 88,
      category: "signature",
      tag: "招牌",
      image: "assets/images/beef-ribs.jpg",
      alt: "炭火烤牛肋排，配烤番茄与酸黄瓜",
      desc: "果木炭火慢烤，外皮焦香、内里软嫩，佐现磨黑椒汁。每日限量。"
    },
    {
      id: "dumplings",
      name: "红油抄手",
      price: 28,
      category: "starter",
      tag: "前菜",
      image: "assets/images/dumplings.jpg",
      alt: "竹笼里冒着热气的手工抄手",
      desc: "每天现包，皮薄馅足。红油香而不燥，配一勺香醋刚刚好。"
    },
    {
      id: "tofu-salad",
      name: "香煎豆腐暖沙拉",
      price: 32,
      category: "starter",
      tag: "前菜",
      image: "assets/images/tofu-salad.jpg",
      alt: "香煎豆腐配时蔬、溏心蛋与玉米",
      desc: "焦香嫩豆腐、时令鲜蔬与溏心蛋，淋上芝麻和风汁，清爽开胃。"
    },
    {
      id: "noodles",
      name: "镬气手工炒面",
      price: 38,
      category: "main",
      tag: "主食",
      image: "assets/images/noodles.jpg",
      alt: "木盘盛装的手工炒面，配香菜与胡萝卜丝",
      desc: "现拉细面大火快炒，锅气十足，蔬菜爽脆，是厨房里最热闹的一道。"
    },
    {
      id: "seafood-rice",
      name: "鲜虾海鲜炒饭",
      price: 48,
      category: "main",
      tag: "主食",
      image: "assets/images/seafood-rice.jpg",
      alt: "鲜虾海鲜炒饭，配柠檬与香菜",
      desc: "大虾、鱿鱼与隔夜香米同炒，柠檬提鲜，粒粒分明不油腻。"
    },
    {
      id: "ramen",
      name: "鲜虾豚骨拉面",
      price: 46,
      category: "signature",
      tag: "招牌",
      image: "assets/images/ramen.jpg",
      alt: "鲜虾豚骨拉面，配溏心蛋与甜豆",
      desc: "十二小时慢熬豚骨高汤，鲜虾、溏心蛋与手作细面，一碗下肚很踏实。"
    },
    {
      id: "brownie",
      name: "焦糖布朗尼",
      price: 26,
      category: "sweet",
      tag: "甜品",
      image: "assets/images/brownie.jpg",
      alt: "热布朗尼配香草冰淇淋与焦糖酱",
      desc: "微苦巧克力与海盐焦糖，配一球香草冰淇淋，适合两个人分。"
    },
    {
      id: "latte",
      name: "桂花拿铁",
      price: 24,
      category: "sweet",
      tag: "饮品",
      image: "assets/images/latte.jpg",
      alt: "一杯桂花拿铁，旁边放着饼干",
      desc: "现磨咖啡与桂花蜜，奶泡绵密，尾调有淡淡花香。冷热皆可。"
    }
  ];

  var MENU_BY_ID = {};
  MENU.forEach(function (item) {
    MENU_BY_ID[item.id] = item;
  });

  var CART_KEY = "zaojian-basket-v1";
  var MAX_QTY = 20;
  var cart = loadCart();

  /* -------------------------------------------------------------- elements */

  var menuGrid = document.getElementById("menu-grid");
  var cartToggle = document.getElementById("cart-toggle");
  var cartBadge = document.getElementById("cart-badge");
  var cartDrawer = document.getElementById("cart-drawer");
  var cartClose = document.getElementById("cart-close");
  var cartBody = document.getElementById("cart-body");
  var cartTotalEl = document.getElementById("cart-total");
  var cartCountLabel = document.getElementById("cart-count-label");
  var checkoutBtn = document.getElementById("checkout-btn");
  var backdrop = document.getElementById("drawer-backdrop");
  var toast = document.getElementById("toast");
  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  var reserveForm = document.getElementById("reserve-form");
  var reserveTime = document.getElementById("reserve-time");
  var reserveWrap = document.getElementById("reserve-form-wrap");
  var reserveSuccess = document.getElementById("reserve-success");
  var reserveSummary = document.getElementById("reserve-summary");
  var reserveAgain = document.getElementById("reserve-again");
  var formError = document.getElementById("form-error");

  var toastTimer = null;
  var lastFocused = null;
  var cartCloseTimer = null;
  var cartFocusTimer = null;

  /* ------------------------------------------------------------ menu render */

  function dishMarkup(item) {
    var signature = item.category === "signature" ? " is-signature" : "";
    return (
      '<div class="dish-media">' +
        '<img src="' + item.image + '" alt="' + item.alt + '" width="800" height="600" loading="lazy">' +
        '<span class="dish-tag' + signature + '">' + item.tag + "</span>" +
        '<button class="dish-add" type="button" data-add="' + item.id + '" aria-label="将' + item.name + '加入餐篮">' +
          '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="dish-body">' +
        '<div class="dish-title"><h3>' + item.name + "</h3><span class=\"dish-price\">¥" + item.price + "</span></div>" +
        '<p class="dish-desc">' + item.desc + "</p>" +
      "</div>"
    );
  }

  function renderMenu(filter, animate) {
    var items = filter === "all" ? MENU : MENU.filter(function (item) {
      return item.category === filter;
    });

    menuGrid.innerHTML = "";

    items.forEach(function (item, index) {
      var card = document.createElement("article");
      card.className = "dish-card" + (animate ? " reveal" : " is-visible");
      card.dataset.category = item.category;
      if (animate) {
        card.style.transitionDelay = (index % 4) * 55 + "ms";
      }
      card.innerHTML = dishMarkup(item);
      menuGrid.appendChild(card);
      if (animate) {
        observeReveals(card);
      }
    });
  }

  /* --------------------------------------------------------------- cart state */

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var clean = {};
      Object.keys(parsed).forEach(function (id) {
        var qty = parseInt(parsed[id], 10);
        if (MENU_BY_ID[id] && qty > 0) {
          clean[id] = Math.min(qty, MAX_QTY);
        }
      });
      return clean;
    } catch (error) {
      return {};
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      /* storage may be unavailable; the basket still works for this visit */
    }
  }

  function cartIds() {
    return Object.keys(cart).filter(function (id) {
      return MENU_BY_ID[id] && cart[id] > 0;
    });
  }

  function cartCount() {
    return cartIds().reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function cartTotal() {
    return cartIds().reduce(function (sum, id) {
      return sum + MENU_BY_ID[id].price * cart[id];
    }, 0);
  }

  function money(value) {
    return "¥" + value;
  }

  function cartItemMarkup(id) {
    var item = MENU_BY_ID[id];
    var qty = cart[id];
    return (
      '<div class="cart-item" data-id="' + id + '">' +
        '<img src="' + item.image + '" alt="" width="64" height="64" loading="lazy">' +
        '<div class="cart-item-main">' +
          "<h3>" + item.name + "</h3>" +
          '<p class="cart-unit">' + money(item.price) + " / 份</p>" +
          '<div class="qty">' +
            '<button type="button" data-qty="-1" data-id="' + id + '" aria-label="减少一份' + item.name + '">−</button>' +
            "<span>" + qty + "</span>" +
            '<button type="button" data-qty="1" data-id="' + id + '" aria-label="增加一份' + item.name + '">+</button>' +
          "</div>" +
        "</div>" +
        '<div class="cart-item-side">' +
          '<span class="cart-line-total">' + money(item.price * qty) + "</span>" +
          '<button type="button" class="cart-remove" data-remove="' + id + '" aria-label="移除' + item.name + '">移除</button>' +
        "</div>" +
      "</div>"
    );
  }

  function emptyCartMarkup() {
    return (
      '<div class="cart-empty">' +
        '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
          '<path d="M18 24h28l-3 27H21l-3-27Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M26 24v-4a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
          '<path d="M27 35c2.5 2.4 7.5 2.4 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        "</svg>" +
        "<h3>餐篮还是空的</h3>" +
        "<p>挑几道喜欢的，热乎的马上就好。</p>" +
        '<button class="btn btn-outline" type="button" data-browse>去看看菜单</button>' +
      "</div>"
    );
  }

  function updateCartUI() {
    var ids = cartIds();
    var count = cartCount();
    var total = cartTotal();

    cartBadge.textContent = count;
    cartBadge.hidden = count === 0;
    cartCountLabel.textContent = count;
    cartTotalEl.textContent = money(total);
    checkoutBtn.disabled = count === 0;
    cartToggle.setAttribute("aria-label", "打开餐篮，当前 " + count + " 件");

    if (ids.length === 0) {
      cartBody.innerHTML = emptyCartMarkup();
      return;
    }

    cartBody.innerHTML = ids.map(cartItemMarkup).join("");
  }

  function bumpBadge() {
    cartBadge.classList.remove("bump");
    void cartBadge.offsetWidth;
    cartBadge.classList.add("bump");
  }

  function addToCart(id) {
    if (!MENU_BY_ID[id]) return;
    if ((cart[id] || 0) >= MAX_QTY) {
      showToast("这道菜最多一次点 " + MAX_QTY + " 份，需要更多请直接联系门店。");
      return;
    }
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    updateCartUI();
    bumpBadge();
    showToast("已加入餐篮 · " + MENU_BY_ID[id].name, "查看餐篮", openCart);
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    var next = cart[id] + delta;
    if (next <= 0) {
      delete cart[id];
    } else {
      cart[id] = Math.min(next, MAX_QTY);
    }
    saveCart();
    updateCartUI();
    if (next > 0) {
      var nextButton = cartBody.querySelector('[data-qty="' + delta + '"][data-id="' + id + '"]');
      if (nextButton) nextButton.focus({ preventScroll: true });
    } else {
      cartClose.focus({ preventScroll: true });
    }
  }

  function removeItem(id) {
    if (!cart[id]) return;
    delete cart[id];
    saveCart();
    updateCartUI();
    showToast("已从餐篮移除 · " + MENU_BY_ID[id].name);
  }

  /* ---------------------------------------------------------------- drawer */

  function openCart() {
    if (!cartDrawer || cartDrawer.classList.contains("is-open")) return;
    hideToast();
    closeNav();
    var active = document.activeElement;
    lastFocused = active && active !== document.body && !toast.contains(active) ? active : cartToggle;
    window.clearTimeout(cartCloseTimer);
    backdrop.hidden = false;
    backdrop.classList.add("is-open");
    cartDrawer.classList.add("is-open");
    cartDrawer.inert = false;
    cartDrawer.setAttribute("aria-hidden", "false");
    cartToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open");
    window.clearTimeout(cartFocusTimer);
    cartFocusTimer = window.setTimeout(function () {
      cartClose.focus({ preventScroll: true });
    }, 60);
  }

  function closeCart(returnFocus) {
    if (!cartDrawer.classList.contains("is-open")) return;
    window.clearTimeout(cartFocusTimer);
    cartDrawer.classList.remove("is-open");
    cartDrawer.inert = true;
    cartDrawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    cartToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    cartCloseTimer = window.setTimeout(function () {
      if (!cartDrawer.classList.contains("is-open")) {
        backdrop.hidden = true;
      }
    }, 540);
    if (returnFocus !== false && lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !cartDrawer.classList.contains("is-open")) return;
    var focusables = cartDrawer.querySelectorAll(
      'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ----------------------------------------------------------------- toast */

  function showToast(message, actionLabel, action) {
    window.clearTimeout(toastTimer);
    toast.innerHTML = "";

    var text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

    if (actionLabel && typeof action === "function") {
      var actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.textContent = actionLabel;
      actionButton.addEventListener("click", function () {
        hideToast();
        action();
      });
      toast.appendChild(actionButton);
    }

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    toastTimer = window.setTimeout(hideToast, 3200);
  }

  function hideToast() {
    toast.classList.remove("is-visible");
  }

  /* ----------------------------------------------------------- reservations */

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function toISODate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function fillTimeOptions() {
    if (!reserveTime) return;
    var slots = [];
    var minutes;
    for (minutes = 11 * 60; minutes <= 14 * 60; minutes += 30) slots.push(minutes);
    for (minutes = 17 * 60; minutes <= 21 * 60; minutes += 30) slots.push(minutes);

    reserveTime.innerHTML = slots.map(function (value) {
      var time = pad(Math.floor(value / 60)) + ":" + pad(value % 60);
      return '<option value="' + time + '"' + (time === "18:30" ? " selected" : "") + ">" + time + "</option>";
    }).join("");
  }

  function setDateDefaults() {
    var dateInput = reserveForm && reserveForm.elements.date;
    if (!dateInput) return;
    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    dateInput.min = toISODate(today);
    if (!dateInput.value) dateInput.value = toISODate(tomorrow);
  }

  function clearFieldError(field) {
    field.removeAttribute("aria-invalid");
  }

  function clearFormError() {
    if (!formError) return;
    formError.hidden = true;
    formError.textContent = "";
  }

  function showFormError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.hidden = false;
  }

  function validateReservation(data) {
    var fields = reserveForm.elements;
    var invalid = null;

    ["name", "phone"].forEach(function (name) {
      fields[name].removeAttribute("aria-invalid");
    });
    fields.date.removeAttribute("aria-invalid");

    if (!data.name.trim()) {
      invalid = { field: fields.name, message: "请填写您的称呼，方便我们为您留座。" };
    } else if (!/^1[3-9]\d{9}$/.test(data.phone.trim())) {
      invalid = { field: fields.phone, message: "请填写 11 位有效手机号，方便我们回电确认。" };
    } else if (!data.date) {
      invalid = { field: fields.date, message: "请选择到店日期。" };
    } else if (data.date < toISODate(new Date())) {
      invalid = { field: fields.date, message: "日期不能早于今天，请重新选择。" };
    } else if (!data.time) {
      invalid = { field: fields.time, message: "请选择到店时间。" };
    }

    if (!invalid) return true;

    invalid.field.setAttribute("aria-invalid", "true");
    showFormError(invalid.message);
    invalid.field.focus();
    return false;
  }

  function handleReservation(event) {
    event.preventDefault();
    if (!reserveForm) return;
    clearFormError();

    var data = {
      name: reserveForm.elements.name.value,
      phone: reserveForm.elements.phone.value,
      date: reserveForm.elements.date.value,
      time: reserveForm.elements.time.value,
      guests: reserveForm.elements.guests.value,
      note: reserveForm.elements.note.value.trim()
    };

    if (!validateReservation(data)) return;

    var date = new Date(data.date + "T12:00:00");
    var weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var readable =
      data.date.slice(5, 7).replace(/^0/, "") + " 月 " +
      data.date.slice(8, 10).replace(/^0/, "") + " 日 · " +
      weekdays[date.getDay()] + " · " + data.time;

    reserveSummary.textContent =
      data.name.trim() + "，已为您登记 " + data.guests + "，" + readable +
      "。我们会致电 " + data.phone.trim() + " 确认。" +
      (data.note ? "备注：" + data.note : "");

    reserveWrap.hidden = true;
    reserveSuccess.hidden = false;
    reserveAgain.focus({ preventScroll: true });
    reserveSuccess.scrollIntoView({ block: "nearest", behavior: "smooth" });
    showToast("预订信息已登记（演示）");
  }

  function resetReservation() {
    reserveWrap.hidden = false;
    reserveSuccess.hidden = true;
    reserveForm.elements.name.value = "";
    reserveForm.elements.phone.value = "";
    reserveForm.elements.note.value = "";
    reserveForm.elements.name.focus();
  }

  /* --------------------------------------------------------------- reveal */

  var revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
    );
  }

  function observeReveals(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll
      ? scope.querySelectorAll(".reveal:not(.is-visible)")
      : [];
    if (!nodes.length && scope.classList && scope.classList.contains("reveal")) {
      nodes = [scope];
    }
    Array.prototype.forEach.call(nodes, function (node) {
      if (revealObserver) {
        revealObserver.observe(node);
      } else {
        node.classList.add("is-visible");
      }
    });
  }

  /* ------------------------------------------------------------ navigation */

  function closeNav() {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
  }

  function toggleNav() {
    var isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
  }

  /* ------------------------------------------------------------ event wiring */

  menuGrid.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-add]");
    if (addButton) {
      addToCart(addButton.getAttribute("data-add"));
    }
  });

  var filterButtons = document.querySelectorAll(".filter-btn");
  Array.prototype.forEach.call(filterButtons, function (button) {
    button.addEventListener("click", function () {
      if (button.classList.contains("is-active")) return;
      Array.prototype.forEach.call(filterButtons, function (other) {
        other.classList.remove("is-active");
        other.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
      renderMenu(button.getAttribute("data-filter"), false);
    });
  });

  cartToggle.addEventListener("click", function () {
    if (cartDrawer.classList.contains("is-open")) {
      closeCart();
    } else {
      openCart();
    }
  });

  cartClose.addEventListener("click", function () {
    closeCart();
  });

  backdrop.addEventListener("click", function () {
    closeCart();
  });

  cartBody.addEventListener("click", function (event) {
    var qtyButton = event.target.closest("[data-qty]");
    if (qtyButton) {
      changeQty(qtyButton.getAttribute("data-id"), parseInt(qtyButton.getAttribute("data-qty"), 10));
      return;
    }

    var removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      removeItem(removeButton.getAttribute("data-remove"));
      return;
    }

    if (event.target.closest("[data-browse]")) {
      closeCart(false);
      var menuSection = document.getElementById("menu");
      if (menuSection) menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  checkoutBtn.addEventListener("click", function () {
    if (checkoutBtn.disabled) return;
    var total = cartTotal();
    cart = {};
    saveCart();
    updateCartUI();
    closeCart();
    showToast("演示订单已提交 · 合计 " + money(total) + "，请到店支付。");
  });

  reserveForm.addEventListener("input", function (event) {
    if (event.target.matches("input, select")) {
      clearFieldError(event.target);
      clearFormError();
    }
  });

  reserveForm.addEventListener("submit", handleReservation);
  reserveAgain.addEventListener("click", resetReservation);

  navToggle.addEventListener("click", toggleNav);

  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", function (event) {
    if (header.classList.contains("nav-open") && !header.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (cartDrawer.classList.contains("is-open")) {
        closeCart();
      } else if (header.classList.contains("nav-open")) {
        closeNav();
      }
    }
    trapFocus(event);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 980) closeNav();
  });

  var scrollTick = false;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTick) return;
      scrollTick = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
        scrollTick = false;
      });
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------ init */

  fillTimeOptions();
  setDateDefaults();
  updateCartUI();
  renderMenu("all", true);
  observeReveals(document);
  header.classList.toggle("is-scrolled", window.scrollY > 8);
})();
