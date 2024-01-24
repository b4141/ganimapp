export default class MainCanvasObject {
  constructor(xPos, yPos, w, h, imgSrc, ctx) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.w = w;
    this.h = h;

    this.img = new Image();
    this.img.src = imgSrc;
    this.ctx = ctx;
    this.selected = true;
    this.hidden = false;
  }

  drawBorder() {
    //__border
    if (!this.selected) { return }
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.sRect(this.xPos, this.yPos, this.w, this.h);
    this.ctx.stroke();
    this.ctx.closePath();

    //__points
    let pointSize = 4;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "black";
    this.ctx.arc(this.xPos, this.yPos, pointSize, 0, 2 * Math.PI)
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "black";
    this.ctx.arc(this.xPos + this.w, this.yPos, pointSize, 0, 2 * Math.PI)
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "black";
    this.ctx.arc(this.xPos + this.w, this.yPos + this.h, pointSize, 0, 2 * Math.PI)
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "red";
    this.ctx.fillStyle = "black";
    this.ctx.arc(this.xPos, this.yPos + this.h, pointSize, 0, 2 * Math.PI)
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }

  draw() {
    if (this.hidden) { return }
    this.ctx.drawImage(this.img, this.xPos, this.yPos, this.w, this.h);
    this.drawBorder();
  }

  mouseOver(mouseXPos, mouseYPos) {
    if (mouseXPos >= this.xPos && mouseXPos <= this.xPos + this.w) {
      if (mouseYPos >= this.yPos && mouseYPos <= this.yPos + this.h) {
        return true;
      }
    }
    return false;
  }

  inArea(areaXStart, areaYStart, areaXEnd, areaYEnd) {
    //___sorting_so_the_area_starts_always_from_min_values
    [areaXStart, areaXEnd] = [areaXStart, areaXEnd].sort((a, b) => a - b);
    [areaYStart, areaYEnd] = [areaYStart, areaYEnd].sort((a, b) => a - b);

    //___checking_if_the_object_in_the_area
    if (this.xPos >= areaXStart && this.xPos + this.w <= areaXEnd) {
      if (this.yPos >= areaYStart && this.yPos + this.h <= areaYEnd) {
        return true;
      }
    }
    return false;
  }
}