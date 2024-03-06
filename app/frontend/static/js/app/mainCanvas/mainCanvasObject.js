export default class MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.w = w;
    this.h = h;
    this.ctx = ctx;
    this.selected = false;
    this.hidden = false;
    this.boundingBox = new Path2D(`M${this.xPos} ${this.yPos} h ${this.w} v ${this.h} h ${-this.w} Z`);
  }

  drawBoundingBox() {
    if (!this.selected) { return }
    this.ctx.lineWidth = this.ctx.style.objectBoundingBox.lineWidth / this.ctx.getTransform().a;
    this.ctx.strokeStyle = this.ctx.style.objectBoundingBox.color;
    //__border
    this.ctx.beginPath();
    this.ctx.strokeRect(this.xPos, this.yPos, this.w, this.h);
    this.ctx.closePath();
    //__points
    this.ctx.lineWidth = this.ctx.style.controllPoint.lineWidth / this.ctx.getTransform().a;
    this.ctx.strokeStyle = this.ctx.style.objectBoundingBox.color;
    this.ctx.fillStyle = this.ctx.style.controllPoint.color;
    this.drawControllPoint((this.xPos), (this.yPos));
    this.drawControllPoint((this.xPos), (this.yPos + this.h));
    this.drawControllPoint((this.xPos + this.w), (this.yPos));
    this.drawControllPoint((this.xPos + this.w), (this.yPos + this.h));
    this.ctx.lineWidth = 1;
  }

  drawControllPoint(x, y) {
    this.ctx.beginPath();
    this.ctx.strokeRect(x - 4 / this.ctx.getTransform().a, y - 4 / this.ctx.getTransform().a, 8 / this.ctx.getTransform().a, 8 / this.ctx.getTransform().a);
    this.ctx.fillRect(x - 3 / this.ctx.getTransform().a, y - 3 / this.ctx.getTransform().a, 6 / this.ctx.getTransform().a, 6 / this.ctx.getTransform().a);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }

  mouseOverBoundingBox(mouseXPos, mouseYPos) {
    this.boundingBox = new Path2D(`M${this.xPos} ${this.yPos} h ${this.w} v ${this.h} h ${-this.w} Z`);
    return this.ctx.isPointInPath(this.boundingBox, mouseXPos, mouseYPos);
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