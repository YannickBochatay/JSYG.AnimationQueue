# JSYG.Animation
Animation plugin of JSYG framework



### Demo
[http://yannickbochatay.github.io/JSYG.Animation](http://yannickbochatay.github.io/JSYG.Animation)



### Installation
```shell
npm install jsyg-animation
```
You can also install it with bower



### Examples with webpack/babel

```javascript
import Animation from "jsyg-animation"
import $ from "jquery"

let anim = new Animation("#myElmt")

anim.set({
    to : {
        x : 50,
        rotate : 45,
        color : "violet"
    }
})

$('#playButton').on("click", () => anim.play() )
$('#pauseButton').on("click", () => anim.pause() )
$('#stopButton').on("click", () => anim.stop() )
```



```javascript
import Animation from "jsyg-animation"
import $ from "jquery"

let anim = new Animation("#myPath")

anim.play({
    to : {
        d : "M210,10 L290,20 L290,90 L210,100 Z"
    },
    easing : "swing",
    onanimate() {
        console.log( this.getAttribute("d") )
    }
})
```