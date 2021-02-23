import Matrix4 from "./matrix4";
import Node from "./node";
import buildGround from "./primitives";
import loadMesh from "./meshLoader";
import Vector3 from "./vector3";
import Scene from "./scene";

export const SpinAboutY = speed => {
    const ry = new Matrix4();
    const dy = 2 * speed * (Math.random() / 2.0 + 0.5) - speed;
    let angy = 30 * Math.random() - 15;

    const base = Node();
    base.update = seconds => base.localTransform = Matrix4.createRotationY((angy += dy * seconds), ry);
    return base;
};

function RandomRotationNode(speed) {
    const rotx = new Matrix4();
    const roty = new Matrix4();
    const rotz = new Matrix4();
    const incx = 2 * speed * Math.random() - speed;
    const incy = 2 * speed * Math.random() - speed;
    const incz = 2 * speed * Math.random() - speed;
    let angx = 30 * Math.random() - 15;
    let angy = 30 * Math.random() - 15;
    let angz = 30 * Math.random() - 15;
    const base = Node();
    base.update = seconds => {
        angx += incx * seconds;
        angy += incy * seconds;
        angz += incz * seconds;
        Matrix4.concatenate(Matrix4.createRotationY(angy, roty), Matrix4.createRotationX(angx, rotx), rotx);
        Matrix4.concatenate(rotx, Matrix4.createRotationZ(angz, rotz), rotx);
        base.localTransform = rotx;
    };
    return base;
}

function TransformNode(position, rotation, scale) {
    const matrix = new Matrix4();
    Matrix4.concatenate(rotation, Matrix4.createScale(scale, scale, scale), matrix);
    Matrix4.concatenate(Matrix4.createTranslation(position.x, position.y, position.z), matrix, matrix);
    return Node({ transform: matrix });
}

export default function createScene(data) {
    const planeMesh = buildGround();
    const objMesh = loadMesh('data', data);
    const root = Node().add(
        Node({
            transform: Matrix4.concatenate(Matrix4.createTranslation(0, -38.5, 0), Matrix4.createScale(200, 200, 200)),
            geometry: planeMesh
        }),
        Node({ transform: Matrix4.createScale(40, 40, 40) }).add(
            Node({ transform: Matrix4.createTranslation(0, 0, 0) }).add(
                SpinAboutY(0.9).add(Node({ geometry: objMesh })))
        )
    );

    // for (let i = 0; i < 50; i++) {
    //     const rx = 300 * Math.random() - 150;
    //     const ry = 150 * Math.random();
    //     const rz = 300 * Math.random() - 150;
    //     const scale = 10 + Math.random() * 25;
    //     const position = new Vector3(rx, ry, rz);
    //     const eulerRotation = Matrix4.createRotationY(Math.random());
    //     const positionAttitudeScaleNode = new TransformNode(position, eulerRotation, scale);
    //     positionAttitudeScaleNode.add(new RandomRotationNode(1).add(Node({ geometry: objMesh })));
    //     root.add(positionAttitudeScaleNode);
    // }

    return new Scene(root);
}
