export default class MainCanvasObject {
  constructor(xPos, yPos, w, h, ctx, camera) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.w = w;
    this.h = h;
    this.camera = camera;
    this.ctx = ctx;
    this.selected = false;
    this.hidden = false;
    this.selectBorderStyle = { color: "#0d99ff", lineWidth: 3 };
    this.boundingBox = new Path2D(`M${this.xPos} ${this.yPos} h ${this.w} v ${this.h} h ${-this.h} Z`);
  }

  drawBoundingBox() {
    if (!this.selected) { return }
    let ratio = 1 / this.camera.zoom;
    let zoom = this.camera.zoom;
    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = this.selectBorderStyle.lineWidth;
    this.ctx.strokeStyle = this.selectBorderStyle.color;
    //__border
    this.ctx.beginPath();
    this.ctx.sRect(this.xPos * zoom, this.yPos * zoom, this.w * zoom, this.h * zoom);
    this.ctx.closePath();
    //__points
    this.drawControllPoint((this.xPos) * zoom, (this.yPos) * zoom);
    this.drawControllPoint((this.xPos) * zoom, (this.yPos + this.h) * zoom);
    this.drawControllPoint((this.xPos + this.w) * zoom, (this.yPos) * zoom);
    this.drawControllPoint((this.xPos + this.w) * zoom, (this.yPos + this.h) * zoom);
    this.ctx.lineWidth = 1;
    this.ctx.scale(zoom, zoom);
  }

  drawControllPoint(x, y) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.selectBorderStyle.color;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.sRect(x - 4, y - 4, 8, 8);
    this.ctx.fRect(x - 3, y - 3, 7, 7);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }

  mouseOverBoundingBox(mouseXPos, mouseYPos) {
    this.boundingBox = new Path2D(`M${this.xPos} ${this.yPos} h ${this.w} v ${this.h} h ${-this.h} Z`);
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