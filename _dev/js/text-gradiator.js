var Gradiator = function() {
  var gradiator = this;
  var resizeTimer;
  var gradCanvases = [];
  var gradSelectors = [];
  var styles = window.getComputedStyle(document.documentElement, '');
  var pre = (Array.prototype.slice
    .call(styles)
    .join('')
    .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
  )[1];

  // create a <style> with a .class to hide the original text elements
  var css = '.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0px; overflow: hidden; clip: rect(0px 0px 0px 0px); border: 0px; display: block; }';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);

  this.addResizeHandler = function(){
    if (window.attachEvent) {
      window.attachEvent('onresize', function() {
        gradiator.resizeGrad();
      });
    } else if (window.addEventListener) {
      window.addEventListener('resize', function() {
        gradiator.resizeGrad();
      }, true);
    }
  };

  this.resizeGrad = function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      while (gradCanvases.length > 0) {
        var gradCanvasObj = gradCanvases.shift();
        gradCanvasObj.canvas.parentNode.removeChild(gradCanvasObj.canvas);
        gradCanvasObj.elem.style.display = gradCanvasObj.display;
      }
      for (var i = 0; i < gradSelectors.length; i++) {
        gradiator.gradiate(gradSelectors[i].selector, gradSelectors[i].topColor, gradSelectors[i].botColor, gradSelectors[i].attemptCSS, false);
      }
    }, 250);
  };

  this.gradiate = function(selector, topColor, botColor, attemptCSS, storeSelectors){
    storeSelectors = typeof storeSelectors !== 'undefined' ? storeSelectors : true;

    attemptCSS = typeof attemptCSS !== 'undefined' ? attemptCSS : true;

    var canvasTest = document.createElement('canvas');
    if (!(canvasTest.getContext && canvasTest.getContext('2d'))){
      return;
    }

    // store the selector for window resize
    if (storeSelectors){
      gradSelectors.push({ 'selector': selector, 'topColor': topColor, 'botColor': botColor, 'attemptCSS': attemptCSS });
    }

    // get the elements that need gradients
    var elements = [];
    var idOrClass = selector.substring(0, 1);
    selector = selector.substr(1);
    if (idOrClass === '.') {
      elements = document.getElementsByClassName(selector);
    }else if (idOrClass === '#') {
      elements.push(document.getElementById(selector));
    } else {
      return;
    }
    for (var i = 0; i < elements.length; i++) {
      // set element var
      var elem = elements[i];

      // remove the .sr-only class so the element is visible
      elem.className = elem.className.replace(/\bsr-only\b/, '');

      // check if you want to use CSS instead of canvas
      // it really is the best option if you don't want
      // text shadow too
      if (pre === 'webkit' && attemptCSS){
        elem.style.background = '-webkit-linear-gradient(' + topColor + ', ' + botColor + ')';
        elem.style.webkitBackgroundClip = 'text';
        elem.style.webkitTextFillColor = 'transparent';
        continue;
      }

      // set the rest of the vars
      var parent = elem.parentNode;
      var props = window.getComputedStyle(elem, null);
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
      var ratio = dpr / backingStoreRatio;
      var cWidth = elem.offsetWidth;
      var cHeight = elem.offsetHeight;
      var cFontSize = parseInt(props.fontSize, 10);
      var cTopOffset = cHeight - cFontSize - parseInt(props.paddingTop, 10) - parseInt(props.paddingBottom, 10);
      var startLeft = parseInt(props.paddingLeft, 10);
      var stopLeft = parseInt(props.paddingRight, 10) + parseInt(props.width, 10);
      var startTop = parseInt(props.paddingTop, 10) + cTopOffset;
      var stopTop = parseInt(props.fontSize, 10) + startTop;
      var grad = ctx.createLinearGradient(startLeft, startTop, startLeft, stopTop);
      var shadowOffsetX = 0;
      var shadowOffsetY = 0;
      var shadowBlur = 0;
      var shadowColor = 'transparent';

      if (props.getPropertyValue('text-shadow') !== 'none') {
        var shadows = props.textShadow.split(') ');
        if (shadows.length > 1) {
          shadowColor = shadows.shift() + ')';
          var offsets = shadows.shift().split(' ');
          shadowOffsetX = parseInt(offsets[0], 10) * ratio;
          shadowOffsetY = parseInt(offsets[1], 10) * ratio;
          shadowBlur = parseInt(offsets[2], 10) * ratio;
        }
      }

      cHeight += shadowOffsetY * 2 + shadowBlur * 2;

      // store the canvases for window resize handline
      gradCanvasObj = { 'canvas': canvas, 'elem': elem, 'display': props.getPropertyValue('display') };
      gradCanvases.push(gradCanvasObj);

      // make adjustments for text-align
      if (props.textAlign === 'center') {
        startLeft = cWidth / 2;
      }else if (props.textAlign === 'right') {
        startLeft = stopLeft;
      }

      // style the canvas to be everything the
      // original element was and more
      if (elem.id) {
        canvas.id = 'gradiated-' + elem.id;
      }

      canvas.style.background = props.background;
      if (!props.background) {
        canvas.style.backgroundColor = props.getPropertyValue('background-color');
        canvas.style.backgroundImage = props.getPropertyValue('background-image');
      }

      canvas.style.position = props.getPropertyValue('position');
      canvas.style.position = 'relative';
      canvas.style.display = props.getPropertyValue('display');
      canvas.style.marginTop = props.getPropertyValue('margin-top');
      canvas.style.marginBottom = props.getPropertyValue('margin-bottom');
      canvas.style.marginRight = props.getPropertyValue('margin-right');
      canvas.style.marginLeft = props.getPropertyValue('margin-left');
      canvas.style.float = props.getPropertyValue('float');

      // insert the canvas just before the element
      parent.insertBefore(canvas, elem);

      // support retina displays
      canvas.width = cWidth * ratio;
      canvas.height = cHeight * ratio;
      canvas.style.width = cWidth + 'px';
      canvas.style.height = cHeight + 'px';
      ctx.scale(ratio, ratio);

      // set the font
      ctx.font = props.fontStyle + ' ' +
      props.fontVariant + ' ' +
      props.fontWeight + ' ' +
      props.fontSize + ' ' +
      props.fontFamily;

      // baseline... not sure if this is right, but I'm
      // going with this for now
      ctx.textBaseline = 'bottom';
      ctx.textBaseline = 'middle';

      // same alignment as original element
      ctx.textAlign = props.textAlign;

      // this is a lot of code just to wrap the text
      var words = elem.textContent.split(' ');
      var line = '';
      var lines = [];

      // loop through the words array and push
      // bits of text to the lines array
      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;

        if (testWidth > cWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // apply the gradient to all the lines of text
      for (var l = 0; l < lines.length; l ++) {
        var gradLine = lines[l];
        var lineHeight = cHeight / lines.length / 2;
        var y = (cHeight - shadowOffsetY - shadowBlur) / lines.length * (l + 1);
        y = y - lineHeight;

        startTop = y - lineHeight;
        stopTop = y + lineHeight;

        if (shadowColor !== 'transparent') {
          ctx.shadowColor = shadowColor;
          ctx.shadowOffsetX = shadowOffsetX;
          ctx.shadowOffsetY = shadowOffsetY;
          ctx.shadowBlur = shadowBlur;

          // tried this to fix Safari's bug with
          // showing text shadows around gradient fills
          // ctx.fillStyle = ctx.shadowColor;
          // ctx.fillText(gradLine, startLeft, y);
          // ctx.shadowColor = 'transparent';

        }

        // make the grade
        grad = ctx.createLinearGradient(startLeft, startTop, startLeft, stopTop);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;

        // finally, fill the text!
        ctx.fillText(gradLine, startLeft, y);
      }

      // add the .sr-only class to hide the original element, and we're done!
      elem.className += ' sr-only';
      elem.style.color = 'transparent';
    }
  };
  this.addResizeHandler();
};

var gradiator = new Gradiator();
