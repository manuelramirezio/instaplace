var isBooting = true;
var showingLoginForm = false;
var animationTime = 400;
var isAppendingBatch = false;
var windowScrollHandlerTimeout = -1;
var windowScrollHandlers = [];
var noMoreContent = false;
var isSafari = false;
var showingLoggedInUsersMediaDetail = false;
var showingMediaDetail = false;
var lastTapBrickPic = null;
var showItsMediaDetailTimeOutID = -1;
var likedAlertFadeOutTimeoutID = -1;
var currentDetailMediaID = null;
var currentDetailMediaIndex = -1;
var tempDisableArrowKeyDetailPageSwitch = false;
var emojiInputHideTimeout = -1;
var emojiInputContentLoaded = false;
var hideUsersInPhotoTooltipsTimeoutID = -1;
var bigPhotoOverlayShowing = false;
var mediaDetailHeight = 640;
var animationMaxBrickCount = 50;
var lastYs;
var windowResizeTimeout;
var lastWindowResizedWidth;
var lastScreenSizeClass;
var viewModeTight = 'tight';
var viewModeBricks = 'bricks';
var currentViewMode = viewModeBricks;
var brickBodyHoverTimeoutID = -1;
var viewModeTightCurrentHoverBrick = null;
var windowResizeHandlers = [];
var mediaCacheRootDomain = "a.gto.cc";
$(boot);

function toSecuredUrl(originalUrl) {
  try {
    return originalUrl.replace("http://", "h_p").replace("distilleryimage", "s_d_i").replace("s3.amazonaws.com", "s_a_c").replace("instagram.com", "i_c").split("").reverse().join("")
  } catch(ex) {
    return originalUrl
  }
}

function boot() {
  if(/iPhone|iPad|iPod|iOS|Mac OS/i.test(navigator.userAgent)) {
    isSafari = true
  }
  initializeFollowButton();
  emojilize($('.profileBannerWrapper'));
  tweetfyHtml($(".profile-bio"));
  initBricks(wallBricks());
  var lastBrickClass = $.cookie('brickClass');
  if(lastBrickClass != null && lastBrickClass != BrickClasses.M.name) {
    setBrickClassButtonPressed(BrickClasses[lastBrickClass]);
    $(".photoSizeSwitch .active").removeClass("active");
    $(".brickClassBtn-" + lastBrickClass).addClass("active")
  }
  var lastViewMode = $.cookie('viewMode');
  if(lastViewMode != null && lastViewMode != currentViewMode) {
    switchViewMode(lastViewMode);
    $(".viewModeSwitch .active").removeClass("active");
    $(".viewModeBtn-" + lastViewMode).addClass("active")
  }
  $(".pageLoading").hide();
  rearrangeBricks(false, false);
  initPrevNextButtons();
  initBrickSizeButtons();
  initViewModeSwitchButtons();
  setTimeout(function() {
    $(window).resize(function() {
      if(windowResizeTimeout > 0) {
        clearTimeout(windowResizeTimeout);
        windowResizeTimeout = -1
      }
      console.log("resize");
      lastWindowResizedWidth = $(window).width();
      windowResizeTimeout = setTimeout(windowResizeHanlder, 200)
    })
  }, 500);
  $(".wall").css({
    opacity: 1.0
  });
  isBooting = false
}

function windowResizeHanlder() {
  var nowScreenSizeClass = screenSizeClass();
  setBrickClass(wallBricks(), currentBrickClass);
  rearrangeBricks(true, false);
  lastScreenSizeClass = nowScreenSizeClass;
  for(var i = 0; i < windowResizeHandlers.length; i++) {
    var handler = windowResizeHandlers[i];
    try {
      handler()
    } catch(ex) {}
  }
  windowResizeTimeout = -1
}
var BrickClasses = {
  S: {
    name: "S",
    css: "col-xs-4 col-sm-3 col-md-2 col-lg-2 col-xl-1 col-xxl-1",
    columns: {
      xs: 3,
      sm: 4,
      md: 6,
      lg: 6,
      xl: 12,
      xxl: 12
    }
  },
  M: {
    name: "M",
    css: "col-xs-6 col-sm-4 col-md-3 col-lg-3 col-xl-2 col-xxl-2",
    columns: {
      xs: 2,
      sm: 3,
      md: 4,
      lg: 4,
      xl: 6,
      xxl: 6
    }
  },
  L: {
    name: "L",
    css: "col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-4",
    columns: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 3,
      xxl: 3
    }
  }
};
var currentBrickClass = BrickClasses.M;

function setBrickClass(bricks, brickClass) {
  if(!bricks.hasClass(brickClass.css)) {
    bricks.attr("class", "brick").addClass(brickClass.css)
  }
  var brickPic = bricks.find(".pic");
  brickPicImage = brickPic.find(".image");
  if(currentBrickClass != brickClass) {
    $(".wallContainer").removeClass("brickClass-" + currentBrickClass.name).addClass("brickClass-" + brickClass.name);
    currentBrickClass = brickClass
  }
  brickPicImage.css({
    width: brickPic.width(),
    height: brickPic.width()
  });
  if(brickClass == BrickClasses.L) {
    brickPicImage.each(function() {
      var bpi = $(this);
      if(bpi.attr("srcx") != null) {
        bpi.attr("src", bpi.attr("srcx"))
      }
    })
  }
}

function initBrickSizeButtons() {
  $(".brickClassBtn-S").click(function() {
    setBrickClassButtonPressed(BrickClasses.S)
  });
  $(".brickClassBtn-M").click(function() {
    setBrickClassButtonPressed(BrickClasses.M)
  });
  $(".brickClassBtn-L").click(function() {
    setBrickClassButtonPressed(BrickClasses.L)
  })
}

function setBrickClassButtonPressed(brickClass) {
  setBrickClass(wallBricks(), brickClass);
  if(!isBooting) {
    rearrangeBricks(true, false)
  }
  if(!isBooting && brickClass == BrickClasses.S) {
    ensureEnoughMediaLoaded()
  }
  $.cookie('brickClass', brickClass.name, {
    expires: 500,
    path: '/'
  })
}

function initViewModeSwitchButtons() {
  $(".viewModeBtn-bricks").click(function() {
    switchViewMode(viewModeBricks)
  });
  $(".viewModeBtn-tight").click(function() {
    switchViewMode(viewModeTight)
  })
}

function switchViewMode(vm) {
  if(vm == viewModeTight) {
    $(".wall").addClass("viewModeTight")
  } else {
    $(".wall").removeClass("viewModeTight")
  }
  currentViewMode = vm;
  $.cookie('viewMode', currentViewMode, {
    expires: 500,
    path: '/'
  });
  if(!isBooting) {
    rearrangeBricks(true, false)
  }
}
$(document).ready(function() {
  if(typeof(showNote) != 'undefined' && showNote) {
    if(!isUserLoggedIn() || $.cookie('hideNote') != 'true') {
      $(".note").slideDown()
    }
  }
  ensureEnoughMediaLoaded();
  lastScreenSizeClass = screenSizeClass();
  if(typeof(appendAction) != 'undefined') {
    if(appendAction == "GetUserFeed") {
      $(".navbar-nav .myFeed").addClass("active")
    } else if(appendAction == "GetUserLikedMedia") {
      $(".navbar-nav .myLikes").addClass("active")
    } else if(appendAction == "GetUserFavMedia") {
      $(".navbar-nav .myFavs").addClass("active")
    }
  }
  var url = document.location.href;
  if(url.indexOf("/popular") > -1) {
    $(".navbar-nav .popular").addClass("active")
  }
  if(url.indexOf("/interesting") > -1) {
    $(".navbar-nav .random").addClass("active")
  }
  if(url.indexOf("/justnow") > -1) {
    $(".navbar-nav .recent").addClass("active")
  }
  if(url.indexOf("/Channel/") > -1) {
    $(".navbar-nav .channels").addClass("active")
  }
});

function initBrickOne(brick) {
  setBrickClass(brick, currentBrickClass);
  emojilize(brick);
  brick.find(".caption, .detailCommentText").each(function() {
    tweetfyHtml($(this))
  });
  var brickPicA = brick.find(".pic-a");

  function picClickHandler(brickPic) {
    if(showItsMediaDetailTimeOutID > 0) {
      clearTimeout(showItsMediaDetailTimeOutID);
      showItsMediaDetailTimeOutID = -1;
      if(lastTapBrickPic != null && (lastTapBrickPic.get(0) == brickPic.get(0))) {
        like(getParentBrickMediaID(brickPic), true);
        lastTapBrickPic = null
      }
    } else {
      lastTapBrickPic = brickPic;
      showItsMediaDetailTimeOutID = setTimeout(function() {
        showItsMediaDetail(lastTapBrickPic);
        lastTapBrickPic = null;
        showItsMediaDetailTimeOutID = -1
      }, 200)
    }
  }
  brickPicA.mousedown(function(event) {
    if(event.which == 1) {
      picClickHandler($(this))
    }
  });
  brick.find(".actionBtns").click(function(e) {
    var target = $(e.target);
    if(target.hasClass("actionBtns")) {
      picClickHandler(target)
    }
  });
  brick.find(".pic").hover(function() {
    var columnCount = currentBrickClass.columns[screenSizeClass().name];
    if(columnCount == 1) {
      return false
    }
    if($(this).width() < 200) {
      $(this).find(".actionBtns").removeClass("btn-group")
    } else {
      $(this).find(".actionBtns").addClass("btn-group")
    }
    if($(this).width() >= 130) {
      $(this).find(".brickActions").show()
    }
  }, function() {
    $(this).find(".brickActions").hide()
  });
  brick.find(".caption").hover(function() {
    var columnCount = currentBrickClass.columns[screenSizeClass().name];
    if(columnCount == 1) {
      return false
    }
    if(currentViewMode == viewModeTight) {
      var theBrick = $(this).parent().parent();
      var theMedia = getMediaByID(theBrick.attr("mediaid"));
      if((theMedia.caption && theMedia.caption.text && theMedia.caption.text.length > 0) || theMedia.comments && theMedia.comments.data && theMedia.comments.data.length > 0 || theMedia.location && theMedia.location.name) {
        brickBodyHoverTimeoutID = setTimeout(function(args) {
          if(args == viewModeTightCurrentHoverBrick) {
            viewModeTightCurrentHoverBrick.addClass("hover")
          }
        }, 1000, theBrick)
      }
      viewModeTightCurrentHoverBrick = theBrick
    }
  });
  brick.hover(function() {}, function() {
    var columnCount = currentBrickClass.columns[screenSizeClass().name];
    if(columnCount == 1) {
      return false
    }
    if(currentViewMode == viewModeTight) {
      var theBrick = $(this);
      theBrick.removeClass("hover");
      if(brickBodyHoverTimeoutID > 0) {
        clearTimeout(brickBodyHoverTimeoutID);
        brickBodyHoverTimeoutID = -1
      }
      viewModeTightCurrentHoverBrick = null
    }
  });
  var theMedia = getMediaByID(brick.attr("mediaid"));
  if(isUserLoggedIn()) {
    var alreadyLike = false;
    if(typeof(theMedia.user_has_liked) != 'undefined') {
      alreadyLike = theMedia.user_has_liked
    }
    if(alreadyLike) {
      setBrickLikedStyle(brick, true)
    }
    var alreadyFav = false;
    if(appendAction != "GetUserFavMedia") {
      if(typeof(alreadyFavsArray) != 'undefined' && alreadyFavsArray) {
        for(var i = 0; i < alreadyFavsArray.length; i++) {
          if(theMedia.id == alreadyFavsArray[i]) {
            alreadyFav = true;
            break
          }
        }
      }
    } else {
      alreadyFav = true
    }
    if(alreadyFav) {
      setBrickFavStyle(brick, true)
    }
  }
  brick.find('.tooltipBtn').tooltip({
    animation: true
  })
}

function initBricks(bricks) {
  bricks.each(function() {
    var b = $(this);
    if(b.hasClass("brick")) {
      initBrickOne(b)
    }
  })
}

function ensureEnoughMediaLoaded() {
  if(typeof(mediaJson) != 'undefined') {
    if(mediaJson.length < 14 || $(".wall").height() < $(window).height()) {
      if(!isAppendingBatch) {
        appendBatch($(window).scrollTop())
      }
    }
  }
}
$(window).scroll(function() {
  if(windowScrollHandlerTimeout > 0) {
    clearTimeout(windowScrollHandlerTimeout)
  }
  windowScrollHandlerTimeout = setTimeout(function() {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var columnCount = currentBrickClass.columns[screenSizeClass().name];
    var windowHeightRatio = 6 / columnCount;
    if(windowHeightRatio < 2) windowHeightRatio = 2;
    if(scrollTop >= $(document).height() - windowHeightRatio * windowHeight) {
      if(!isAppendingBatch) {
        appendBatch(scrollTop)
      }
    }
    var goTopButton = $(".goTopButton");
    if(scrollTop > windowHeight / 2.0) {
      goTopButton.fadeIn()
    } else {
      goTopButton.fadeOut()
    }
    if(windowScrollHandlers) {
      for(var i = 0; i < windowScrollHandlers.length; i++) {
        try {
          windowScrollHandlers[i](scrollTop)
        } catch(e) {
          console.log("windowScrollHandlers " + i + " Error:" + e)
        }
      }
    }
    windowScrollHandlerTimeout = -1
  }, 40)
});

function appendBatch() {
  console.log("appendBatch");
  if(noMoreContent) {
    return
  }
  isAppendingBatch = true;
  showLoadingContent();
  var ajaxData = {
    count: 24,
    timstamp: new Date().getTime()
  };
  ajaxData[maxIDField] = nextMaxID;
  if(appendExtensionParam) {
    $.extend(ajaxData, appendExtensionParam)
  }
  $.ajax({
    url: rootUrl + "/MultiView/" + appendAction,
    data: ajaxData,
    success: function(resp) {
      console.log('appendBatch returns:' + resp);
      if(!resp.pagination && !resp.data) {} else {
        if(resp.pagination) {
          nextMaxID = resp.pagination[maxIDField];
          if(nextMaxID) {
            $(".nextPage").attr("href", "?start=" + nextMaxID)
          } else {
            $(".nextPage").attr("href", "?start=")
          }
          console.log("updated " + maxIDField + " to:" + nextMaxID)
        }
        data = resp.data;
        if(!data || !data.length || data.length < 1 || (resp.pagination && !nextMaxID)) {
          noMoreContent = true
        }
        if(data && data.length > 0) {
          renderBricks(data)
        }
      }
      hideLoadingContent();
      isAppendingBatch = false;
      ensureEnoughMediaLoaded()
    },
    error: function(data) {
      console.log('error:appendBatch:' + data);
      hideLoadingContent();
      isAppendingBatch = false
    }
  })
}

function renderBricks(data, scrollTopPos, noConcatDataJson) {
  var newBricks = $($('#brickTemplate').render(data));
  newBricks.appendTo($('.wall'));
  if(!noConcatDataJson) {
    mediaJson = mediaJson.concat(data)
  }
  initBricks(newBricks);
  rearrangeBricks(true, true)
}

function getColumnWidth(brickClass, screenSizeClass) {
  var wallContentWidth = $(".wall").width();
  var columnCount = brickClass.columns[screenSizeClass.name];
  var columnWidth = Math.floor(wallContentWidth / columnCount);
  return columnWidth
}

function rearrangeBricks(animate, appending) {
  if($('.brick').length > animationMaxBrickCount) {
    animate = false
  }
  if(appending) {
    animate = true
  }
  var wallContentWidth = $(".wall").width();
  var columnCount = currentBrickClass.columns[screenSizeClass().name];
  var columnWidth = Math.floor(wallContentWidth / columnCount);
  var ys = null;
  if(!appending) {
    ys = [];
    for(var i = 0; i < columnCount; i++) {
      ys[i] = 0
    }
  } else {
    ys = lastYs
  }
  var c = 0;
  var bricks = null;
  if(!appending) {
    bricks = $(".wall .brick")
  } else {
    bricks = $(".wall .brick:not([actionInit])")
  }
  var maxY = 0;
  bricks.each(function() {
    var b = $(this);
    var startIdx = 0;
    var c = getMinValueIndex(ys, startIdx);
    var left = c * columnWidth;
    var top = ys[c];
    ys[c] += b.height();
    if(ys[c] > maxY) {
      maxY = ys[c]
    }
    if(animate) {
      if(!appending) {
        b.animate({
          left: left,
          top: top
        }, animationTime)
      } else {
        b.css({
          left: left,
          top: top + 1000
        });
        b.animate({
          left: left,
          top: top
        }, animationTime)
      }
    } else {
      b.css({
        left: left,
        top: top
      })
    }
    b.attr("actionInit", "true");
    c++
  });
  if(maxY < ys[0]) {
    maxY = ys[0]
  }
  $(".wall").css("height", maxY);
  lastYs = ys;
  console.log("rearrangeBricks")
}

function calculateResizeCommentsArea() {
  if(!isScreenSmall()) {
    var showAllCommentsVisible = $(".showAllComments").is(":visible");
    var detailCommentsHeight = mediaDetailHeight - ($(".addCommentContainer").offset().top - $(".detailSidebar").offset().top + $(".addCommentContainer").height());
    if(!showAllCommentsVisible) {
      detailCommentsHeight -= 10
    }
    $('.detailComments').css({
      "height": detailCommentsHeight
    })
  } else {
    $('.detailComments').css({
      "height": "auto"
    })
  }
  initCommentsInDetail()
}

function showMediaDetail(media, hideMediaDetailNavBtns) {
  showingLoggedInUsersMediaDetail = false;
  var loggedInInstagramUser = getLoggedInInstagramUserInfo();
  if(loggedInInstagramUser != null && loggedInInstagramUser.id == media.user.id) {
    showingLoggedInUsersMediaDetail = true
  }
  currentDetailMediaID = media.id;
  currentDetailMediaIndex = getMediaIndexByID(media.id);
  if(mediaJson.length - currentDetailMediaIndex < 10 && !noMoreContent) {
    appendBatch(0)
  }
  var windowHeight = $(window).height();
  var windowWidth = $(window).width();
  mediaDetailHeight = 640;
  if(windowHeight < (642 + 30) && windowWidth >= 992) {
    mediaDetailHeight = windowHeight - 10;
    var newWidth = (mediaDetailHeight / 2) * 3;
    $(".mediaDetailModal .modal-dialog").css({
      marginTop: 4,
      marginBottom: 0,
      width: newWidth
    });
    $(".mediaDetailModal .row").css({
      height: mediaDetailHeight
    })
  } else {
    $(".mediaDetailModal .modal-dialog").removeAttr("style");
    $(".mediaDetailModal .row").removeAttr("style")
  }
  $('.mediaDetailContainer').empty();
  $($('#mediaDetailTemplate').render(media)).appendTo($('.mediaDetailContainer'));
  var mediaElement = $(".mediaDetailContainer").children(".mediaDetail");
  var brick = getBrick(media.id);
  var isXS = isScreenSmall();
  $('.detailComments').css({
    "height": 0
  });
  $(".mediaDetailModal").modal({
    keyboard: true,
    backdrop: true,
    show: true
  }).on('hidden.bs.modal', function() {
    showingMediaDetail = false;
    bigPhotoOverlayShowing = false;
    $(".videoPlayer").flowplayer().stop()
  }).on('shown.bs.modal', function() {
    calculateResizeCommentsArea()
  });
  $('.addComment').keydown(function(event) {
    if(event.which == 13) {
      event.preventDefault();
      sendComment();
      $('.addComment').blur()
    }
  }).focus(function() {
    if(screenSizeClass().width >= SizeClass.MD.width) {
      if(emojiInputHideTimeout > 0) {
        clearTimeout(emojiInputHideTimeout);
        emojiInputHideTimeout = -1
      }
      var mediaDetailOffset = $("#mediaDetail").offset();
      var addCommentOffset = $('.addComment').offset();
      $(".emojiInput").css({
        top: addCommentOffset.top - mediaDetailOffset.top - 120,
        left: addCommentOffset.left - $(".emojiInput").width()
      });
      $(".emojiInput").show()
    }
    tempDisableArrowKeyDetailPageSwitch = true
  }).blur(function() {
    emojiInputHideTimeout = setTimeout(function() {
      $(".emojiInput").hide()
    }, 500);
    tempDisableArrowKeyDetailPageSwitch = false
  });
  if(media.comments.count > media.comments.data.length) {
    $(".showAllComments").show();
    $(".showAllComments").click(function() {
      $(".showAllComments").hide();
      $(".loadingComments").show();
      $.ajax({
        url: rootUrl + "/MultiView/GetMediaComments",
        data: {
          mediaID: currentDetailMediaID
        },
        type: "GET",
        success: function(data) {
          $(".loadingComments").hide();
          $(".detailComments").empty();
          $($('#mediaDetailCommentTemplate').render(data)).appendTo($('.detailComments'));
          calculateResizeCommentsArea();
          if(isScreenSmall()) {
            $(".mediaDetailModal").animate({
              scrollTop: $(".mediaDetailContainer").height()
            }, 300)
          } else {
            $(".detailComments").animate({
              scrollTop: $('.detailComments')[0].scrollHeight
            }, 300)
          }
          media.comments.data = data
        },
        error: function(data) {
          console.log('error:get MultiView/GetMediaComments:' + data);
          $(".loadingComments").hide()
        }
      })
    })
  } else {
    $(".showAllComments").hide()
  }
  $('.sendButton').click(sendComment);
  calculateResizeCommentsArea();
  var prevMedia, nextMedia;
  prevMedia = getMediaByIndex(currentDetailMediaIndex - 1);
  nextMedia = getMediaByIndex(currentDetailMediaIndex + 1);

  function showOverlay() {
    mediaElement.find(".photoExtraInfo").show();
    mediaElement.find(".prevNextWrapper").show();
    if(media.users_in_photo.length > 0) {
      showUsersInPhotoTooltips(mediaElement)
    }
    bigPhotoOverlayShowing = true
  }

  function hideOverlay() {
    mediaElement.find(".photoExtraInfo").hide();
    mediaElement.find(".prevNextWrapper").hide();
    if(media.users_in_photo.length > 0) {
      hideUsersInPhotoTooltips(mediaElement)
    }
    bigPhotoOverlayShowing = false
  }
  var leftParts = $(".bigPhoto .bigPhotoImage, .bigPhoto .videoPlayer");
  leftParts.on("tap", function() {
    if(!media.videos) {
      if(bigPhotoOverlayShowing) {
        hideOverlay()
      } else {
        showOverlay()
      }
    }
  });
  $(".bigPhoto").hover(function() {
    showOverlay()
  }, function() {
    hideOverlay()
  });
  mediaElement.on("click", function(event) {
    if(!media.videos) {
      var target = $(event.target);
      if(!isChildElement(target, mediaElement.find(".bigPhoto"))) {
        hideOverlay()
      }
    }
  });
  if(bigPhotoOverlayShowing) {
    showOverlay()
  }
  mediaElement.find(".usersInPhotoDropDown").hover(function() {
    showUsersInPhotoTooltips(mediaElement)
  }, function() {
    hideUsersInPhotoTooltips(mediaElement)
  });
  if(!hideMediaDetailNavBtns) {
    showPrevMediaButton(prevMedia);
    showNextMediaButton(nextMedia)
  } else {
    showPrevMediaButton(null);
    showNextMediaButton(null)
  }

  function initEmojiInputEvents() {
    $(".emojiInputContent .emoji").click(function() {
      var emojiChar = jEmoji.charByCode[$(this).attr("code")];
      $(".addComment").val($(".addComment").val() + emojiChar);
      $('.addComment').focus().caretToEnd()
    });
    $("#emojiInputTab a").click(function() {
      $('.addComment').focus()
    })
  }
  if(emojiInputContentLoaded == false) {
    for(var c in jEmoji.emojiByCategory) {
      var emojiInCategory = jEmoji.emojiByCategory[c];
      var html = "";
      for(var i in emojiInCategory) {
        var emoji = emojiInCategory[i];
        var unicode = emoji[0];
        var clazz = unicode;
        if(emoji[2] == "notFound") {
          clazz += " notFound"
        }
        html += '<span class="emoji emoji' + clazz + '" code="' + unicode + '"></span>'
      }
      $("#" + c).append($(html))
    }
    emojiInputContentLoaded = true;
    initEmojiInputEvents()
  }
  $('#myTab a:last').tab('show');
  $(".emojiInput").hide();
  $(".emojiInput").click(function() {
    $('.addComment').focus()
  });

  function processText() {
    emojilize(mediaElement);
    var tweetfyClasses = ['detailCaption', 'detailCommentText'];
    for(var i = 0; i < tweetfyClasses.length; i++) {
      var clazz = tweetfyClasses[i];
      mediaElement.find("." + clazz).each(function() {
        var textElement = $(this);
        tweetfyHtml(textElement)
      })
    }
  }
  if(!isXS) {
    processText()
  } else {
    setTimeout(processText, 300)
  }
  if(brick.attr("liked") == "true") {
    mediaElement.find(".likeButton").addClass("liked");
    mediaElement.find(".likeButton .text").text(MultiViewLang.Liked);
    mediaElement.find(".likeButton .count").text(brick.find(".likesCount").text())
  }
  if(brick.attr("fav") == "true") {
    setBrickFavButtonStyle(mediaElement, true)
  }
  mediaElement.find(".bigPhoto img").on('doubletap', function() {
    like(null, true)
  });
  if(media.videos) {
    $(".videoPlayer").flowplayer();
    $('.videoPlayer .fp-embed').remove();
    $('.videoPlayer a').each(function() {
      $("a[href='http://flowplayer.org']").css({
        opacity: 0.00001
      })
    });
    if(!bigPhotoOverlayShowing) {
      $(".videoPlayer").flowplayer().load()
    }
    $(".videoPlayer").flowplayer().bind("pause", function() {
      if(showingMediaDetail) {
        showOverlay()
      }
    })
  }
  if(currentBrickClass == BrickClasses.L) {
    mediaElement.find(".bigPhotoImage.low").hide();
    mediaElement.find(".bigPhotoImage.standard").removeAttr("style")
  } else {}
  showingMediaDetail = true
}

function showPrevMediaButton(media) {
  if(!media) {
    $(".prevButton").hide();
    return
  } else {
    $(".prevButton").show()
  }
}

function showNextMediaButton(media) {
  if(!media) {
    $(".nextButton").hide();
    return
  } else {
    $(".nextButton").show()
  }
}

function showUsersInPhotoTooltips(container) {
  var photoSize = $(".bigPhoto img").width();
  container.find(".usersInPhotoTooltips .tooltip").each(function() {
    var tt = $(this);
    var left = parseFloat(tt.attr("posx")) * photoSize - tt.width() * 0.5;
    var top = parseFloat(tt.attr("posy")) * photoSize;
    tt.css({
      left: left,
      top: top
    });
    tt.show()
  })
}

function hideUsersInPhotoTooltips(container) {
  container.find(".usersInPhotoTooltips .tooltip").hide()
}

function initPrevNextButtons() {
  $("body").keydown(function(e) {
    if(showingMediaDetail && !tempDisableArrowKeyDetailPageSwitch) {
      if(e.keyCode == 37) {
        switchDetailPrev();
        $("body").focus()
      } else if(e.keyCode == 39) {
        switchDetailNext();
        $("body").focus()
      }
    }
  })
}

function switchDetailPrev() {
  var media = getMediaByIndex(currentDetailMediaIndex - 1);
  if(media) {
    showMediaDetail(media);
    scrollWindowToBrick(media.id)
  }
}

function switchDetailNext() {
  var media = getMediaByIndex(currentDetailMediaIndex + 1);
  if(media) {
    showMediaDetail(media);
    scrollWindowToBrick(media.id)
  }
}

function sendComment() {
  if(!isUserLoggedIn()) {
    showLogin();
    return
  }
  var commentText = $.trim($(".addComment").val());
  if(commentText == "") {
    $(".addComment").focus();
    return
  }
  var comment = {
    created_time: "\/Date(" + new Date().getTime() + ")\/",
    text: commentText,
    from: {
      username: instagramUserInfo.username,
      profile_picture: instagramUserInfo.profile_picture,
      id: instagramUserInfo.id
    }
  };
  var newCommentElement = $($('#mediaDetailCommentTemplate').render(comment));
  newCommentElement.css("opacity", 0.5);
  newCommentElement.appendTo($(".detailComments"));
  tweetfyHtml(newCommentElement.find('.detailCommentText'));
  emojilize(newCommentElement);
  var isXS = isScreenSmall();
  if(isXS) {
    $(".mediaDetailModal").animate({
      scrollTop: $(".mediaDetailContainer").height()
    }, 300)
  } else {
    $(".detailComments").animate({
      scrollTop: $('.detailComments')[0].scrollHeight
    }, 300)
  }
  $(".addComment").val("");
  $.ajax({
    url: rootUrl + "/MultiView/CommentMedia",
    data: {
      mediaID: currentDetailMediaID,
      commentText: commentText
    },
    type: "POST",
    success: function(data) {
      console.log('success:post MultiView/CommentMedia:' + data);
      newCommentElement.css("opacity", 1.0).attr("id", "detailComment_" + data.id);
      newCommentElement.attr("commentID", data.id);
      comment.id = data.id;
      var comments = getMediaByID(currentDetailMediaID).comments;
      comments.data.push(comment);
      comments.count += 1;
      initCommentsInDetail()
    },
    error: function(data) {
      console.log('error:post MultiView/CommentMedia:' + data);
      newCommentElement.detach()
    }
  })
}

function deleteComment(mediaID, commentID) {
  if(confirm(MultiViewLang.ConfirmDeleteMediaComment)) {
    if(!mediaID) {
      mediaID = currentDetailMediaID
    }
    $("#detailComment_" + commentID).detach();
    $.ajax({
      url: rootUrl + "/MultiView/DeleteMediaComment",
      data: {
        mediaID: mediaID,
        commentID: commentID
      },
      type: "POST",
      success: function(data) {
        console.log('success:post MultiView/DeleteMediaComment:' + data);
        var comments = getMediaByID(mediaID).comments;
        var commentIndex = -1;
        for(var i = 0; i < comments.data.length; i++) {
          if(comments.data[i].id == commentID) {
            commentIndex = i
          }
        }
        if(commentIndex >= 0) {
          comments.data.splice(commentIndex, 1);
          comments.count -= 1
        }
      },
      error: function(data) {
        console.log('error:post MultiView/DeleteMediaComment:' + data)
      }
    })
  }
}

function hideMediaDetail() {
  $(".videoPlayer").flowplayer().stop();
  $(".mediaDetailModal").modal('hide');
  showingMediaDetail = false
}

function initCommentsInDetail() {
  $(".mediaDetail .comment").unbind('hover').hover(function() {
    $(this).find(".mentionUser").show();
    if(showingLoggedInUsersMediaDetail) {
      $(this).find(".deleteComment").show()
    } else {
      loggedInIGUser = getLoggedInInstagramUserInfo();
      if(loggedInIGUser && loggedInIGUser.id == $(this).attr("fromID")) {
        $(this).find(".deleteComment").show()
      }
    }
  }, function() {
    $(this).find(".mentionUser").hide();
    $(this).find(".deleteComment").hide()
  });
  $(".mediaDetail .mentionUser").unbind('click').click(function() {
    var toAppend = "@" + $(this).parent().parent().find(".commentUserName").text() + " ";
    $(".addComment").val($(".addComment").val() + toAppend);
    $('.addComment').focus().caretToEnd()
  });
  $(".mediaDetail .deleteComment").unbind('click').click(function() {
    deleteComment(null, $(this).parents(".comment").attr("commentID"))
  })
}

function comment(mediaID) {
  if(!isUserLoggedIn()) {
    showLogin();
    return
  }
  var media = getMediaByID(mediaID);
  showMediaDetail(media)
}

function followUser(userID) {
  if(!isUserLoggedIn()) {
    showLogin();
    return
  }
  $(".followBtn").attr("disabled", "disabled").unbind("hover");
  var action = (following || followRequested) ? "UnfollowUser" : "FollowUser";
  $.ajax({
    url: rootUrl + "/MultiView/" + action,
    data: {
      userID: userID
    },
    type: "POST",
    success: function(data) {
      $(".followBtn").removeAttr("disabled");
      if(data.outgoing_status == "follows") {
        following = true
      } else {
        following = false
      }
      if(data.outgoing_status == "requested") {
        followRequested = true
      } else {
        followRequested = false
      }
      initializeFollowButton();
      console.log('success:post MultiView/(Un)FollowUser:' + data.outgoing_status)
    },
    error: function(data) {
      $(".followBtn").removeAttr("disabled");
      console.log('success:post MultiView/(Un)FollowUser:' + data.outgoing_status)
    }
  })
}

function initializeFollowButton() {
  var followButton = $(".followBtn");
  if(followButton.length > 0) {
    if(following || followRequested) {
      var buttonText = following ? MultiViewLang.Following : MultiViewLang.FollowRequested;
      if(followedMe && following) {
        buttonText = '<i class="glyphicon glyphicon-transfer" style="margin-right:3px;"></i>' + buttonText
      }
      followButton.html(buttonText).removeClass("btn-info").addClass("btn-success");
      followButton.hover(function() {
        $(this).html(MultiViewLang.Unfollow).removeClass("btn-success").addClass("btn-danger")
      }, function() {
        $(this).html(buttonText).removeClass("btn-danger").addClass("btn-success")
      })
    } else {
      var buttonText = MultiViewLang.Follow;
      if(followedMe) {
        buttonText = '<i class="glyphicon glyphicon-transfer" style="margin-right:3px;color: #E9E9E9;"></i>' + buttonText
      }
      followButton.html(buttonText).removeClass("btn-success").addClass("btn-info");
      followButton.unbind("hover")
    }
  }
}

function getParentBrickMediaID(element) {
  var mediaID = element.parents(".brick").attr("mediaid");
  return mediaID
}

function showItsMediaDetail(element) {
  var mediaID = getParentBrickMediaID(element);
  var media = getMediaByID(mediaID);
  if(media != null) {
    showMediaDetail(media)
  }
}

function favMedia(mediaID) {
  if(!isUserLoggedIn()) {
    showLogin();
    return
  }
  if(mediaID) {
    var brick = getBrick(mediaID);
    if(brick.attr("fav") == "true") {
      setBrickFav(brick, false)
    } else {
      setBrickFav(brick, true)
    }
  } else {
    var mediaElement = $(".mediaDetailContainer").children(".mediaDetail");
    var mediaID = mediaElement.attr("mediaid");
    var brick = getBrick(mediaID);
    if(brick.attr("fav") == "true") {
      setBrickFavButtonStyle(mediaElement, false);
      setBrickFav(brick, false)
    } else {
      setBrickFavButtonStyle(mediaElement, true);
      setBrickFav(brick, true)
    }
  }
}

function setBrickFav(brick, fav) {
  var mediaID = brick.attr("mediaid");
  var media = getMediaByID(mediaID);
  media.fav = fav;
  if(fav && brick.attr("fav") != "true") {
    $.ajax({
      url: rootUrl + "/MultiView/CreateMediaFav",
      data: {
        igMediaID: media.id,
        igUserID: media.user.id
      },
      type: "POST",
      success: function(data) {
        console.log('success:post MultiView/CreateMediaFav:' + data)
      },
      error: function(data) {
        console.log('error:post MultiView/CreateMediaFav:' + data)
      }
    })
  } else if(!fav && brick.attr("fav") == "true") {
    $.ajax({
      url: rootUrl + "/MultiView/DeleteMediaFav",
      data: {
        igMediaID: media.id
      },
      type: "POST",
      success: function(data) {
        console.log('success:post MultiView/DeleteMediaFav:' + data)
      },
      error: function(data) {
        console.log('error:post MultiView/DeleteMediaFav:' + data)
      }
    })
  }
  setBrickFavStyle(brick, fav)
}

function setBrickFavStyle(brick, fav) {
  if(fav) {
    brick.attr("fav", "true");
    setBrickFavButtonStyle(brick, fav)
  } else {
    setBrickFavButtonStyle(brick, fav);
    brick.attr("fav", "")
  }
}

function setBrickFavButtonStyle(parent, fav) {
  if(fav) {
    parent.find(".brickFav").removeClass("btn-default").addClass("btn-info")
  } else {
    parent.find(".brickFav").removeClass("btn-info").addClass("btn-default")
  }
}

function like(mediaID, forceLike) {
  if(!isUserLoggedIn()) {
    showLogin();
    return
  }
  if(mediaID) {
    var brick = getBrick(mediaID);
    if(brick.attr("liked") == "true" && !forceLike) {
      setBrickLike(brick, false)
    } else {
      setBrickLike(brick, true)
    }
  } else {
    var mediaElement = $(".mediaDetailContainer").children(".mediaDetail");
    var mediaID = mediaElement.attr("mediaid");
    var brick = getBrick(mediaID);
    if(brick.attr("liked") == "true" && !forceLike) {
      mediaElement.find(".likeButton .text").text(MultiViewLang.Like);
      mediaElement.find(".likeButton").removeClass("liked");
      minusOne(mediaElement.find(".likeButton .count"));
      setBrickLike(brick, false)
    } else {
      mediaElement.find(".likeButton .text").text(MultiViewLang.Liked);
      mediaElement.find(".likeButton").addClass("liked");
      if(brick.attr("liked") != "true") {
        addOne(mediaElement.find(".likeButton .count"))
      }
      setBrickLike(brick, true)
    }
  }
}

function setBrickLike(brick, like) {
  var mediaID = brick.attr("mediaid");
  var media = getMediaByID(mediaID);
  media.user_has_liked = like;
  if(like && brick.attr("liked") != "true") {
    $.ajax({
      url: rootUrl + "/MultiView/LikeMedia",
      data: {
        mediaID: hideMedia(mediaID)
      },
      type: "POST",
      success: function(data) {
        console.log('success:post MultiView/LikeMedia:' + data)
      },
      error: function(data) {
        console.log('error:post MultiView/LikeMedia:' + data)
      }
    });
    addOne(brick.find(".likesCount"))
  } else if(!like && brick.attr("liked") == "true") {
    $.ajax({
      url: rootUrl + "/MultiView/UnlikeMedia",
      data: {
        mediaID: hideMedia(mediaID)
      },
      type: "POST",
      success: function(data) {
        console.log('success:post MultiView/UnlikeMedia:' + data)
      },
      error: function(data) {
        console.log('error:post MultiView/UnlikeMedia:' + data)
      }
    });
    minusOne(brick.find(".likesCount"))
  }
  setBrickLikedStyle(brick, like)
}

function setBrickLikedStyle(brick, liked) {
  if(liked) {
    brick.find(".brickLike").addClass("liked");
    brick.find(".likesCount").css("background", "url('http://pinsta.me/Content/MultiView/isliked.png') no-repeat");
    brick.attr("liked", "true");
    if(!isAppendingBatch && !isBooting) {
      var alertOffset = {
        top: 0,
        left: 0
      };
      var brickPic = null;
      if(!showingMediaDetail) {
        brickPic = brick.find(".pic")
      } else {
        brickPic = $("#mediaDetail").find(".bigPhoto")
      }
      var brickPicOffset = brickPic.offset();
      alertOffset.top = brickPicOffset.top + brickPic.height() / 2.0 - ($(".likedAlert").height() / 2);
      alertOffset.left = brickPicOffset.left + brickPic.width() / 2.0 - $(".likedAlert").width() / 2;
      $(".likedAlert").css(alertOffset);
      if(likedAlertFadeOutTimeoutID > 0) {
        clearTimeout(likedAlertFadeOutTimeoutID)
      }
      $(".likedAlert").stop().hide().fadeIn("fast");
      likedAlertFadeOutTimeoutID = setTimeout(function() {
        $(".likedAlert").fadeOut();
        likedAlertFadeOutTimeoutID = 0
      }, 800)
    }
  } else {
    brick.find(".brickLike").removeClass("liked");
    brick.find(".likesCount").css("background", "url('" + rootUrl + "/Content/MultiView/like.png') no-repeat");
    brick.attr("liked", "")
  }
}

function showLogin() {
  $('#loginFormModal').modal({
    show: true
  });
  showingLoginForm = true
}

function hideLogin() {
  $('#loginFormModal').modal('hide');
  showingLoginForm = false
}

function addOne(element) {
  var value = parseInt(element.text());
  element.text(value + 1)
}

function minusOne(element) {
  var value = parseInt(element.text());
  element.text(value - 1)
}

function getMediaByID(mediaID) {
  for(var i = 0; i < mediaJson.length; i++) {
    var media = mediaJson[i];
    if(media.id == mediaID) {
      return media
    }
  }
  return null
}

function getBrick(mediaID) {
  return $("#brick-" + mediaID)
}

function isUserLoggedIn() {
  return typeof(instagramUserInfo) != "undefined" && instagramUserInfo != null
}

function getLoggedInInstagramUserInfo() {
  if(isUserLoggedIn()) {
    return instagramUserInfo
  }
  return null
}

function hideNote() {
  $.cookie('hideNote', 'true', {
    expires: 30,
    path: '/'
  });
  $(".note").slideUp()
}

function showLoadingContent() {
  $(".loadingContent").css({
    opacity: 1.0
  })
}

function hideLoadingContent() {
  $(".loadingContent").css({
    opacity: 0.0
  })
}
var SizeClass = {
  XS: {
    name: "xs",
    width: 0
  },
  SM: {
    name: "sm",
    width: 768
  },
  MD: {
    name: "md",
    width: 992
  },
  LG: {
    name: "lg",
    width: 1200
  },
  XL: {
    name: "xl",
    width: 1500
  },
  XXL: {
    name: "xxl",
    width: 1800
  }
};
var sizeClasses = [SizeClass.XS, SizeClass.SM, SizeClass.MD, SizeClass.LG, SizeClass.XL, SizeClass.XXL];

function isScreenSmall() {
  return $(window).width() < 992
}

function screenSizeClass() {
  var w = getViewport()[0];
  var ss = SizeClass.XS;
  for(var i = 1; i < sizeClasses.length; i++) {
    if(w >= sizeClasses[i].width) {
      ss = sizeClasses[i]
    }
  }
  return ss
}

function getViewport() {
  var viewPortWidth;
  var viewPortHeight;
  if(typeof window.innerWidth != 'undefined') {
    viewPortWidth = window.innerWidth, viewPortHeight = window.innerHeight
  } else if(typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
    viewPortWidth = document.documentElement.clientWidth, viewPortHeight = document.documentElement.clientHeight
  } else {
    viewPortWidth = document.getElementsByTagName('body')[0].clientWidth, viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
  }
  return [viewPortWidth, viewPortHeight]
}

function wallBricks() {
  return $(".wall .brick")
}

function getMediaIndexByID(mediaID) {
  for(var i = 0; i < mediaJson.length; i++) {
    var media = mediaJson[i];
    if(media.id == mediaID) {
      return i
    }
  }
  return -1
}

function getMediaByIndex(index) {
  if(index < 0) {
    return null
  }
  if(index > mediaJson.length - 1) {
    return null
  }
  return mediaJson[index]
}

function scrollWindowToBrick(mediaID) {
  var brickTop = $("#brick-" + mediaID).offset().top;
  var windowHeight = $(window).height();
  $("html:not(:animated),body:not(:animated)").animate({
    scrollTop: brickTop - 50
  }, 300)
}

function isChildElement(elem, parent) {
  var parentElem = parent.get(0);
  var elemParent = elem;
  while(elemParent.length > 0) {
    if(elemParent.get(0) == parentElem) {
      return true
    }
    elemParent = elemParent.parent()
  }
  return false
}

function hideMedia(mediaID) {
  var k = 0;
  while(k == 0) {
    k = Math.floor(Math.random() * 10)
  }
  var a = Math.floor(Math.log(k) / Math.log(2));
  var b = k - Math.pow(2, a);
  var out = [];
  out.push(a.toString());
  out.push(b.toString());
  for(var i = 0; i < mediaID.length; i++) {
    var v = mediaID[i];
    if(!isNaN(v)) {
      var f = Math.floor(v / k);
      var s = v % k;
      out.push(f.toString());
      out.push(s.toString())
    } else {
      out.push(v)
    }
  }
  return out.join("")
}

function encSuf(encoded) {
  var validation = 0;
  var add = true;
  var x = -3;
  for(var i = 0; i < encoded.length; i++) {
    var c = encoded.charAt(i);
    var v = parseInt(c);
    if(!isNaN(v)) {
      if(add) {
        validation += v * x
      } else {
        validation -= v * x
      }
      add = !add;
      x++
    }
  }
  return "." + validation.toString()
}
var dateFormat = function() {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function(val, len) {
      val = String(val);
      len = len || 2;
      while(val.length < len) val = "0" + val;
      return val
    };
  return function(date, mask, utc) {
    var dF = dateFormat;
    if(arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined
    }
    date = date ? new Date(date) : new Date;
    if(isNaN(date)) throw SyntaxError("invalid date");
    mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    if(mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true
    }
    var _ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d: d,
        dd: pad(d),
        ddd: dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(L > 99 ? Math.round(L / 10) : L),
        t: H < 12 ? "a" : "p",
        tt: H < 12 ? "am" : "pm",
        T: H < 12 ? "A" : "P",
        TT: H < 12 ? "AM" : "PM",
        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };
    return mask.replace(token, function($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
    })
  }
}();
dateFormat.masks = {
  "default": "ddd mmm dd yyyy HH:MM:ss",
  shortDate: "m/d/yy",
  mediumDate: "mmm d, yyyy",
  longDate: "mmmm d, yyyy",
  fullDate: "dddd, mmmm d, yyyy",
  shortTime: "h:MM TT",
  mediumTime: "h:MM:ss TT",
  longTime: "h:MM:ss TT Z",
  isoDate: "yyyy-mm-dd",
  isoTime: "HH:MM:ss",
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};
dateFormat.i18n = {
  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
Date.prototype.format = function(mask, utc) {
  return dateFormat(this, mask, utc)
};

function DateStringFromNow(dt) {
  var mss = (new Date()).getTime() - dt.getTime();
  var ss = Math.floor(mss / 1000);
  var ms = Math.floor(ss / 60);
  var hs = Math.floor(ms / 60);
  var ds = Math.floor(hs / 24);
  var ws = Math.floor(ds / 7);
  var months = Math.floor(ds / 30);
  if(ds > 60) {
    return dateFormat(dt, "yyyy/m/dd h:MM")
  } else if(ds >= 30) {
    return "1" + MultiViewLang.MonthsAgo
  } else if(ds >= 21) {
    return "3" + MultiViewLang.WeeksAgo
  } else if(ds >= 14) {
    return "2" + MultiViewLang.WeeksAgo
  } else if(ds >= 7) {
    return "1" + MultiViewLang.WeeksAgo
  } else if(ds >= 1) {
    return ds.toString() + MultiViewLang.DaysAgo
  } else if(hs >= 1) {
    return hs.toString() + MultiViewLang.HoursAgo
  } else if(ms >= 1) {
    return ms.toString() + MultiViewLang.MinutesAgo
  } else if(ss > 1) {
    return ss.toString() + MultiViewLang.SecondsAgo
  } else {
    return MultiViewLang.JustNow
  }
}

function emojilize(element) {
  if(!isSafari) {
    element.find('.emojstext').each(function() {
      var $text = $(this);
      var html = $text.html();
      $text.html(jEmoji.unifiedToHTML(html))
    })
  }
}

function goTop() {
  if(showingMediaDetail && isScreenSmall()) {
    $(".mediaDetailModal").animate({
      scrollTop: 0
    }, 300)
  } else {
    scrollToElement($('body'))
  }
}

function scrollToElement(element) {
  var brickTop = element.offset().top;
  $("html:not(:animated),body:not(:animated)").animate({
    scrollTop: brickTop - 34
  }, 300)
}

function tweetfyHtml(element) {
  if(element) {
    var html = element.html();
    if(html) {
      html = html.replace(/@([^\s#@.,:"!?~<>]*)/g, "<a href='" + userPageBaseUrl + "/$1' target='_blank'>@$1</a>");
      html = html.replace(/#([^\s#@.,:"!?~<>]*)/g, "<a href='" + searchTagBaseUrl + "/$1' target='_blank'>#$1</a>");
      element.html(html)
    }
  }
}

function getMinValueIndex(arr, startIdx) {
  var idx = 0;
  if(startIdx) {
    idx = startIdx
  }
  for(var i = idx + 1; i < arr.length; i++) {
    if(arr[i] < arr[idx]) {
      idx = i
    }
  }
  return idx
}
