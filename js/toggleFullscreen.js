var fullscreenControl = (function () {
  var fullscreen = 'nothing';
  var initialHtmlBgColor;
  var initialBodyMargin;
  var initialVideoHeight;
  var initialVideoWidth;

  function prepareToggle() {
    $('#container').hide();
    $('#container-fullscreen-video').hide();
    $('#container-fullscreen-roboticon').hide();
  }
  function prepareFullscreen() {
    initialHtmlBgColor = initialHtmlBgColor || $('html').css('background-color');
    $('html').css('background-color', 'black');
    initialBodyMargin = initialBodyMargin || $('body').css('margin');
    $('body').css('margin', 0);
    initialVideoHeight = initialVideoHeight || $('#remoteVideo').css('height');
    initialVideoWidth = initialVideoWidth || $('#remoteVideo').css('width');
    prepareToggle();
  }
  function prepareNormal() {
    $('html').css('background-color', initialHtmlBgColor);
    $('#remoteVideo').css('height', initialVideoHeight);
    $('#remoteVideo').css('width', initialVideoWidth);
    $('body').css('margin', initialBodyMargin);
    prepareToggle();
  }

  function setFullscreenNone() {
    prepareNormal();
    $('#remote-video-container').append($('#remoteVideo'));

    $('#container').show();
    fullscreen = 'nothing';
  }
  function setVideoFullscreen() {
    prepareFullscreen();
    $('#container-fullscreen-video').append($('#remoteVideo')).show();
    $('#remoteVideo').width($(window).width());
    $('#remoteVideo').height($(window).height());
    fullscreen = 'video';
  }
  function setRoboticonFullscreen() {
    prepareFullscreen();
    $('#container-fullscreen-roboticon').show();
    $('.roboticon').height($(window).height());
    fullscreen = 'roboticon';
  }

  function toggleFullscreen() {
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

  function keyHandler(e) {
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
