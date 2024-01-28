import MainCanvasObject from "./mainCanvasObject.js";

export default class MainCanvasImgObject extends MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx, camera, imgSrc){
    super(xPos, yPos, w, h, ctx, camera);
    this.img = new Image();
    this.img.src = imgSrc;
  }

  draw() {
    if (this.hidden) { return }
    this.ctx.drawImage(this.img, this.xPos, this.yPos, this.w, this.h);
    this.drawSelectionBorder();
  }
}
