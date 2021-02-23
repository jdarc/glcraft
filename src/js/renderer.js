import { createDataTexture, createImageTexture, createVertexBuffer } from "./toolkit";
import Matrix4 from "./matrix4";

let defaultColorTexture = null;
let defaultBlackTexture = null;
const generateDefaultTextures = gl => {
    defaultColorTexture = defaultColorTexture || createDataTexture(gl, 1, 1, new Uint8Array([127, 127, 255, 255]));
    defaultBlackTexture = defaultBlackTexture || createDataTexture(gl, 1, 1, new Uint8Array([0, 0, 0, 255]));
};

export default function Renderer(gl) {
    generateDefaultTextures(gl);
    let activeProgram = null;

    return {
        set program(program) {
            activeProgram = program.use();
        },
        set ambientTexture(map) {
            activeProgram.ambientTexture(map || defaultColorTexture);
        },
        set diffuseTexture(map) {
            activeProgram.diffuseTexture(map || defaultColorTexture);
        },
        set normalTexture(map) {
            activeProgram.normalTexture(map || defaultColorTexture);
        },
        set emissiveTexture(map) {
            activeProgram.emissiveTexture(map || defaultBlackTexture);
        },
        createImageTexture: image => createImageTexture(gl, image),
        createVertexBuffer: data => createVertexBuffer(gl, data),
        set transform(value) {
            activeProgram.setWorldMatrix(value.elements);
            activeProgram.setNormalMatrix(Matrix4.invert(value).elements);
        },
        draw(buffer, count) {
            activeProgram.bindVertexBuffer(buffer);
            gl.drawArrays(gl.TRIANGLES, 0, count);
        }
    }
}
