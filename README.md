# Text-Gradiator

## Put gradients on your text

Text-Gradiator is a javascript library that allows you to easily put gradients on text elements.

When designers are looking to add gradients to their text, they often resort to using an <img> element. While this solution technically works, there are a number of caveats. It may effect your search engine optimization, and it could cause problems for people who use screen readers. It can also require you to write a lot of extra markup and css. Plus, you have to create the image in an image editor.

With Text-Gradiator, you don't have to worry about any of that.

### How to use it:

Include it in you page:
```html
<script src="js/text-gradiator.min.js"></script>
```

Give the element(s) you want to apply gradients to a unique class or ID
```html
<h1 class="blue-grad">TITLE</h1>
```

After the window.onload event, run this code to apply the gradients:
```javascript
gradiator.gradiate('.blue-grad', '#3ad7ff', '#0d84cc', false);
```

The first parameter is the `.class` or `#id` of the element(s) you are applying the gradient to.

The second parameter is the top color of the gradient

The third parameter is the bottom color, as you probably already guessed.

The last parameter is a boolean that tells Text-Gradiator whether or not to prefer css. If you have are using text-shadow, you will want to keep it set to `false`. Otherwise, you might get some crazy results.

### How it works:
Text-Gradiator creates a `canvas` element with many of the same display properties as your original text element and inserts it into the page. Then it fills the text with a gradient using the colors of your choice. It will use the same font and even apply a `text-shadow` if you are using one. Please, note that [Safari has a bug](https://twitter.com/zaffkea/status/596465921960599552), and cannot display text shadows around a gradient fill. Then, it gives the original text element a class of `.tg-sr-only`. This will hide it from most viewers, while still making it accessible to screen readers.
