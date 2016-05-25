# Color
Constructeur de couleurs.

### Installation

##### with npm
```shell
npm install jsyg-color
```

##### with bower
```shell
bower install jsyg-color
```


### Usage

##### es6 modules (babel+webpack)
```javascript
import Color from "jsyg-color"

var div = document.getElementById("#myElmt");
var color = new Color("violet");
div.style.color = color.complementary().lighten(2).toString();
```

##### without bundler
```html
<script src="node_modules/jsyg-color/JSYG.Color.js"></script>
<script>
  var div = document.getElementById("#myElmt");
  var color = new Color("violet");
  div.style.color = color.complementary().lighten(2).toString();
</script>
```