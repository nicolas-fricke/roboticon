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

    face.eyeballs[side].group.obj.stop().animate({
      transform: (new Snap.Matrix()).translate(x, y)
    }, duration, mina.easein);
    face.eyeballs[side].group.val.direction = degrees[side];
    face.eyeballs[side].group.val.intensity = intensities[side];
  })
}

animateEyebrowsShape = function(new_shapes, duration) {
  if (duration == undefined) duration = 100;
  if (typeof new_shapes === 'string') new_shapes = {left: new_shapes, right: new_shapes};

  Object.keys(new_shapes).forEach(function(side) {
    face.eyebrows[side].obj.animate({
      d: templates.eyebrows[side][new_shapes[side]].attr('d')
    }, duration, mina.easeinout);
    face.eyebrows[side].val.shape = new_shapes[side];
  })
}

animateEyebrowsTurn = function(degrees, duration) {
  if (duration == undefined) duration = 100;
  if (typeof degrees === 'number') degrees = {left: degrees, right: -degrees};

  Object.keys(degrees).forEach(function(side) {
    boundingBox = face.eyebrows[side].obj.getBBox();
    face.eyebrows[side].obj.animate({
      transform: (new Snap.Matrix()).rotate(degrees[side], boundingBox.cx, boundingBox.cy)
    }, duration, mina.easeout);
    face.eyebrows[side].val.rotation = degrees[side];
  })
}

animateEyebrowsHeight = function(heights, duration) {
  if (duration == undefined) duration = 100;
  if (typeof heights === 'number') heights = {left: heights, right: heights};

  Object.keys(heights).forEach(function(side) {
    // -19 is the lowest good looking position for the eyebrows,
    // +10 is the highest one, therefore norm height to:
    height = - (ensureWithinRange(heights[side]) * 29 - 10);

    face.eyebrows[side].obj.animate({
      transform: (new Snap.Matrix()).translate(0, height)
    }, duration, mina.easeout);
    face.eyebrows[side].val.height = heights[side];
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
    face.eyelids[side].obj.stop().animate({
      transform: translation
    }, duration, mina.easeout);
    face.eyelids[side].val.closedness = closedness[side];
  })
}

animateMouth = function(emotion, duration) {
  if (duration == undefined) duration = 100;
  face.mouth.obj.stop().animate({
    d: templates.mouth[emotion].attr('d')
  }, duration, mina.easeinout);
  face.mouth.val.emotion = emotion;
}

setFace = function(emotion) {
  console.log(emotion + " face!!");
}

blinkEyes = function() {
  closingDuration = 50;
  closedDuration = 100;
  openingDuration = 80;

  normalClosedness = {};
  ['left', 'right'].forEach(function(side) {
    normalClosedness[side] = face.eyelids[side].val.closedness;
  });
  animateEyelids(1, closingDuration);
  setTimeout(function(){animateEyelids(normalClosedness, openingDuration)}, closingDuration + closedDuration);
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
      left: {
        obj: snap.select('#eyebrow-left-animated'),
        val: {shape: 'angular', rotation: 0, height: 0.35}
      },
      right: {
        obj: snap.select('#eyebrow-right-animated'),
        val: {shape: 'angular', rotation: 0, height: 0.35}
      }
    },
    eyelids: {
      left: {
        obj: snap.select('#eye-left-lid'),
        val: {closedness: 0}
      },
      right: {
        obj: snap.select('#eye-right-lid'),
        val: {closedness: 0}
      }
    },
    eyeballs: {
      left: {
        iris: {obj: snap.select('#eye-left-iris')},
        pupil: {obj: snap.select('#eye-left-pupil')},
        group: {
          obj: snap.select('#eyeball-left'),
          val: {direction: 0, intensity: 0}
        }
      },
      right: {
        iris: {obj: snap.select('#eye-right-iris')},
        pupil: {obj: snap.select('#eye-right-pupil')},
        group: {
          obj: snap.select('#eyeball-right'),
          val: {direction: 0, intensity: 0}
        }
      }
    },
    mouth: {
      obj: snap.select('#mouth-animated'),
      val: {emotion: 'neutral'}
    }
  }

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
  updateBlinkingInterval(blinkingInterval);

  $(document).keydown(keypressed);
})
