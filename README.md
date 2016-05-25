# JSYG.AnimationQueue
Animation plugin (with queuing) of JSYG framework



### Demo
[http://yannickbochatay.github.io/JSYG.AnimationQueue](http://yannickbochatay.github.io/JSYG.AnimationQueue)



### Installation
```shell
npm install jsyg-animationqueue
```
You can also install it with bower



### Example with babel/webpack
```javascript
import Path from "jsyg-path"
import AnimationQueue from "jsyg-animationqueue"
import $ from "jquery"

let path = new Path("#source")          
let queue = new AnimationQueue()
let duration = 1000

queue.add({
  node : path,
  to : { "stroke-dashoffset":0 },
  onstart() {
    var length = path.getLength()
    path.css("stroke-dashoffset",length)
    path.css("stroke-dasharray",length)
  },
  onend() {
    path.css("stroke-dasharray",0)
  },
  duration
})

queue.add({
  node : path,
  to : { d: JSYG("#target").attr("d") },
  duration
})

queue.add({
  node : path,
  to : { rotate : 360 },
  duration
})

$("#play").on("click", () => queue.play() );
$("#pause").on("click", () => queue.pause() );
$("#stop").on("click", () => queue.stop() );
$("#reverse").on("click", () => queue.way("toggle") );
```
