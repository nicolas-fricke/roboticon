var RobotIcon = (function () {
  var snap;
  var face;
  var templates;
  var blinkingInterval = 4000;
  var blinkingTimeout;

  function ensureWithinRange(variable, min, max) {
    // default values
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return Math.min(Math.max(variable, min), max);
  }

  function mergeIntoLeftRight(values) {
    if (bothSides = values.both_sides) {
      if (typeof bothSides === 'object')
        return {
          left:  jQuery.extend(true, {}, bothSides, values.left),
          right: jQuery.extend(true, {}, bothSides, values.right)
        };
      return {left: values.left || bothSides, right: values.right || bothSides};
    }
    return values;
  }

  function animateEyeballsDirection(positions, duration) {
    positions = mergeIntoLeftRight(positions);
    if (duration == undefined) duration = 100;

    Object.keys(positions).forEach(function(side) {
      var intensity = ensureWithinRange(positions[side].intensity);
      // The eyes can move within a circle of 18
      var x = Math.sin(positions[side].direction * Math.PI / 180) * 18 * intensity;
      var y = Math.cos(positions[side].direction * Math.PI / 180) * 18 * intensity;

      face.eyeballs[side].group.obj.stop().animate({
        transform: (new Snap.Matrix()).translate(x, y)
      }, duration, mina.easein);
      face.eyeballs[side].group.val.direction = positions[side].direction;
      face.eyeballs[side].group.val.intensity = intensity;
    })
  }

  function animateEyebrowsShape(new_shapes, duration) {
    var new_shapes = mergeIntoLeftRight(new_shapes);
    if (duration == undefined) duration = 100;

    Object.keys(new_shapes).forEach(function(side) {
      face.eyebrows[side].obj.animate({
        d: templates.eyebrows[side][new_shapes[side]].attr('d')
      }, duration, mina.easeinout);
      face.eyebrows[side].val.shape = new_shapes[side];
    })
  }

  function animateEyebrowsTransform(transform, duration) {
    transform = mergeIntoLeftRight(transform);
    if (duration == undefined) duration = 100;

    Object.keys(transform).forEach(function(side) {
      var transformMatrix = new Snap.Matrix();
      var rotation, height;

      if (rotation = transform[side].rotation) {
        var boundingBox = face.eyebrows[side].obj.getBBox();
        transformMatrix.rotate(side === 'right' ? -rotation : rotation, boundingBox.cx, boundingBox.cy)
        face.eyebrows[side].val.rotation = rotation;
      }

      if (height = transform[side].height) {
            // -19 is the lowest good looking position for the eyebrows,
            // +10 is the highest one, therefore norm height to:
            height = - (ensureWithinRange(height) * 29 - 10);
            transformMatrix.translate(0, height);
            face.eyebrows[side].val.height = height;
      }

      face.eyebrows[side].obj.animate({
        transform: transformMatrix
      }, duration, mina.easeout);
      face.eyebrows[side].val.transform = jQuery.extend(true, {}, face.eyebrows[side].val.transform, transform[side]);
    })
  }

  function animateEyelids(heights, duration, dontSetValues) {
    heights = mergeIntoLeftRight(heights);
    if (duration == undefined) duration = 100;

    Object.keys(heights).forEach(function(side) {
      var translation = new Snap.Matrix();
      translation.translate(0, ensureWithinRange(heights[side]) * 52);
      face.eyelids[side].obj.animate({
        transform: translation
      }, duration, mina.easeout);
      if (! dontSetValues) face.eyelids[side].val.height = heights[side];
    })
  }

  function animateMouth(emotion, duration) {
    if (duration == undefined) duration = 100;
    face.mouth.obj.stop().animate({
      d: templates.mouth[emotion].attr('d')
    }, duration, mina.easeinout);
    face.mouth.val.emotion = emotion;
  }

  function blinkEyes() {
    var closingDuration = 50;
    var closedDuration = 100;
    var openingDuration = 80;

    var normalClosedness = {};
    ['left', 'right'].forEach(function(side) {
      normalClosedness[side] = face.eyelids[side].val.height;
    });
    animateEyelids({left: 1, right: 1}, closingDuration, true);
    setTimeout(function(){animateEyelids(normalClosedness, openingDuration, true)}, closingDuration + closedDuration);
  }

  function blinkEyesInIntervals() {
    blinkEyes();
    blinkingTimeout = setTimeout(blinkEyesInIntervals, blinkingInterval);
  }

  function updateBlinkingInterval(newBlinkingInterval) {
    clearTimeout(blinkingTimeout);
    blinkingInterval = newBlinkingInterval;
    setTimeout(blinkEyesInIntervals, newBlinkingInterval / 2);
  }

  function parseAndApplyJson(json) {
    var input = JSON.parse(json);
    var duration = 100;

    if (input.eyebrows) {
      var newShapes, transform, newColor;
      if (newShapes = input.eyebrows.shapes)
        animateEyebrowsShape(newShapes, duration);
      if (transform = input.eyebrows.transform)
        animateEyebrowsTransform(transform, duration);
      if (newColor = input.eyebrows.color)
        console.warn('Color changing for eyebrows is not yet implemented.');
    }

    if (input.eyelids) {
      var newHeight, newBlinkingInterval;
      if (newHeight = input.eyelids.heights)
        animateEyelids(newHeight, duration);
      if (newBlinkingInterval = input.eyelids.blinking_interval)
        updateBlinkingInterval(newBlinkingInterval);
    }

    if (input.eyeballs) {
      var newPositions, newColors;
      if (newPositions = input.eyeballs.positions)
        animateEyeballsDirection(newPositions, duration);
      if (newColors = input.eyeballs.colors)
        console.warn('Color changing for eyeballs is not yet implemented.');
    }

    if (input.mouth) {
      var emotion;
      if (emotion = input.mouth.emotion)
        animateMouth(emotion, duration);
    }

    if (input.hair) {
      var new_color;
      if (new_color = input.hair.color)
        console.warn('Color changing for hair is not yet implemented.');
    }

    if (input.skin) {
      var new_color;
      if (new_color = input.skin.color)
        console.warn('Color changing for skin is not yet implemented.');
    }
  }

  function setFaces() {
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
          val: {height: 0}
        },
        right: {
          obj: snap.select('#eye-right-lid'),
          val: {height: 0}
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

  function getFace() {
    return face;
  }

  function initialize() {
    var faceContainer = $('.roboticon');
    faceContainer.height(faceContainer.parent().height());
    snap = Snap('.roboticon');
    setFaces();
    updateBlinkingInterval(blinkingInterval);
  }

  return {
    initialize: initialize,
    parseAndApplyJson: parseAndApplyJson,
    blinkEyes: blinkEyes,
    animateEyeballsDirection: animateEyeballsDirection,
    animateEyebrowsShape: animateEyebrowsShape,
    animateEyebrowsTransform: animateEyebrowsTransform,
    animateEyelids: animateEyelids,
    animateMouth: animateMouth,
    updateBlinkingInterval: updateBlinkingInterval,
    __faceValues__: getFace
  };
})();

$('.roboticon').load(function() {
  RobotIcon.initialize();
})
