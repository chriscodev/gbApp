$(function () {
  "use strict";

  // ==============================================================
    // This is for the top header part and sidebar part
    // ==============================================================
    var set = function () {
      //this will be  separated to each component, and be abstracted
      // for now this is  for ui purpose -> chrisdev_mainTable_1204094871834095#566

      var width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
      var topOffset = 55;
      if (width < 1170) {
          $("body").addClass("mini-sidebar");
          $('.navbar-brand span').hide();
          $(".sidebartoggler i").addClass("ti-menu");
      }
      else {
          $("body").removeClass("mini-sidebar");
          $('.navbar-brand span').show();
      }
       var height = ((window.innerHeight > 0) ? window.innerHeight : this.screen.height) - 1;
      height = height - topOffset;
      if (height < 1) height = 1;
      if (height > topOffset) {
          $(".page-wrapper").css("min-height", (height) + "px");
      }
  };
  $(window).ready(set);
  $(window).on("resize", set);
  $('.js-switch').each(function() {
    new Switchery($(this)[0], $(this).data());
  });

    // ==============================================================
    // Theme options
    // ==============================================================
    $(".sidebartoggler").on('click', function () {
      if ($("body").hasClass("mini-sidebar")) {
          $("body").trigger("resize");
          $("body").removeClass("mini-sidebar");
          $('.navbar-brand span').show();
      }
      else {
          $("body").trigger("resize");
          $("body").addClass("mini-sidebar");
          $('.navbar-brand span').hide();
      }
  });
  // this is for close icon when navigation open in mobile view
  $(".nav-toggler").click(function () {
      $("body").toggleClass("show-sidebar");
      $(".nav-toggler i").toggleClass("ti-menu");
      $(".nav-toggler i").addClass("ti-close");
  });
  $(".search-box a, .search-box .app-search .srh-btn").on('click', function () {
      $(".app-search").toggle(200);
  });

  // ==============================================================
    // Right sidebar options
    // ==============================================================
    $(".right-side-toggle").click(function () {
      $(".right-sidebar").slideDown(50);
      $(".right-sidebar").toggleClass("shw-rside");
  });

   // ==============================================================
    // MULTIPLE TABLE HOVER SELECTION sidebar options
    // ==============================================================


});
