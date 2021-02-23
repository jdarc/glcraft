import "../css/main.css";

import Loader from "./loader";
import Visualizer from "./visualizer";
import Camera from "./camera";
import StopWatch from "./stopWatch";
import buildScene from "./scenery";

const resizeCanvas = (canvas, force = false) => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (force || canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }
    return false;
};

window.addEventListener("load", () => {
    const canvas = document.querySelector("canvas");
    const engine = Visualizer(canvas);
    const camera = Camera(canvas);
    const loader = Loader("data");
    const timer = StopWatch();

    window.addEventListener("resize", () => resizeCanvas(canvas) && engine.viewport(canvas.width, canvas.height));
    window.addEventListener("mousedown", () => camera.mouseDown());
    window.addEventListener("mousemove", e => camera.mouseMove(e));
    window.addEventListener("mouseup", () => camera.mouseUp());
    window.addEventListener("keydown", e => camera.keyDown(e));
    window.addEventListener("keyup", e => camera.keyUp(e));

    camera.moveTo(0, 10, 150);
    camera.lookAt(0, 10, 0);

    engine.moveLightTo(0, 100, 200);

    let scene;
    const processFrame = timestamp => {
        timer.tick(timestamp);
        window.requestAnimationFrame(processFrame);
        if (!scene) return;

        camera.update(timer.elapsedSeconds, 200);
        scene.update(timer.elapsedSeconds);

        engine.view = camera.view;
        engine.proj = camera.projection;
        engine.render(scene);
    };

    loader.add("mesh", "fellord.obj");
    loader.load(resources => scene = buildScene(resources["mesh"]));

    resizeCanvas(canvas, true) && engine.viewport(canvas.width, canvas.height);
    window.requestAnimationFrame(processFrame);
}, { once: true });
