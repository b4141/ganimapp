import MainCanvas from "./mainCanvasClass.js";

let main_canvas = new MainCanvas(document.getElementById("main-canvas"));
main_canvas.loadImgObject("./static/imgs/svg/rice-bowl.svg");

main_canvas.loadImgObject("./static/imgs/jpg/strawberry.jpg");
main_canvas.objects_on_canvas[1].xPos = 150;
main_canvas.objects_on_canvas[1].yPos = 150;

main_canvas.loadImgObject("./static/imgs/jpg/strawberry.jpg");
main_canvas.objects_on_canvas[2].xPos = 300;
main_canvas.objects_on_canvas[2].yPos = 300;

main_canvas.objects_on_canvas[2].w = 95000;
main_canvas.objects_on_canvas[2].h = 1000;

main_canvas.update();

