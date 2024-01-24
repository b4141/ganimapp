import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvas {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    //___adding_this_because_canvas_calculates_from_the_half_of_a_pixel
    this.ctx.translate(0.5, 0.5);
    this.origin = -0.5

    this.objects_on_canvas = [];
    this.selected_objects = [];
    this.drawSelectAreaInfo = { state: false, startXPos: 0, startYPos: 0 };
  }

  //___TODO___modify_this_function_its_only_a_place_holder
  loadObject(src) {
    if (!src) { return }
    let xMiddle = Math.floor(this.canvasElement.clientWidth / 2) - 50;
    let yMiddle = Math.floor(this.canvasElement.clientHeight / 2) - 50;
    let object = new MainCanvasObject(xMiddle, yMiddle, 100, 100, src, this.ctx, this.origin);
    this.objects_on_canvas.push(object);
    object.img.onload = () => {
      object.draw();
    }
  }

  update() {
    this.ctx.clearRect(-1, -1, this.canvasElement.clientWidth + 1, this.canvasElement.clientHeight + 1);
    for (let i = 0; i < this.objects_on_canvas.length; i++) {
      this.objects_on_canvas[i].draw();
    }
  }


}

