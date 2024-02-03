import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvasImgObject extends MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx, camera, imgSrc) {
    super(xPos, yPos, w, h, ctx, camera);
    this.img = new Image();
    this.img.src = imgSrc;
  }

  drawHoverBorder() {
    if (this.selected) { return }
    this.ctx.lineWidth = this.ctx.style.objectBoundingBox.lineWidth / this.camera.zoom;
    this.ctx.strokeStyle = this.ctx.style.objectBoundingBox.color;
    //__border
    this.ctx.beginPath();
    this.ctx.strokeRect(this.xPos, this.yPos, this.w, this.h);
    this.ctx.closePath();
    this.ctx.lineWidth = 1;
  }

  draw(mousePos) {
    if (this.hidden) { return }
    this.ctx.drawImage(this.img, this.xPos, this.yPos, this.w, this.h);
    this.drawBoundingBox();

    //___if_no_mouse_cord_then_return_else_continue__event_below_are_mouse_related
    if (!mousePos) { return }

    if (this.mouseOverBoundingBox(mousePos.x, mousePos.y)) {
      this.drawHoverBorder();
    }

  }
}
