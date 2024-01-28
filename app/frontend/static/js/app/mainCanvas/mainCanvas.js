import MainCanvas from "./mainCanvasClass.js";

let main_canvas = new MainCanvas(document.getElementById("main-canvas"));
main_canvas.loadImgObject("./static/imgs/svg/rice-bowl.svg");
main_canvas.update();

