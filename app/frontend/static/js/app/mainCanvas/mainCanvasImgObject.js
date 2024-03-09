import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvasImgObject extends MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx, imgSrc) {
    super(xPos, yPos, w, h, ctx);
    this.img = new Image();
    this.img.src = imgSrc;
    this.isMouseOver =  false;
  }

  drawHoverBorder() {
    if (this.selected) { return }
    this.ctx.lineWidth = this.ctx.style.objectBoundingBox.lineWidth / this.ctx.getTransform().a;
    this.ctx.strokeStyle = this.ctx.style.objectBoundingBox.color;
    //__border
    this.ctx.beginPath();
    this.ctx.strokeRect(this.xPos, this.yPos, this.w, this.h);
    this.ctx.closePath();
    this.ctx.lineWidth = 1;
  }

  updateIsMouseOver(mousePos){
    if (!mousePos) { return }
    this.isMouseOver = this.mouseOverBoundingBox(mousePos.x, mousePos.y);
  }

  draw() {
    if (this.hidden) { return }
    this.ctx.drawImage(this.img, this.xPos, this.yPos, this.w, this.h);
    this.drawBoundingBox();

    if (this.isMouseOver) {
      this.drawHoverBorder();
    }

  }
}
