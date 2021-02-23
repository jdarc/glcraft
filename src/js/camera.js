import Vector3 from "./vector3";
import Matrix4 from "./matrix4";

const MOVE_FORWARD = 1;
const MOVE_BACKWARD = 2;
const MOVE_LEFT = 4;
const MOVE_RIGHT = 8;

export default (canvas) => {
    const eye = new Vector3(0, 0, 1);
    const center = new Vector3();
    let yaw = 0;
    let pitch = 0;
    let mouseX = 0;
    let mouseY = 0;
    let dragging = false;
    let movementMask = 0;

    return {
        get view() {
            return Matrix4.createLookAt(eye, center, new Vector3(0, 1, 0));
        },
        get projection() {
            return Matrix4.createPerspectiveFov(45.0, canvas.width / canvas.height, 0.1, 1000.0);
        },
        moveTo(x, y, z) {
            eye.x = x;
            eye.y = y;
            eye.z = z;
        },
        lookAt(x, y, z) {
            center.x = x;
            center.y = y;
            center.z = z;
        },
        keyUp(e) {
            if (e.code === 'KeyW') {
                movementMask ^= MOVE_FORWARD;
            } else if (e.code === 'KeyS') {
                movementMask ^= MOVE_BACKWARD;
            } else if (e.code === 'KeyA') {
                movementMask ^= MOVE_LEFT;
            } else if (e.code === 'KeyD') {
                movementMask ^= MOVE_RIGHT;
            }
        },
        keyDown(e) {
            if (e.code === 'KeyW') {
                movementMask |= MOVE_FORWARD;
            } else if (e.code === 'KeyS') {
                movementMask |= MOVE_BACKWARD;
            } else if (e.code === 'KeyA') {
                movementMask |= MOVE_LEFT;
            } else if (e.code === 'KeyD') {
                movementMask |= MOVE_RIGHT;
            }
        },
        mouseDown() {
            dragging = true;
        },
        mouseMove(e) {
            if (dragging) {
                yaw += (mouseX - e.clientX) * 0.005;
                pitch = Math.min(1.57, Math.max(-1.57, pitch + (mouseY - e.clientY) * 0.005));
            }
            mouseX = e.clientX;
            mouseY = e.clientY;
        },
        mouseUp() {
            dragging = false;
        },
        update(seconds, speed) {
            const x = -Math.sin(yaw) * Math.cos(pitch);
            const y = Math.sin(pitch);
            const z = -Math.cos(yaw) * Math.cos(pitch);
            const scaledSpeed = seconds * speed;
            const invLen = 1 / Math.sqrt(x * x + z * z);

            if ((movementMask & MOVE_FORWARD) === MOVE_FORWARD) {
                eye.x += x * scaledSpeed;
                eye.y += y * scaledSpeed;
                eye.z += z * scaledSpeed;
            } else if ((movementMask & MOVE_BACKWARD) === MOVE_BACKWARD) {
                eye.x -= x * scaledSpeed;
                eye.y -= y * scaledSpeed;
                eye.z -= z * scaledSpeed;
            }

            if ((movementMask & MOVE_LEFT) === MOVE_LEFT) {
                eye.x += z * scaledSpeed * invLen;
                eye.z -= x * scaledSpeed * invLen;
            } else if ((movementMask & MOVE_RIGHT) === MOVE_RIGHT) {
                eye.x -= z * scaledSpeed * invLen;
                eye.z += x * scaledSpeed * invLen;
            }

            this.lookAt(eye.x + x, eye.y + y, eye.z + z)
        }
    };
}
