# coordinates on canvas

### coordinates without any translation for zooming
the following function will return Mouse position on the screen
```javascript
getMousePos(event){
  if (!event) { return }
  let canvasRect = this.canvasElement.getBoundingClientRect();
  return {
    x: event.clientX - canvasRect
    return {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top
    }
  }
}
```

the canvas will be updated on some events like mouse mouvement or mouse clicks and on each update
the camera will be updated
```javascript
updateCamera() {
  this.ctx.scale(this.camera.zoom, this.camera.zoom);
  this.ctx.translate(this.camera.offsetX, this.camera.offsetY);
}
```

but the canvas it self has pan and zoom capabilities, so how to get the Mouse position then ?

well first we have to look at how the canvas panning works
```javascript
dragCanvasSetTrueFunc(event) {
  this.canvasDrag.state = true;
  this.canvasDrag.dragStart.x = this.getMousePosOnCanvas(event).x;
  this.canvasDrag.dragStart.y = this.getMousePosOnCanvas(event).y;
}

dragCanvasSetFalseFunc() {
  this.canvasDrag.state = false;
}

dragCanvasFunc(event) {
  this.camera.offsetX = this.getMousePos(event).x / this.camera.zoom - this.canvasDrag.dragStart.x;
  this.camera.offsetY = this.getMousePos(event).y / this.camera.zoom - this.canvasDrag.dragStart.y;
}
```

and we can get the Mouse position on the canvas as follows
```javascript
getMousePosOnCanvas(event) {
  if (!event) { return }
  let mousePos = this.getMousePos(event);
  return {
    x: (mousePos.x / this.camera.zoom) - this.camera.offsetX,
    y: (mousePos.y / this.camera.zoom) - this.camera.offsetY
  }
}
```
and even get any position on the screen
```javascript
getScreenToCanvasPos(x, y) {
  return {
    x: (x / this.camera.zoom) - this.camera.offsetX,
    y: (y / this.camera.zoom) - this.camera.offsetY
  }
}
```

### Adding zoom to center
But the canvas is zooming on to the top left corner of the screen, so how we can zoom to the center of the screen
let's update the camera code
```javascript
updateCamera() {
  //___Translate_to_canvas_center_before_zooming__to_zoom_on_center
  this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  this.ctx.scale(this.camera.zoom, this.camera.zoom);
  this.ctx.translate(this.camera.offsetX, this.camera.offsetY);
}
```

then we can get the mouse position on the cavas as follows
```javascript
getMousePosOnCanvas(event) {
  if (!event) { return }
  let mousePos = this.getMousePos(event);
  return {
    x: (mousePos.x - (window.innerWidth / 2)) / this.camera.zoom - this.camera.offsetX,
    y: (mousePos.y - (window.innerHeight / 2)) / this.camera.zoom - this.camera.offsetY,
  }
}
```
and get the screen to canvas of any position
```javascript
getScreenToCanvasPos(x, y) {
  return {
    x: (x - (window.innerWidth / 2)) / this.camera.zoom - this.camera.offsetX,
    y: (y - (window.innerHeight / 2)) / this.camera.zoom - this.camera.offsetY,
  }
}
```


### Zooming to mouse position

But it would much better experience for the user to zoom to the mouse pointer
so we'll scrap the previous code and use this new method.

wi'll be using 
```javascript
ctx.getTransform()
```
which will gets the current transform applied on the canvas, so instead of keeping the transform ourselves, the canvas will do so.
this function will return an object with the following properties:
- a Horizontal scaling
- b Vertical skewing
- c Horizontal skewing
- d Vertical scaling
- e Horizontal translation
- f Vertical translation


we can get a transformed point as follows:
```javascript
getTransformedPoint(x, y) {
  let transform = this.ctx.getTransform();
  return {
    x: x - transform.e,
    y: y - transform.f,
  }
}
```
this will return any point when the canvas has been transformed

so let's introduce scaling
we need to transform the point by the opposite scale,
that means what ammount to puth the scale back to 1 when multiplying by the scale.
so **scale * x = 1**, when solving we get this formula: **x = 1 / scale**.
```javascript
getScaledPoint(x, y) {
  let transform = this.ctx.getTransform();
  return {
    x: x * (1 / transform.a),
    y: y * (1 / transform.d),
  }
}
```

applying that to the previous function we get:
```javascript
getTransformedPoint(x, y) {
  let transform = this.ctx.getTransform();
  return {
    x: (1 / transform.a) * (x - transform.e),
    y: (1 / transform.d) * (y - transform.f),
  }
}
```

we can also introduce Skewing, but this wi'll bring so much hustle when trying to invert everything.
so we just gonna use the built in function **invertSelf()** that is provided with the object.
and our code wi'll be like so:
```javascript
getTransformedPoint(x, y) {
  let inverseTransform = this.ctx.getTransform().invertSelf();
  return {
    x: inverseTransform.a * x + inverseTransform.c * y + inverseTransform.e,
    y: inverseTransform.b * x + inverseTransform.d * y + inverseTransform.f,
  }
}
```
here we have used the **2D affine transformation**
- x_o = a * x_i + c * y_i + e
- y_o = b * x_i + d * y_i + f

we'll guess what, the DOMMatrix can do the transfrom for us, if we used a DOMPoint, so let's do that:
```javascript
getTransformedPoint(x, y) {
  const originalPoint = new DOMPoint(x, y);
  return this.ctx.getTransform().invertSelf().transformPoint(originalPoint);
}
```

nice so now we can get the transformed mouse position like so:
```javascript
getTransformedMousePos(event) {
  if (!event) { return }
  let mousePos = this.getMousePosOnScreen(event);
  let transformedMousePos = this.getTransformedPoint(mousePos.x, mousePos.y);
  return {
    x: transformedMousePos.x,
    y: transformedMousePos.y,
  }
}
```

So let's get to the zooming to mouse position part
let's delete the **updateCamera** function, we do not need it anymore,
and let's instead call the **adjustCanvasZoom** function directly when scrolling with the mouse
```javascript
adjustCanvasZoom(event) {
  if (this.canvasDrag.state) { return }
  if (this.ctx.getTransform().a >= this.camera.MAX_ZOOM && event.deltaY < 0) { return }
  if (this.ctx.getTransform().a <= this.camera.MIN_ZOOM && event.deltaY > 0) { return }

  let camera_zoom = event.deltaY < 0 ? 1.1 : 0.9;

  let currentTransformedCursor = this.getTransformedMousePos(event);
  this.ctx.translate(currentTransformedCursor.x, currentTransformedCursor.y);
  this.ctx.scale(camera_zoom, camera_zoom);
  this.ctx.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);
}
```

drag wi'll be as follows:
```javascript
dragCanvasFunc(event) {
  if (!this.canvasDrag.state) { return }
  this.camera.offsetX = this.getTransformedMousePos(event).x - this.canvasDrag.dragStart.x;
  this.camera.offsetY = this.getTransformedMousePos(event).y - this.canvasDrag.dragStart.y;
  this.ctx.translate(this.camera.offsetX, this.camera.offsetY);
}
```

and draw selection area as so:
```javascript
drawSelectAreaFunc(event) {
  if (!this.drawSelectAreaInfo.state || !event) { return }
  let translatedPos = {
    x: this.getTransformedMousePos(event).x - this.drawSelectAreaInfo.selectStart.x,
    y: this.getTransformedMousePos(event).y - this.drawSelectAreaInfo.selectStart.y
  }
  this.ctx.beginPath();
  this.ctx.strokeStyle = this.style.selectArea.stoke;
  this.ctx.fillStyle = this.style.selectArea.fill;
  this.ctx.lineWidth = this.style.selectArea.lineWidth / this.ctx.getTransform().a;
  this.ctx.strokeRect(this.drawSelectAreaInfo.selectStart.x, this.drawSelectAreaInfo.selectStart.y, translatedPos.x, translatedPos.y);
  this.ctx.fillRect(this.drawSelectAreaInfo.selectStart.x, this.drawSelectAreaInfo.selectStart.y, translatedPos.x, translatedPos.y);
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.lineWidth = 1;
  this.ctx.closePath();
}
```




