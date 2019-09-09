

$(document).ready(function () {

  var $wnd = $(window);
  var $top = $(".page-top");
  var $html = $("html, body");
  var $header = $(".header");
  const $burgerMenu = $('.burger-menu');
  var $menu = $(".main-menu");
  var headerHeight = 82;

  // *** Animation of logo
  // init controller
    const controller = new ScrollMagic.Controller();

    const backToPosition = new TimelineMax({
      ease:Linear.easeNone,
      paused: true
    })
    .to('.anim__logo', 0.6, {
      transform: '0'      
    })
    .to('.anim__logo-img img', 0.6, {
      transform: '0',        
    }, 0
    )
    .to(
      '.anim__logo-text', 0.4, {
        opacity: '0',          
      },
      0
    )
    .to(
      '.anim__header-text .header__title', 0.4, {
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

    let toggle = true;
    const toggleAnim = () => {
      toggle ? backToPosition.play() : backToPosition.reverse();
      toggle = !toggle      
    }
        

    const scene = new ScrollMagic.Scene({
      triggerElement: "#trigger1"
    })
    .on('progress', () => {
      toggleAnim()
    })
    // .addIndicators({name: "1 (duration: 0)"}) // add indicators (requires plugin)
    .addTo(controller);


  // *** Animation of logo


  // // create a scene
  // new ScrollMagic.Scene({
  //         duration: 100,    // the scene should last for a scroll distance of 100px
  //         offset: 50    // start this scene after scrolling for 50px
  //     })
  //     .setPin("#my-sticky-element") // pins the element for the the scene's duration
  //     .addTo(controller); // assign the scene to the controller



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
    

  // jquery.maskedinput для ПК и планшет (мобильном не подключаем)
  if ($wnd.width() > 479) {
    $("input[type=tel]").mask("+7 (999) 999 99 99", {
      completed: function () {
        $(this).removeClass('error');
      }
    });
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

    // добавляет клас active в ссылку меню, когда находимся на блоке, куда эта ссылка ссылается
    $menu.find(".link").each(function () {
      var link = $(this);
      var id = link.find('a').attr('href');

      if (id.length > 1 && id.charAt(0) == '#' && $(id).length > 0) {
        var section = $(id);
        var sectionTop = section.offset().top;

        if (sectionTop <= scrollPos && (sectionTop + section.height()) >= scrollPos) {
          link.addClass('active');
        } else {
          link.removeClass('active');
        }
      }
    });
  }

  onscroll();

  // при нажатии на меню плавно скролит к соответсвующему блоку
  $(".main-menu .link a").click(function (e) {
    var $href = $(this).attr('href');
    if ($href.length > 1 && $href.charAt(0) == '#' && $($href).length > 0) {
      e.preventDefault();
      // отнимаем высоту шапки, для того чтобы шапка не прикрывала верхнию часть блока
      var top = $($href).offset().top - headerHeight;
      $html.stop().animate({ scrollTop: top }, "slow", "swing");
    }
  });

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

  $('ul.navigation a').each(function () {
    if(this.href == location.href) $(this).parent().addClass('active');
  })

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
    $header.removeClass('header--color');
    $burgerMenu.addClass('burger-menu--active');
  }

  function closeMenu() {
    $header.removeClass('header--opened');
    $burgerMenu.removeClass('burger-menu--active');
  }

  $('.burger-menu').click( function() {
    // $(this).closest('.page-wrapper').find('.header--opened');
    // $(this).closest('.burger-menu--scrolled').css('background-image', 'none');
    // $(this).closest('.page-wrapper').find('.header--opened').closest('.header-burger').removeClass('burger-menu--scrolled');
    $(this).closest('.header-burger').removeClass('burger-menu--scrolled');
  })

  $('.work').click( function() {
    $(this).find('.work__block').toggleClass('flex');
    $(this).find('.work__img__content').stop();
  })

  const spp = 4; // 1000ms / 100px

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


  $(".s-map__button").click( function() {
    $(this).closest('.s-map').addClass('show-map');
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