import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvas {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.canvasWidth = this.canvasElement.clientWidth;
    this.canvasHeight = this.canvasElement.clientHeight;
    this.canvasElement.onmousedown = (event) => this.onMouseDown(event);
    this.canvasElement.onmouseup = (event) => this.onMouseUp(event);
    this.canvasElement.onmousemove = (event) => this.onMouseMove(event);
    this.canvasElement.onwheel = (event) => this.onWheel(event);


    this.ctx = canvasElement.getContext("2d");
    this.constructCtx();

    this.camera = { offsetX: parseInt(window.innerWidth / 2), offsetY: parseInt(window.innerHeight / 2), zoom: 1, MAX_ZOOM: 50, MIN_ZOOM: 0.1, SCROLL_SENSITIVITY: 0.005 };
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
  }

  //___TODO___modify_this_function_its_only_a_place_holder
  loadObject(src) {
    if (!src) { return }
    let object = new MainCanvasObject(0, 0, 100, 100, src, this.ctx, this.camera);
    this.objects_on_canvas.push(object);
    object.img.onload = () => {
      object.draw();
    }
  }

  getEventLocation(event) {
    //___if_touch_or_click
    if (event.touches && event.touches.length == 1) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY }
    } else if (event.clientX && event.clientY) {
      return { x: event.clientX, y: event.clientY }
    }
  }

  updateCanvasDimensions() {
    this.canvasElement.width = parseInt(window.innerWidth);
    this.canvasElement.height = parseInt(window.innerHeight);
    this.canvasWidth = this.canvasElement.clientWidth;
    this.canvasHeight = this.canvasElement.clientHeight;
  }

  updateCamera() {
    //___Translate_to_canvas_center_before_zooming_to_zoom_on_center
    this.ctx.translate(parseInt(window.innerWidth / 2), parseInt(window.innerHeight / 2));
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-parseInt(window.innerWidth / 2) + this.camera.offsetX, -parseInt(window.innerHeight / 2) + this.camera.offsetY);

  }

  update() {
    this.updateCanvasDimensions();
    this.updateCamera();
    this.ctx.clearRect(-1, -1, this.canvasWidth + 1, this.canvasHeight + 1);
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].draw();
    }
  }

  drawSelectAreaFunc(posX, posY) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "#ff000055";
    this.ctx.sRect(this.drawSelectAreaInfo.startXPos, this.drawSelectAreaInfo.startYPos, posX - this.drawSelectAreaInfo.startXPos, posY - this.drawSelectAreaInfo.startYPos);
    this.ctx.fRect(this.drawSelectAreaInfo.startXPos, this.drawSelectAreaInfo.startYPos, posX - this.drawSelectAreaInfo.startXPos, posY - this.drawSelectAreaInfo.startYPos);
    this.ctx.fill();
    this.ctx.closePath();
  }

  dragCanvasSetTrueFunc(event) {
    this.canvasDrag.state = true;
    this.canvasDrag.dragStart.x = this.getEventLocation(event).x / this.camera.zoom - this.camera.offsetX;
    this.canvasDrag.dragStart.y = this.getEventLocation(event).y / this.camera.zoom - this.camera.offsetY;
  }

  dragCanvasSetFalseFunc() {
    this.canvasDrag.state = false;
  }

  dragCanvasFunc(event) {
    this.camera.offsetX = parseInt(this.getEventLocation(event).x / this.camera.zoom - this.canvasDrag.dragStart.x);
    this.camera.offsetY = parseInt(this.getEventLocation(event).y / this.camera.zoom - this.canvasDrag.dragStart.y);
  }

  adjustCanvasZoom(event) {
    if (!this.canvasDrag.state) {
      this.camera.zoom -= event.deltaY * this.camera.SCROLL_SENSITIVITY;
      this.camera.zoom = Math.min(this.camera.zoom, this.camera.MAX_ZOOM);
      this.camera.zoom = Math.max(this.camera.zoom, this.camera.MIN_ZOOM);
    }
  }

  onMouseDown(event) {
    event.preventDefault();
    //___if_middle_mouse_button
    if (event.button === 1) {
      this.dragCanvasSetTrueFunc(event);
    }
  }

  onMouseUp(event) {
    event.preventDefault();
    this.dragCanvasSetFalseFunc(event);
  }

  onMouseMove(event) {
    event.preventDefault();
    if (this.canvasDrag.state) {
      this.dragCanvasFunc(event);
    }

    this.update();
  }

  onWheel(event) {
    event.preventDefault();
    this.adjustCanvasZoom(event);
    this.update();
  }

}

