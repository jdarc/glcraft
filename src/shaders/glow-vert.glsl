#version 300 es

in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 umModelViewProj;

out vec2 uv;

void main() {
    uv = aTextureCoord;
    gl_Position = umModelViewProj * vec4(aVertexPosition, 1.0);
}
