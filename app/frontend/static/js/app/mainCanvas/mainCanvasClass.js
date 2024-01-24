import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvas {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.canvasWidth = this.canvasElement.clientWidth;
    this.canvasHeight = this.canvasElement.clientHeight;
    this.ctx = canvasElement.getContext("2d");
    this.constructCtx();

    this.objects_on_canvas = [];
    this.selected_objects = [];
    this.drawSelectAreaInfo = { state: false, startXPos: 0, startYPos: 0 };
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
    let xMiddle = Math.floor(this.canvasWidth / 2) - 50;
    let yMiddle = Math.floor(this.canvasHeight / 2) - 50;
    let object = new MainCanvasObject(xMiddle, yMiddle, 100, 100, src, this.ctx, -0.5);
    this.objects_on_canvas.push(object);
    object.img.onload = () => {
      object.draw();
    }
  }

  update() {
    this.ctx.clearRect(-1, -1, this.canvasWidth + 1, this.canvasHeight + 1);
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].draw();
    }
  }

  drawSelectAreaFunction(posX, posY) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "#ff000055";
    this.ctx.sRect(this.drawSelectAreaInfo.startXPos, this.drawSelectAreaInfo.startYPos, posX - this.drawSelectAreaInfo.startXPos, posY - this.drawSelectAreaInfo.startYPos);
    this.ctx.fRect(this.drawSelectAreaInfo.startXPos, this.drawSelectAreaInfo.startYPos, posX - this.drawSelectAreaInfo.startXPos, posY - this.drawSelectAreaInfo.startYPos);
    this.ctx.fill();
    this.ctx.closePath();
  }
}

