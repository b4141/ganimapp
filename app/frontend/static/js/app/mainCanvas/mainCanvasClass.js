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
    this.style = { selectArea: { stoke: "#0d99ff", fill: "#0d99ff33", lineWidth: 1 }, objectBoundingBox: { color: "#0d99ff", lineWidth: 3 } }


    this.ctx = canvasElement.getContext("2d");
    this.constructCtx();

    this.camera = { offsetX: window.innerWidth / 2, offsetY: window.innerHeight / 2, zoom: 1, MAX_ZOOM: 100, MIN_ZOOM: 0.02, SCROLL_SENSITIVITY: 0.24, SHOW_GRID_ZOOM: 10 };
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

    this.ctx.objectBoundingBoxLineStyle = this.style.objectBoundingBox;
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
    let object = new MainCanvasImgObject(0, 0, 100, 100, this.ctx, this.camera, src);
    object.selected = true;
    this.objects_on_canvas.push(object);
    object.img.onload = () => {
      object.draw();
    }
  }

  getMousePos(event) {
    if (!event) { return }
    let canvasRect = this.canvasElement.getBoundingClientRect();
    return {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top
    }
  }

  getMousePosOnCanvas(event) {
    if (!event) { return }
    let mousePos = this.getMousePos(event);
    return {
      x: (mousePos.x / this.camera.zoom) - this.camera.offsetX,
      y: (mousePos.y / this.camera.zoom) - this.camera.offsetY
    }
  }

  getScreenToCanvasPos(x, y) {
    return {
      x: (x / this.camera.zoom) - this.camera.offsetX,
      y: (y / this.camera.zoom) - this.camera.offsetY
    }
  }

  updateCanvasDimensions() {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
    this.canvasWidth = this.canvasElement.clientWidth;
    this.canvasHeight = this.canvasElement.clientHeight;
  }

  updateCamera() {
    //___Translate_to_canvas_center_before_zooming_to_zoom_on_center
    // this.ctx.translate(parseInt(window.innerWidth / 2), parseInt(window.innerHeight / 2));
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(this.camera.offsetX, this.camera.offsetY);
  }

  update(event) {
    let mousePos = this.getMousePos(event);
    this.updateCanvasDimensions();
    this.updateCamera();
    // this.ctx.clearRect(-1, -1, this.canvasWidth + 1, this.canvasHeight + 1);

    if (this.camera.zoom >= this.camera.SHOW_GRID_ZOOM) {
      this.drawGrid();
    }

    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].draw(mousePos);
    }

    if (this.drawSelectAreaInfo.state) {
      this.drawSelectAreaFunc(event);
    }
  }

  drawSelectAreaSetTrueFunc(mousePos) {
    this.drawSelectAreaInfo.state = true;
    this.drawSelectAreaInfo.selectStart.x = (mousePos.x / this.camera.zoom) - this.camera.offsetX;
    this.drawSelectAreaInfo.selectStart.y = (mousePos.y / this.camera.zoom) - this.camera.offsetY;
  }

  drawSelectAreaSetFalseFunc() {
    this.drawSelectAreaInfo.state = false;
  }

  drawSelectAreaFunc(event) {
    if (!this.drawSelectAreaInfo.state || !event) { return }
    let translatedPos = {
      x: this.getMousePosOnCanvas(event).x - this.drawSelectAreaInfo.selectStart.x,
      y: this.getMousePosOnCanvas(event).y - this.drawSelectAreaInfo.selectStart.y
    }
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.style.selectArea.stoke;
    this.ctx.fillStyle = this.style.selectArea.fill;
    this.ctx.lineWidth = this.style.selectArea.lineWidth / this.camera.zoom;
    this.ctx.strokeRect(this.drawSelectAreaInfo.selectStart.x, this.drawSelectAreaInfo.selectStart.y, translatedPos.x, translatedPos.y);
    this.ctx.fillRect(this.drawSelectAreaInfo.selectStart.x, this.drawSelectAreaInfo.selectStart.y, translatedPos.x, translatedPos.y);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.closePath();
  }

  dragCanvasSetTrueFunc(event) {
    this.canvasDrag.state = true;
    this.canvasDrag.dragStart.x = this.getMousePos(event).x / this.camera.zoom - this.camera.offsetX;
    this.canvasDrag.dragStart.y = this.getMousePos(event).y / this.camera.zoom - this.camera.offsetY;
  }

  dragCanvasSetFalseFunc() {
    this.canvasDrag.state = false;
  }

  dragCanvasFunc(event) {
    this.camera.offsetX = this.getMousePos(event).x / this.camera.zoom - this.canvasDrag.dragStart.x;
    this.camera.offsetY = this.getMousePos(event).y / this.camera.zoom - this.canvasDrag.dragStart.y;
  }

  adjustCanvasZoom(event) {
    if (!this.canvasDrag.state) {
      this.camera.zoom -= Math.sign(event.deltaY) * (this.camera.SCROLL_SENSITIVITY * this.camera.zoom);
      this.camera.zoom = Math.min(this.camera.zoom, this.camera.MAX_ZOOM);
      this.camera.zoom = Math.max(this.camera.zoom, this.camera.MIN_ZOOM);
    }
  }

  leftMouseClick(event) {
    let mousePos = this.getMousePos(event);
    this.deselectAllObjectsOnCanvas();
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      if (this.objects_on_canvas[i].mouseOverBoundingBox(mousePos.x, mousePos.y)) {
        this.objects_on_canvas[i].selected = true;
        this.selected_objects.push(this.objects_on_canvas[i]);
      }
    }
    if (this.selected_objects.length == 0) {
      this.drawSelectAreaSetTrueFunc(mousePos);
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
    event.preventDefault();
    this.adjustCanvasZoom(event);
    this.update();
  }

  drawGrid() {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1 / this.camera.zoom;
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

