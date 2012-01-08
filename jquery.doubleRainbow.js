/**
 * jQuery Double Rainbow Plugin 1.0.0
 * For creating visual call to actions when a user's mouse
 * enters varying proximity ranges of the matching element(s). The call to
 * action is a change in color gradient.
 *
 * Copyright (c) 2011 Corey Ballou
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {

  var opts, gradient = {}, itemCache = [], numGradients = 0;

  $.fn.doubleRainbow = function(options, callback) {
    // merge options with defaults
    opts = $.extend({}, $.fn.doubleRainbow.defaults, options);

    // validate the hex
    if (opts.startBgColor) opts.startBgColor = validateHex(opts.startBgColor);
    if (opts.startColor) opts.startColor = validateHex(opts.startColor);
    if (opts.endBgColor) opts.endBgColor = validateHex(opts.endBgColor);
    if (opts.endColor) opts.endColor = validateHex(opts.endColor);

    // precalculate color gradients and ranges
    var bgGradient = get_gradient(opts.startBgColor, opts.endBgColor, 'bg');
    var fgGradient = get_gradient(opts.startColor, opts.endColor, 'fg');
    var ranges = get_proximity_ranges();

    gradient = $.extend(true, {}, bgGradient, fgGradient, ranges);
    delete bgGradient, fgGradient, ranges;

    // watch for movement near any bound items
    $(document).mousemove(check_proximity);

    // perform some upfront caching of the items
    return this.each(function() {
      var $item = $(this);
      var pos, dim, center;
      pos = $item.offset();
      dim = { h: $item.height(), w: $item.width() };
      center = { y: pos.top + (dim.h / 2), x: pos.left + (dim.w / 2) }

      // set the initial item color
      var initCss = {};
      if (opts.startBgColor) initCss.backgroundColor = opts.startBgColor;
      if (opts.startColor) initCss.color = opts.startColor;
      $item.css(initCss);

      // add to cache
      itemCache.push({
        elem: $item,
        pos: pos,
        dim: dim,
        center: center
      });

      // watch for click
      $item.click(function(e) {
        if (typeof callback == 'function') {
          callback.call($item);
        }
      });
    });
  }

  /**
   * Check the closeness to each bound item.
   */
  function check_proximity(e) {
    var $item, dist, distY, distX, changeCss = {};
    if (!numGradients) return false;

    // iterate over all matching items
    $.each(itemCache, function() {
      $item = this.elem;
      distY = Math.abs(e.pageY - this.center.y) - (this.dim.h / 2);
      distX = Math.abs(e.pageX - this.center.x) - (this.dim.w / 2);
      dist = (distY < distX ? distX : distY);

      // check if we need to
      if (dist < opts.startDistance) {
        // estimate percentage
        var percent = dist / opts.startDistance;
        // estimate step position
        var pivot = Math.round(opts.steps * percent);
        if (pivot < 0) pivot = 0;
        if (gradient[pivot]) {
          // initially check for a match
          if (!_is_match($item, dist, gradient[pivot])) {
            // determine which way to pivot
            if (dist < gradient[pivot].start) {
              // reverse pivot
              pivot--;
              while (pivot >= 0) {
                if (_is_match($item, dist, gradient[pivot])) {
                  return true;
                }
                pivot--;
              }
            } else if (dist >= gradient[pivot].end) {
              // normal pivot
              pivot++;
              var incNum = numGradients + 1;
              while (pivot <= incNum) {
                if (_is_match($item, dist, gradient[pivot])) {
                  return true;
                }
                pivot++;
              }
            }
            alert('Error: No matching pivot was found. ' + pivot);
          }
        } else {
          alert('Error: No such step exists.');
        }
      } else if (dist >= opts.startDistance) {
        // show the maximum range
        _update_dom($item, gradient[numGradients]);
      }
    });
  }

  /**
   * Check if the given distance matches the particular radius range.
   * Set the colors if a match exists.
   */
  function _is_match($item, dist, row) {
    if (dist >= row.start && dist < row.end) {
      _update_dom($item, row);
      return true;
    }
    return false;
  }

  /**
   * Update a particular DOM elements color.
   */
  function _update_dom($item, row) {
    var changeCss = {};
    if (row.bg) changeCss.backgroundColor = '#' + row.bg;
    if (row.fg) changeCss.color = '#' + row.fg;
    $item.css(changeCss);
  }

  function get_opacity_ranges() {
    var g = {}, gLen = 0, curInterval;
    
    // check if changing opacity
    if (typeof opts.startOpacity == 'number' && typeof opts.endOpacity == 'number') {
      
      // get the opacity intervals
      if (opts.endOpacity > opts.startOpacity) {
        var interval = parseFloat((opts.endOpacity - opts.startOpacity) / opts.steps);
      } else {
        var interval = parseFloat((opts.startOpacity - opts.endOpacity) / opts.steps);
      }
      
      // set the first range
      if (!g[gLen]) g[gLen] = {};
      g[gLen++] = {
        css: {
          opacity: opts.startOpacity,
          '-moz-opacity': opts.startOpacity,
          'filter': 'alpha(opacity=' + parseInt(opts.startOpacity * 100) + ')'
        }
      };
      
      curInterval = opts.startOpacity;
      while (curInterval < opts.endOpacity) {
        
      }
      
    }
    
    
  }

  /**
   * Given a maximum range and a number of interval steps, get the different
   * proximity ranges to associate to hex colors.
   */
  function get_proximity_ranges() {
    var g = {}, gLen = 0, curInterval;

    // get the pixel interval ranges
    var interval = parseFloat(opts.startDistance / opts.steps);
    
    // set the first range
    if (!g[gLen]) g[gLen] = {};
    g[gLen++] = {
      start: 0,
      end: interval
    };

    curInterval = interval;
    while (curInterval < opts.startDistance) {
      // set the range
      if (!g[gLen]) g[gLen] = {};
      g[gLen++] = {
        start: curInterval,
        end: curInterval += interval
      };
    }

    // set the last range as startDistance pixels out
    if (!g[gLen]) g[gLen] = {};
    g[gLen] = {
      start: curInterval,
      end: opts.startDistance
    };

    // return ranges
    return g;
  }

  /**
   * Given a start and end color, return a gradient array occuring over X steps.
   */
  function get_gradient(start_color, end_color, type) {
    var r_diff, g_diff, b_diff, a_diff,
        r_new, g_new, b_new, a_new,
        interval, curInterval, g = {}, gLen = 0, end_color_cache;

    // determine number of shades
    interval = parseFloat(1.0 / opts.steps);

    // add the starting color
    if (!g[gLen]) g[gLen] = {};
    g[gLen++][type] = end_color;

    // cache ending color
    end_color_cache = start_color;

    // avoid calculations if we use the same color
    var samesies = (start_color == end_color) || !start_color || !end_color;
    if (!samesies) {
      // get RGB of start and end colors
      start_color = get_channels(start_color);
      end_color = get_channels(end_color);

      // calculate the color differentials
      r_diff = end_color.r - start_color.r;
      g_diff = end_color.g - start_color.g;
      b_diff = end_color.b - start_color.b;
      a_diff = end_color.a - start_color.a;
    } else {
      if (!start_color && !end_color) {
        // avoid change altogether
      } else if (!start_color) {
        start_color = end_color;
      } else if (!end_color) {
        end_color = start_color;
      }
    }

    // retrieve gradient for each step
    curInterval = 1.0 - interval;
    curInterval = interval;
    while (curInterval < 1.0) {
      if (samesies) {
        if (!g[gLen]) g[gLen] = {};
        g[gLen++][type] = start_color;
      } else {
        r_new = Math.round(curInterval * start_color.r + (1 - curInterval) * end_color.r);
        g_new = Math.round(curInterval * start_color.g + (1 - curInterval) * end_color.g);
        b_new = Math.round(curInterval * start_color.b + (1 - curInterval) * end_color.b);
        a_new = (a_diff * curInterval) + start_color.a;

        if (!g[gLen]) g[gLen] = {};
        var newColor = combine_channels(r_new, g_new, b_new, a_new);
        if (newColor.length == 4) newColor = '00' + newColor;
        g[gLen++][type] = newColor;
      }
      // get color of next interval
      curInterval += interval;
    }

    // add the final color
    if (!g[gLen]) g[gLen] = {};
    g[gLen][type] = end_color_cache;

    // store the maximum gradient length
    numGradients = gLen;

    // return gradient array
    return g;
  }

  /**
   * Given a hex color, split into RGBA channels.
   */
  function get_channels(hex) {
    var channelRgx = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
    return {
      r: parseInt(channelRgx[0], 16),
      g: parseInt(channelRgx[1], 16),
      b: parseInt(channelRgx[2], 16),
      a: hex >> 24
    };
  }

  /**
   * Given the RGBA color channels, combine them back into a hex color.
   */
  function combine_channels(r, g, b, a) {
    var rgb = 1 << 24 | Math.round(r) << 16 | Math.round(g) << 8 | Math.round(b);
    return rgb.toString(16).substr(1);
  }

  /**
   * Ensure we have valid hex colors and expand where necessary.
   */
  function validateHex(color) {
    if (color.substring(0, 1) == '#') color = color.substring(1);
    if (!color.match(/^([0-9a-f]{1,2}){3}$/i)) return false;
    var len = color.length;
    if (len = 3) {
      var chars = [color.charAt(0), color.charAt(1), color.charAt(2)];
      color = chars[0] + chars[0] + chars[1] + chars[1] + chars[2] + chars[2];
    } else if (len != 6) {
      return false;
    }
    return color;
  }

  /**
   * Default options.
   */
  $.fn.doubleRainbow.defaults = {
    startDistance: 500,
    steps: 20,
    startBgColor: '#333333',
    endBgColor: '#999999',
    startColor: '#CCCCCC',
    endColor: '#FFFFFF',
    
    // to be added
    startOpacity: null,
    endOpacity: null,
    borderTopColor: null,
    borderRightColor: null,
    borderBottomColor: null,
    borderLeftColor: null,  
    useBgGradient: false, // whether to use a background gradient
    bgGradientStartPos: 'top',   // top (vertical), left (horizontal)
    bgGradientBgColorStart: null, // starting gradient color
    bgGradientBgColorStartPos: '0%', // 0 - 100%
    bgGradientBgColorEnd: null, // ending gradient color
    bgGradientBgColorEndPos: '100%' // 0 - 100%
  };
})(jQuery);

// example usage
$('#exampleButton').doubleRainbow({
  startColor: '#FFF',
  startBgColor: '#222',
  endColor: '#FFF',
  endBgColor: '#900'
});

/*
background-color: #1a82f7;
background-image: url(images/fallback-gradient.png);
background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#2F2727), to(#1a82f7));
background-image: -webkit-linear-gradient(top, #2F2727, #1a82f7);
background-image:    -moz-linear-gradient(top, #2F2727, #1a82f7);
background-image:     -ms-linear-gradient(top, #2F2727, #1a82f7);
background-image:      -o-linear-gradient(top, #2F2727, #1a82f7);
filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#1471da, endColorstr=#1C85FB);
-ms-filter: "progid:DXImageTransform.Microsoft.gradient (GradientType=0, startColorstr=#1471da, endColorstr=#1C85FB)";
*/