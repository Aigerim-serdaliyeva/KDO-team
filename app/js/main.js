$(document).ready(function () {

  var $wnd = $(window);
  var $top = $(".page-top");
  var $html = $("html, body");
  var $header = $(".header");
  var $headerBurger = $(".header-burger");
  const $burgerMenu = $('.burger-menu');
  var headerHeight = 170;

  // *** Animation of logo
  // init controller
    const controller = new ScrollMagic.Controller();

    const backToPosition = new TimelineMax({
      ease:Linear.easeNone,
      paused: true
    })
    .to('.anim__logo', 0.6, {
      transform: '0',
      margin: '0'
    })
    .to('.anim__logo-img', 0.6, {
      transform: '0',        
    }, 0)
    .to(
      '.anim__logo-text', 0.4, {
        opacity: '0',
        display: 'none'
      },
      0
    )
    .to(
      '.anim__header-text .header__language',  0.2, {
        transform: '0'
      }
    )  
    .to(
      '.anim__header-text .header__title',  0.4, {
        transform: '0'
      }
    )    
    .to(
      '.anim__navigation', 0.4, {
        opacity: '1'
      }
    )
    .to(
      '.anim__main-container',
      0.6, {
        height: '30vh'
      }, 0
    )

    const scene = new ScrollMagic.Scene({
      triggerElement: "#trigger1"
    })
    .on('progress', () => {
      backToPosition.play()
    })
    // .addIndicators({name: "1 (duration: 0)"}) // add indicators (requires plugin)
    .addTo(controller);


  // забираем utm из адресной строки и пишем в sessionStorage, чтобы отправить их на сервер при form submit
  var utms = parseGET();
  // проверяем есть ли utm в адресной строке, если есть то пишем в sessionStorage
  if (utms && Object.keys(utms).length > 0) {
    window.sessionStorage.setItem('utms', JSON.stringify(utms));
  } else {
    // если нет то берем utm из sessionStorage
    utms = JSON.parse(window.sessionStorage.getItem('utms') || "[]");
  }

  if ($wnd.width() < 992) {
    headerHeight = 60;
  }
    

  $wnd.scroll(function () { onscroll(); });

  var onscroll = function () {
    if ($wnd.scrollTop() > $wnd.height()) {
      $top.addClass('active');
    } else {
      $top.removeClass('active');
    }

    if ($wnd.scrollTop() > 0) {
      $header.addClass('header--scrolled');
    } else {
      $header.removeClass('header--scrolled');
    }

    if ($wnd.scrollTop() > 0) {
      $('.header-burger').addClass('burger-menu--scrolled');
    } else {
      $('.header-burger').removeClass('burger-menu--scrolled');
    }

    var scrollPos = $wnd.scrollTop() + headerHeight;

  }

  onscroll();

  $('.lang').click(function() {
    $(this).addClass('active').siblings().removeClass('active');
  })
  
  const $links = $(".main-menu .link a");
  $links.click(function (e) {
    e.preventDefault();
    $links.parent().removeClass('active');
    $(this).parent().addClass('active');
    var workCategory = $(this).attr('href').slice(1);
    showWork(workCategory);
    closeMenu();
    scrollToWorkSection();
  });

  // при нажатии на меню плавно скролит к соответсвующему блоку
  function scrollToWorkSection() {
    var top = $('.s-work').offset().top - headerHeight;
    $html.stop().animate({ scrollTop: top }, "slow", "swing");
  }

  const $works = $('.work');
  function showWork(workCategory = 'all') {
    if (workCategory === 'all') {
      $works.parent().removeClass('d-none');
    } else {
      $works.parent().addClass('d-none');
      $works.filter(`[data-value="${workCategory}"]`).parent().removeClass('d-none');
    }
  }
  showWork();

  $top.click(function () {
    $html.stop().animate({ scrollTop: 0 }, 'slow', 'swing');
  });

  // при изменении объязателных полей проверяем можно ли удалять класс error
  $("input:required, textarea:required").keyup(function () {
    var $this = $(this);
    if ($this.attr('type') != 'tel') {
      checkInput($this);
    }
  });

  // при закрытии модального окна удаляем error клас формы в модальном окне
  $(document).on('closing', '.remodal', function (e) {
    $(this).find(".input, .textarea").removeClass("error");
    var form = $(this).find("form");
    if (form.length > 0) {
      form[0].reset();
    }
  });

  $(".ajax-submit").click(function (e) {
    var $form = $(this).closest('form');
    var $requireds = $form.find(':required');
    var formValid = true;

    // проверяем объязательные (required) поля этой формы
    $requireds.each(function () {
      $elem = $(this);

      // если поле пусто, то ему добавляем класс error
      if (!$elem.val() || !checkInput($elem)) {
        $elem.addClass('error');
        formValid = false;
      }
    });

    if (formValid) {
      // если нет utm
      if (Object.keys(utms).length === 0) {
        utms['utm'] = "Прямой переход";
      }
      // создаем скрытые поля для utm внутрии формы
      for (var key in utms) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = utms[key];
        $form[0].appendChild(input);
      }
    } else {
      e.preventDefault();
    }
  });

  $('.burger-menu__btn').click(function(e) {
    e.preventDefault();
    if ($burgerMenu.hasClass('burger-menu--active')) {
      closeMenu();
    } else {
      showMenu();
    }
  });

  $('.burger-menu__overlay').click(function() {
    closeMenu();
  })

  $('.burger-menu__close').click( function() {
    closeMenu();
  })
  
  function showMenu() {
    $header.addClass('header--opened');
    $burgerMenu.addClass('burger-menu--active');
  }

  function closeMenu() {
    $header.removeClass('header--opened');
    $burgerMenu.removeClass('burger-menu--active');
  }

  $('.burger-menu').click( function() {
    $(this).closest('.header-burger').removeClass('burger-menu--scrolled');
  })

  $('.work').click( function() {
    $(this).find('.work__block').toggleClass('flex');
    $(this).find('.work__img__content').stop();
  })

  const spp = 8; // 1000ms / 100px

  $('.work').mouseenter( function() {
    const $workImg = $(this).find('.work__img');
    const $content = $(this).find('.work__img__content');
    if (!$content || !$content.length) {
      return;
    }
    const height = $workImg.height();
    const contentHeight = $content.height();
    if (contentHeight > height) {
      const top = contentHeight - height;
      const distance = top - (-$content.position().top);
      $content.stop().animate({
        'top': -top
      }, spp * distance);
    }
  });

  $('.work').mouseleave( function() {
    const $content = $(this).find('.work__img__content');
    if (!$content || !$content.length) {
      return;
    }
    const height = 0 - $content.position().top;
    $content.stop().animate({
      'top': 0
    }, spp * height);
  });

});

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// в основном для проверки поле email
function checkInput($input) {
  if ($input.val()) {
    if ($input.attr('type') != 'email' || validateEmail($input.val())) {
      $input.removeClass('error');
      return true;
    }
  }
  return false;
}

// забирает utm тэги из адресной строки
function parseGET(url) {
  var namekey = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  if (!url || url == '') url = decodeURI(document.location.search);

  if (url.indexOf('?') < 0) return Array();
  url = url.split('?');
  url = url[1];
  var GET = {}, params = [], key = [];

  if (url.indexOf('#') != -1) {
    url = url.substr(0, url.indexOf('#'));
  }

  if (url.indexOf('&') > -1) {
    params = url.split('&');
  } else {
    params[0] = url;
  }

  for (var r = 0; r < params.length; r++) {
    for (var z = 0; z < namekey.length; z++) {
      if (params[r].indexOf(namekey[z] + '=') > -1) {
        if (params[r].indexOf('=') > -1) {
          key = params[r].split('=');
          GET[key[0]] = key[1];
        }
      }
    }
  }

  return (GET);
};

// Internalization
      
const i18n = new VueI18n({
  locale: 'en', // set locale
  messages, // set locale messages
})      

new Vue({ 
  el: '#app',
  i18n,
  methods: {
    changeLang(lang) {
      this.$root.$i18n.locale = lang  
    }
  }      
})
// Internalization end