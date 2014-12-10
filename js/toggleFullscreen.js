var fullscreenControl = (function () {
  var fullscreen = 'nothing';
  var initialHtmlBgColor;
  var initialBodyMargin;
  var initialVideoHeight;
  var initialVideoWidth;

  prepareToggle = function() {
    $('#container').hide();
    $('#container-fullscreen-video').hide();
    $('#container-fullscreen-roboticon').hide();
  }
  prepareFullscreen = function() {
    initialHtmlBgColor = initialHtmlBgColor || $('html').css('background-color');
    $('html').css('background-color', 'black');
    initialBodyMargin = initialBodyMargin || $('body').css('margin');
    $('body').css('margin', 0);
    initialVideoHeight = initialVideoHeight || $('#remoteVideo').css('height');
    initialVideoWidth = initialVideoWidth || $('#remoteVideo').css('width');
    prepareToggle();
  }
  prepareNormal = function() {
    $('html').css('background-color', initialHtmlBgColor);
    $('#remoteVideo').css('height', initialVideoHeight);
    $('#remoteVideo').css('width', initialVideoWidth);
    $('body').css('margin', initialBodyMargin);
    prepareToggle();
  }

  setFullscreenNone = function() {
    prepareNormal();
    $('#remote-video-container').append($('#remoteVideo'));

    $('#container').show();
    fullscreen = 'nothing';
  }
  setVideoFullscreen = function() {
    prepareFullscreen();
    $('#container-fullscreen-video').append($('#remoteVideo')).show();
    $('#remoteVideo').width($(window).width());
    $('#remoteVideo').height($(window).height());
    fullscreen = 'video';
  }
  setRoboticonFullscreen = function() {
    prepareFullscreen();
    $('#container-fullscreen-roboticon').show();
    $('.roboticon').height($(window).height());
    fullscreen = 'roboticon';
  }

  toggleFullscreen = function() {
    switch (fullscreen) {
      case 'nothing':
        setVideoFullscreen();
        break;
      case 'video':
        setRoboticonFullscreen();
        break;
      case 'roboticon':
        setFullscreenNone();
        break;
    }
    console.log('toggeling fullscreen to ' + fullscreen + '!');
  }

  keyHandler = function(e) {
    var tag = e.target.tagName.toLowerCase();
    if (e.which === 84 && tag != 'input' && tag != 'textarea')
      toggleFullscreen();
  }

  // Bind keyhandler for toggle on prssing "T" (robot side)
  $('body').keyup(keyHandler);

  return {
    toggle: toggleFullscreen,
    setNone: setFullscreenNone,
    setVideo: setVideoFullscreen,
    setRoboticon: setRoboticonFullscreen
  };
})();
