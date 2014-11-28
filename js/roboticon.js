var snap;
var face;
var templates;
var blinkingInterval = 4000;
var blinkingTimeout;

ensureWithinRange = function(variable, min, max) {
  // default values
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return Math.min(Math.max(variable, min), max);
}

animateEyeballsDirection = function(degrees, intensities, duration) {
  if (duration == undefined) duration = 100;
  // The eyes can move within a circle of 18
  if (typeof degrees === 'number') degrees = {left: degrees, right: degrees};
  if (typeof intensities === 'number') intensities = {left: intensities, right: intensities};

  Object.keys(degrees).forEach(function(side) {
    x = Math.sin(degrees[side] * Math.PI / 180) * 18 * ensureWithinRange(intensities[side]);
    y = Math.cos(degrees[side] * Math.PI / 180) * 18 * ensureWithinRange(intensities[side]);

    face.eyeballs[side].group.stop().animate({
      transform: (new Snap.Matrix()).translate(x, y)
    }, duration, mina.easein);
  })
}

animateEyebrowsShape = function(new_shapes, duration) {
  if (duration == undefined) duration = 100;
  if (typeof new_shapes === 'string') new_shapes = {left: new_shapes, right: new_shapes};

  Object.keys(new_shapes).forEach(function(side) {
    face.eyebrows[side].stop().animate({
      d: templates.eyebrows[side][new_shapes[side]].attr('d')
    }, duration, mina.easeinout);
  })
}

animateEyebrowsTurn = function(degrees, duration) {
  if (duration == undefined) duration = 100;
  if (typeof degrees === 'number') degrees = {left: degrees, right: -degrees};

  Object.keys(degrees).forEach(function(side) {
    boundingBox = face.eyebrows[side].getBBox();
    face.eyebrows[side].stop().animate({
      transform: (new Snap.Matrix()).rotate(degrees[side], boundingBox.cx, boundingBox.cy)
    }, duration, mina.easeout)
  })
}

animateEyebrowsHeight = function(heights, duration) {
  if (duration == undefined) duration = 100;
  if (typeof heights === 'number') heights = {left: heights, right: heights};

  Object.keys(heights).forEach(function(side) {
    // -19 is the lowest good looking position for the eyebrows,
    // +10 is the highest one, therefore norm height to:
    height = - (ensureWithinRange(heights[side]) * 29 - 10);

    face.eyebrows[side].stop().animate({
      transform: (new Snap.Matrix()).translate(0, height)
    }, duration, mina.easeout)
  })
}

animateEyelids = function(closedness, duration) {
  if (duration == undefined) duration = 100;
  if (typeof closedness === 'number') closedness = {left: closedness, right: closedness};

  Object.keys(closedness).forEach(function(side) {
    if (typeof closedness[side] === 'number') {
      translation = new Snap.Matrix();
      translation.translate(0, ensureWithinRange(closedness[side]) * 52);
    } else {
      translation = closedness[side];
    };
    face.eyelids[side].stop().animate({
      transform: translation
    }, duration, mina.easeout);
  })
}

animateMouth = function(emotion, duration) {
  if (duration == undefined) duration = 100;
  face.mouth.stop().animate({
    d: templates.mouth[emotion].attr('d')
  }, duration, mina.easeinout);
}

setFace = function(emotion) {
  console.log(emotion + " face!!");
}

blinkEyes = function() {
  closingDuration = 50;
  closedDuration = 100;
  openingDuration = 80;

  normalOpeness = {};
  ['left', 'right'].forEach(function(side) {
    normalOpeness[side] = face.eyelids[side].attr('transform').toString();
  })
  animateEyelids(1, closingDuration);
  setTimeout(function(){animateEyelids(normalOpeness, openingDuration)}, closingDuration + closedDuration);
}

blinkEyesInIntervals = function() {
  blinkEyes();
  blinkingTimeout = setTimeout(blinkEyesInIntervals, blinkingInterval);
}

updateBlinkingInterval = function(newBlinkingInterval) {
  clearTimeout(blinkingTimeout);
  blinkingInterval = newBlinkingInterval;
  setTimeout(blinkEyesInIntervals, newBlinkingInterval / 2);
}

parseAndApplyJson = function(json) {
  i = input = JSON.parse(json);
  duration = 100;

  if (input.eyebrows) {
    ['left', 'right'].forEach(function(side){
      if (input.eyebrows[side]) {
        if (new_shape = input.eyebrows[side].shape)
          animateEyebrowsShape(new_shape, duration);
        if (rotation = input.eyebrows[side].rotation)
          animateEyebrowsTurn(rotation, duration);
        if (height = input.eyebrows[side].height)
          animateEyebrowsHeight(height, duration);
      }
    });
    if (new_color = input.eyebrows.color)
      console.warn('Color changing for eyebrows is not yet implemented.');
  }

  if (input.eyelids) {
    ['left', 'right'].forEach(function(side){
      if (input.eyelids[side]) {
        if (height = input.eyelids[side].height) animateEyelids(height, duration);
      }
    });
    if (newBlinkingInterval = input.eyelids.blinking_interval)
      updateBlinkingInterval(newBlinkingInterval);
  }

  if (input.eyeballs) {
    ['left', 'right'].forEach(function(side){
      if (input.eyeballs[side]) {
        if (input.eyeballs[side].position) {
          if ((direction = input.eyeballs[side].position.direction) && (intensity = input.eyeballs[side].position.intensity))
            animateEyeballsDirection(direction, intensity, duration);
        }
        if (new_color = input.eyeballs[side].color)
          console.warn('Color changing for eyeballs is not yet implemented.');
      }
    });
  }

  if (input.mouth) {
    if (emotion = input.mouth.emotion)
      animateMouth(emotion, duration);
  }

  if (input.hair) {
    if (new_color = input.hair.color)
      console.warn('Color changing for hair is not yet implemented.');
  }

  if (input.skin) {
    if (new_color = input.skin.color)
      console.warn('Color changing for skin is not yet implemented.');
  }
}

keypressed = function(e) {
  switch (e.keyCode) {
    case 81: // q
    console.log('`q` pressed');
    setFace('happy');
    break;
    case 87: // w
    console.log('`w` pressed');
    setFace('angry');
    break;
    case 69: // e
    console.log('`e` pressed');
    setFace('sad');
    break;
    case 82: // r
    console.log('`r` pressed');
    setFace('uncertain');
    break;
    case 84: // r
    console.log('`r` pressed');
    setFace('neutral');
    break;
  }
}

setFaces = function() {
  face = {
    eyebrows: {
      left: snap.select('#eyebrow-left-animated'),
      right: snap.select('#eyebrow-right-animated')
    },
    eyelids: {
      left: snap.select('#eye-left-lid'),
      right: snap.select('#eye-right-lid')
    },
    eyeballs: {
      left: {
        iris: snap.select('#eye-left-iris'),
        pupil: snap.select('#eye-left-pupil'),
        group: snap.select('#eyeball-left')
      },
      right: {
        iris: snap.select('#eye-right-iris'),
        pupil: snap.select('#eye-right-pupil'),
        group: snap.select('#eyeball-right')
      }
    },
    mouth: snap.select('#mouth-animated')
  };

  templates = {eyebrows: {left: {}, right: {}}, mouth: {}};
  ['neutral', 'happy', 'angry', 'sad', 'uncertain'].forEach(function(emotion) {
    templates.mouth[emotion] = snap.select('#mouth-' + emotion)
  });
  ['angular', 'round'].forEach(function(shape) {
      templates.eyebrows.left[shape] = snap.select('#eyebrow-left-' + shape);
      templates.eyebrows.right[shape] = snap.select('#eyebrow-right-' + shape);
  });
}

$(document).ready(function() {
  $('.face').height($(document).height() - 20);
});

$('#face-container').load(function() {
  snap = Snap('#face-container');
  setFaces();
  clearTimeout(blinkingTimeout);
  blinkEyesInIntervals();

  $(document).keydown(keypressed);
})
