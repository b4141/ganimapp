import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvasImgObject extends MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx, camera, imgSrc) {
    super(xPos, yPos, w, h, ctx, camera);
    this.img = new Image();
    this.img.src = imgSrc;
  }

  drawHoverBorder() {
    if (this.selected) { return }
    let ratio = 1 / this.camera.zoom;
    let zoom = this.camera.zoom;
    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = this.selectBorderStyle.lineWidth;
    this.ctx.strokeStyle = this.selectBorderStyle.color;
    //__border
    this.ctx.beginPath();
    this.ctx.sRect(this.xPos * zoom, this.yPos * zoom, this.w * zoom, this.h * zoom);
    this.ctx.closePath();
    this.ctx.lineWidth = 1;
    this.ctx.scale(zoom, zoom);
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
