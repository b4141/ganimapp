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



