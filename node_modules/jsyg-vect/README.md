# JSYG.Vect
Vectors constructor for [JSYG framework](https://github.com/YannickBochatay/JSYG) or standalone

### Installation
```shell
npm install jsyg-vect
```
You can also install it with bower.

### Example with webpack/babel
```javascript
import Vect from "jsyg-vect"

let vect1 = new Vect(5,3)
let vect2 = new Vect(30,12)

console.log( vect1.length() )
console.log( vect1.dot(vect2) )
console.log( vect1.normalize() )
```