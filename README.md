## About ##

Double Rainbow is a jQuery plugin for creating subtle, mouse-aware call to action effects on elements within your websites.
It currently supports the transitioning of foreground and background colors on things like buttons and anchors as your mouse
moves around a target element. The goal is to bring attention to a call to action button as the user moves closer to the element.

## Options ##

Double Rainbow comes with a number of configurable options. Below you will find the default global configuration options as well as a definition of each option for override purposes.

```js
$.fn.doubleRainbow.defaults = {
    startDistance: 500,
    steps: 20,
    startBgColor: '#333333',
    endBgColor: '#999999',
    startColor: '#CCCCCC',
    endColor: '#FFFFFF'
};
```

* _startDistance:_ The minimum distance from the target element and the mouse which triggers the gradient transition to occur. [integer]
* _steps:_ The number of gradient transition steps (transition colors). [integer]
* _startBgColor:_ The starting HEX background color of the target element. 
* _endBgColor:_ The ending HEX background color of the target element.
* _startColor:_ The starting HEX font color of the target element.
* _endColor:_ The ending HEX font color of the target element.

## Example Usage ##

```javascript
// example usage
$('#exampleButton').doubleRainbow({
  startColor: '#FFF',
  startBgColor: '#222',
  endColor: '#FFF',
  endBgColor: '#900'
});
```

## Future Enhancements ##

Other improvements would be to add additional configuration options for styling and animation. Here's some ideas:

* _Opacity_ - Add the ability to change opacity from `startOpacity` to `endOpacity`.
* _Classes_ - Add the ability to add a class prefix and current step number to the target element.
* _Gradient(s)_ - Add the ability to transition from `startGradient` to `endGradient`.
* _Transforms_ - Add the ability to `move`, `scale`, `turn`, `spin`, and `stretch`.

For something like gradients, use something like $.cssHooks to implement vendor prefix CSS.

http://api.jquery.com/jQuery.cssHooks/

```css
background-color: #1a82f7;
background-image: url(images/fallback-gradient.png);
background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#2F2727), to(#1a82f7));
background-image: -webkit-linear-gradient(top, #2F2727, #1a82f7);
background-image:    -moz-linear-gradient(top, #2F2727, #1a82f7);
background-image:     -ms-linear-gradient(top, #2F2727, #1a82f7);
background-image:      -o-linear-gradient(top, #2F2727, #1a82f7);
filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#1471da, endColorstr=#1C85FB);
-ms-filter: "progid:DXImageTransform.Microsoft.gradient (GradientType=0, startColorstr=#1471da, endColorstr=#1C85FB)";
```