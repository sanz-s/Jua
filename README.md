
# Jua.js

**Jua.js** is a lightweight JavaScript library designed to simplify DOM manipulation, utility operations, and web development tasks. Its versatile API and modular structure make it easy to integrate into projects of all sizes.

---

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
- [API Documentation](#api-documentation)
  - [Type Detection](#type-detection)
  - [DOM Manipulation](#dom-manipulation)
  - [Utility Functions](#utility-functions)
  - [Events](#events)
  - [Selectors](#selectors)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features
### Core Features
- **Type Detection**: Determine object types such as strings, nodes, node lists, and arrays.
- **DOM Manipulation**: Create, append, remove, and manage DOM elements dynamically.
- **Utilities**: Generate random IDs, colors, and perform AJAX requests.
- **Event Handling**: Intuitive methods for managing events like click, focus, and keypress.
- **Element Selection**: Flexible ways to select DOM elements, including CSS selectors, nodes, and arrays.

---

## Getting Started

### Installation

Add the library to your project by downloading the `Jua.js` file or using a CDN:
```html
<script src="path-to-jua.min.js"></script>
```

### Basic Usage

Include the script in your HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <script src="jua.min.js"></script>
</head>
<body>
  <div id="example">Hello, Jua.js!</div>
  <script>
    Jua('#example')
      .css('color', 'blue')
      .text('Styled with Jua.js!');
  </script>
</body>
</html>
```

---

## API Documentation

### Type Detection
- **`getType(obj)`**: Detects the type of the given object (e.g., string, node, list).
```javascript
Jua.getType(document.querySelector('#example')); // "node"
```

### DOM Manipulation
- **`newElm(tag, attributes)`**: Create a new DOM element.
```javascript
Jua.newElm('div', { id: 'new-div', class: 'my-class' });
```

- **`append(element)`**: Append an element to a target.
```javascript
Jua('#example').append('<p>Appended text</p>');
```

- **`attr(name, value)`**: Get or set an attribute.
```javascript
Jua('#example').attr('data-custom', 'value');
```

- **`css(name, value)`**: Get or set a CSS property.
```javascript
Jua('#example').css('color', 'red');
```

- **`toggleClass(className)`**: Toggle a CSS class.
```javascript
Jua('#example').toggleClass('hidden');
```

- **`remove()`**: Remove an element from the DOM.
```javascript
Jua('#example').remove();
```

### Utility Functions
- **`randomId()`**: Generate a random string ID.
```javascript
Jua.randomId(); // e.g., "abc123"
```

- **`randomRGB()`**: Generate a random RGB color.
```javascript
Jua.randomRGB(); // "rgb(34, 98, 203)"
```

- **`flatArr(array)`**: Flatten a nested array.
```javascript
Jua.flatArr([1, [2, [3]]]); // [1, 2, 3]
```

- **`get()`**: Perform an AJAX GET request.
```javascript
Jua.get('/path', (response) => console.log(response));
```

### Events
- **`on(type, callback)`**: Attach an event listener.
```javascript
Jua('#example').on('click', () => alert('Clicked!'));
```

- **Shorthand Methods**: Use `.click()`, `.focus()`, `.keyup()`, and more.
```javascript
Jua('#example').click(() => alert('Clicked!'));
```

### Selectors
Jua.js provides flexible methods for selecting DOM elements. Here's how you can select elements using various approaches:

- **CSS Selector (String)**:
  ```javascript
  Jua('#my-id');         // Select element with ID 'my-id'
  Jua('.my-class');      // Select elements with class 'my-class'
  Jua('div');            // Select all <div> elements
  ```

- **Direct Node**:
  ```javascript
  const node = document.querySelector('#my-id');
  Jua(node);             // Wrap a DOM node in Jua
  ```

- **Node List or Array**:
  ```javascript
  const nodeList = document.querySelectorAll('.my-class');
  Jua(nodeList);         // Wrap a NodeList or Array
  ```

- **Element Creation**:
  ```javascript
  Jua.newElm('div', { id: 'new-div', class: 'box' });
  ```

- **Dynamic Queries**:
  ```javascript
  Jua('#parent').child('.child-class'); // Select children of a parent element
  ```

---

## Examples

### Creating and Appending Elements
```javascript
const newDiv = Jua.newElm('div', { id: 'new-div', class: 'box' });
Jua('#container').append(newDiv);
```

### Event Handling
```javascript
Jua('#button').click(() => {
  alert('Button clicked!');
});
```

### Selecting Multiple Elements
```javascript
Jua('.items').each((item, index) => {
  console.log(`Item ${index}:`, item);
});
```

### Manipulating Styles
```javascript
Jua('#example').css('background-color', Jua.randomRGB());
```

---

## Contributing

Contributions are welcome! Please fork this repository, make your changes, and submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
