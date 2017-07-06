/*scripts.js*/
jQuery(document).ready(function(){

    /**
     * cookies
     */
    function createCookie(name, value, s) {
        if (s) {
            var date = new Date();
            date.setMonth(date.getMonth() + s)
            var expires = "; expires=" + date.toGMTString();
        } else
            var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    function getCookie(name) {
        var dc = document.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0) return null;
        } else {
            begin += 2;
            var end = document.cookie.indexOf(";", begin);
            if (end == -1) {
                end = dc.length;
            }
        }
        return unescape(dc.substring(begin + prefix.length, end));
    }
    $('#cookies-info .close').on('click', function () {
        $('#cookies-info').animate({
            'height': '0',
            'min-height': 0
        }, 300, function () {
            $(this).hide()
        });
        createCookie("cookies_info", 1, 12);
    });
    var myCookie = getCookie("cookies_info");
    if (myCookie == null) {
        $('#cookies-info').show();
    }


    var uptxt = $(".mouse span").data("bottom");
    var downtxt = $(".mouse span").text();
    var length = $('.section').length;

    $('.mfp').magnificPopup({
        type: 'inline',
        midClick: true,
        mainClass: 'mfp-with-zoom',
        removalDelay: 400,
        callbacks: {
            afterClose: function () {
                $("html").css("overflow","visible");
            }
        }
    });

    $(".magnificPopupWrap_text").mCustomScrollbar({
        theme:"minimal-dark",
        axis:'y'
    });


    $(".js-vat").on("change",function(){
        var el = $(this);
        var span = el.next("span");
        var txt = span.text();
        if(el.is(":checked")){
            $(".js-vatForm").removeClass("regFormBlock_formBlock--disabled");
            $(".js-vatForm").find('.regFormBlock_formBlock-row--required input').attr("required","required");
        } else{
            $(".js-vatForm").addClass("regFormBlock_formBlock--disabled");
            $(".js-vatForm").find('.regFormBlock_formBlock-row--required input').removeAttr("required");

        }
        span.text(span.data("text"));
        span.data("text",txt);
    });

    $('.js-infoWindow')
        .on('mouseover',function(){
            $(this).find('.regFormBlock_question-popup').stop().fadeIn();
        })
        .on('mouseout',function(){
            $(this).find('.regFormBlock_question-popup').stop().fadeOut();
        });


    $('.js-openMenu').on("click",function(){
        $('.mobileMenu').addClass('opened');
        $('.js-overlay').fadeIn();
    });
    $('.js-close').on("click",function(){
        $('.mobileMenu').removeClass('opened');
        $('.js-overlay').fadeOut();
    });
    $('.js-overlay').on("click",function(){
        $('.js-close').trigger("click");
    });

    $(".tlt").textillate({
        autoStart: false,
        in:{
            delay:30,
            effect:"fadeIn"
        }
    });

    $('.js-animate').on('inview', function (event, isInView) {
        if (isInView) {
            $(this).addClass("animate");
        } else {
            // element has gone out of viewport
        }
    });

    $('.tlt').on('inview', function (event, isInView) {
        if (isInView && !$(this).hasClass("complete")) {
            $(this).textillate('start');
            $(this).addClass("complete");
        } else {
            // element has gone out of viewport
        }
    });

    $('.tlt').on('start.tlt', function () {
        $('.tlt').css("opacity",0);
    });

    $('.tlt').on('inAnimationBegin.tlt', function () {
        $('.tlt').css("opacity",1);
    });

    function partnerSlider(){
        if (Modernizr.mq('(max-width: 700px)')){
            $(".container4_partnersLine--mobile .partnersCarousel").addClass("owl-carousel");
            $('.container4_partnersLine--mobile .partnersCarousel').owlCarousel({
                margin: 15,
                nav: false,
                autoplay:true,
                loop:true,
                items:1
            });
        } else{
            $('.container4_partnersLine--mobile .partnersCarousel').trigger("destroy.owl.carousel").removeClass("owl-carousel");
        }
    }

    partnerSlider();

    $(".partnerInner_socialLink")
        .on("mouseover",function(){
            $(this).children(".tooltip").stop().fadeIn();
        })
        .on("mouseout",function(){
            $(this).children(".tooltip").stop().fadeOut();
        });



    $(window).load(function(){
        $('.container4_partnersLine--full').owlCarousel({
            loop:true,
            margin:0,
            nav:true,
            dots:false,
            items:1,
            smartSpeed:1800,
            autoplayTimeout:12000,
            autoplay:true
        });
    });


var fpStatus = false;
function fullpage() {
    if (Modernizr.mq('(max-width: 980px)')) {
        if(length === 1){
            $(".section").css("min-height","calc(100vh - 80px)");
            $("#fullpage").addClass("fullpage--minheight");
        } else{
            $("#fullpage").removeClass("fullpage--minheight");
        }
        if(fpStatus) {$.fn.fullpage.destroy('all'); fpStatus = false;}
        $('.buttons').on('inview', function (event, isInView) {
            if (isInView) {
                $(this).addClass("animate");
            } else {
                // element has gone out of viewport
            }
        });
    } else{
        if(!fpStatus) {
            $('#fullpage').fullpage({
                //Navigation
                menu: '#menu',
                lockAnchors: true,
                anchors: ['01', '02', '03', '04', '05', '06'],
                navigation: true,
                navigationPosition: 'right',
                navigationTooltips: ['01/', '02/', '03/', '04/', '05/', '06/'],
                showActiveTooltip: true,


                fixedElements: '.head, .footer',

                //Custom selectors
                sectionSelector: '.section',

                lazyLoading: true,

                //events
                onLeave: function (index, nextIndex, direction) {
                    if (nextIndex == length) {
                        $('.mouse_icon').addClass("mouse_icon--down");
                        $('.mouse span').text(uptxt);
                    } else {
                        $('.mouse_icon').removeClass("mouse_icon--down");
                        $('.mouse span').text(downtxt);
                    }
                },
                afterLoad: function (anchorLink, index) {
                },
                afterRender: function () {
                    if (length == 1) {
                        $('#fp-nav').hide();
                        $('.mouse').hide();
                    }
                    fpStatus = true;

                    $('.buttons').on('inview', function (event, isInView) {
                        if (isInView) {
                            $(this).addClass("animate");
                        } else {
                            // element has gone out of viewport
                        }
                    });


                },
                afterResize: function () {
                },
                afterResponsive: function (isResponsive) {
                },
                afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
                },
                onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
                }
            });
            fpStatus = true;
        }
    }
}

fullpage();

$(window).resize(function(){
    partnerSlider();
    fullpage();
});


if($(".mouse").length){
    $(".mouse").on("click",function(){
        var el = $(this);
        if(el.find(".mouse_icon").hasClass("mouse_icon--down")) {
            $.fn.fullpage.moveTo(1);
        } else{
            $.fn.fullpage.moveSectionDown();
        }
    });
}


});