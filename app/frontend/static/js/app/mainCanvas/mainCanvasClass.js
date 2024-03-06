import MainCanvasObject from "./mainCanvasObject.js";
import MainCanvasImgObject from "./mainCanvasImgObject.js";

export default class MainCanvas {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.canvasWidth = this.canvasElement.clientWidth;
    this.canvasHeight = this.canvasElement.clientHeight;
    this.canvasElement.onmousedown = (event) => this.onMouseDown(event);
    this.canvasElement.onmouseup = (event) => this.onMouseUp(event);
    this.canvasElement.onmousemove = (event) => this.onMouseMove(event);
    this.canvasElement.onwheel = (event) => this.onWheel(event);
    this.style = { selectArea: { stoke: "#0d99ff", fill: "#0d99ff33", lineWidth: 1 }, objectBoundingBox: { color: "#0d99ff", lineWidth: 2 }, controllPoint: { color: "#ffffff", lineWidth: 2 } }


    this.ctx = canvasElement.getContext("2d");
    this.constructCtx();

    this.camera = { offsetX: 0, offsetY: 0, MAX_ZOOM: 100, MIN_ZOOM: 0.02, SHOW_GRID_ZOOM: 10 };
    this.canvasDrag = { state: false, dragStart: { x: 0, y: 0 } }
    this.drawSelectAreaInfo = { state: false, selectStart: { x: 0, y: 0 } };

    this.objects_on_canvas = [];
    this.selected_objects = [];
  }

  constructCtx() {
    this.ctx.sRect = function(x, y, w, h) {
      x = parseInt(x) + 0.50;
      y = parseInt(y) + 0.50;
      this.strokeRect(x, y, w, h);
    }

    this.ctx.fRect = function(x, y, w, h) {
      x = parseInt(x);
      y = parseInt(y);
      this.fillRect(x, y, w, h);
    }

    this.ctx.style = this.style;
  }

  deselectAllObjectsOnCanvas() {
    this.selected_objects = [];
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].selected = false;
    }
  }

  //___TODO___modify_this_function_its_only_a_place_holder
  loadImgObject(src) {
    if (!src) { return }
    this.deselectAllObjectsOnCanvas();
    let object = new MainCanvasImgObject(0, 0, 100, 100, this.ctx, src);
    object.selected = true;
    this.objects_on_canvas.push(object);
    object.img.onload = () => {
      object.draw();
    }
  }

  getMousePosOnScreen(event) {
    if (!event) { return }
    let canvasRect = this.canvasElement.getBoundingClientRect();
    return {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top
    }
  }

  getTransformedMousePos(event) {
    if (!event) { return }
    let mousePos = this.getMousePosOnScreen(event);
    let transformedMousePos = this.getTransformedPoint(mousePos.x, mousePos.y);
    return {
      x: transformedMousePos.x,
      y: transformedMousePos.y,
    }
  }

  getTransformedPoint(x, y) {
    const originalPoint = new DOMPoint(x, y);
    return this.ctx.getTransform().invertSelf().transformPoint(originalPoint);
  }

  updateCanvasDimensions() {
    if (window.innerWidth != this.canvasWidth) {
      this.canvasElement.width = window.innerWidth;
      this.canvasWidth = window.innerWidth;
    }
    if (window.innerHeight != this.canvasHeight) {
      this.canvasElement.height = window.innerHeight;
      this.canvasHeight = window.innerHeight;
    }
  }

  clearCanvas(){
    this.updateCanvasDimensions();
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvasElement.clientWidth, this.canvasElement.clientHeight);
    this.ctx.restore();
  }

  update(event) {
    let mousePos = this.getMousePosOnScreen(event);

    this.clearCanvas();

    this.ctx.clearRect(-1, -1, this.canvasWidth + 1, this.canvasHeight + 1);

    //___drawGrid
    if (this.ctx.getTransform().a >= this.camera.SHOW_GRID_ZOOM) {
      this.drawGrid();
    }

    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].draw(mousePos);
    }

    if (this.drawSelectAreaInfo.state) {
      this.drawSelectAreaFunc(event);
    }
  }

  drawSelectAreaSetTrueFunc(event) {
    this.drawSelectAreaInfo.state = true;
    this.drawSelectAreaInfo.selectStart.x = this.getTransformedMousePos(event).x;
    this.drawSelectAreaInfo.selectStart.y = this.getTransformedMousePos(event).y;
  }

  drawSelectAreaSetFalseFunc() {
    this.drawSelectAreaInfo.state = false;
  }

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

  dragCanvasSetTrueFunc(event) {
    this.canvasDrag.state = true;
    this.canvasDrag.dragStart.x = this.getTransformedMousePos(event).x;
    this.canvasDrag.dragStart.y = this.getTransformedMousePos(event).y;
  }

  dragCanvasSetFalseFunc() {
    this.canvasDrag.state = false;
  }

  dragCanvasFunc(event) {
    if (!this.canvasDrag.state) { return }
    this.camera.offsetX = this.getTransformedMousePos(event).x - this.canvasDrag.dragStart.x;
    this.camera.offsetY = this.getTransformedMousePos(event).y - this.canvasDrag.dragStart.y;
    this.ctx.translate(this.camera.offsetX, this.camera.offsetY);
  }

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

  rightMouseClick(event) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  leftMouseClick(event) {
    let mousePos = this.getMousePosOnScreen(event);
    this.deselectAllObjectsOnCanvas();
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      if (this.objects_on_canvas[i].mouseOverBoundingBox(mousePos.x, mousePos.y)) {
        this.objects_on_canvas[i].selected = true;
        this.selected_objects.push(this.objects_on_canvas[i]);
      }
    }
    if (this.selected_objects.length == 0) {
      this.drawSelectAreaSetTrueFunc(event);
    }
  }

  middleMouseClick(event) {
    this.dragCanvasSetTrueFunc(event);
  }

  onMouseDown(event) {
    event.preventDefault();

    if (event.button === 0) {
      this.leftMouseClick(event);
    } else if (event.button === 1) {
      this.middleMouseClick(event)
    } else if (event.button === 2) {
      this.rightMouseClick(event)
    }


    this.update(event);
  }

  onMouseUp(event) {
    event.preventDefault();
    this.dragCanvasSetFalseFunc();
    this.drawSelectAreaSetFalseFunc();
    this.update(event);
  }

  onMouseMove(event) {
    event.preventDefault();
    if (this.canvasDrag.state) {
      this.dragCanvasFunc(event);
    }

    this.update(event);
  }

  onWheel(event) {
    this.adjustCanvasZoom(event);
    this.update();
  }

  drawGrid() {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1 / this.ctx.getTransform().a;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -1000);
    this.ctx.lineTo(0, 1000);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.moveTo(-1000, 0);
    this.ctx.lineTo(1000, 0);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.strokeStyle = "orange";
    // this.ctx.lineWidth = 1;
    let space = 1
    for (let i = 1; i < 10; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * space, -1000);
      this.ctx.lineTo(i * space, 1000);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.moveTo(-1000, i * space);
      this.ctx.lineTo(1000, i * space);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.moveTo(-i * space, -1000);
      this.ctx.lineTo(-i * space, 1000);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.moveTo(-1000, -i * space);
      this.ctx.lineTo(1000, -i * space);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

}

