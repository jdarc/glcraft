import Material from "./material";
import Factory from "./factory";

export default function buildGround() {
    const material = new Material('Ground');

    const diffuseImage = new Image();
    diffuseImage.onload = () => material.diffuseImage = diffuseImage;
    diffuseImage.src = "data/ground_diffuse.jpg";

    const normalImage = new Image();
    normalImage.onload = () => material.normalImage = normalImage;
    normalImage.src = "data/ground_normal.jpg";

    const factory = Factory();
    factory.addVertex([-1, 0, 1]);
    factory.addVertex([1, 0, 1]);
    factory.addVertex([1, 0, -1]);
    factory.addVertex([-1, 0, -1]);
    factory.addNormal([0, 1, 0]);
    factory.addUv([0, 0]);
    factory.addUv([1, 0]);
    factory.addUv([1, 1]);
    factory.addUv([0, 1]);
    factory.useMaterial(material);
    factory.addFace([0, 1, 2], [0, 0, 0], [0, 1, 2]);
    factory.addFace([2, 3, 0], [0, 0, 0], [2, 3, 0]);
    return factory.compile();
}
