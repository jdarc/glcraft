#version 300 es

in vec3 aVertexPosition;

uniform mat4 umModelViewProj;

void main() {
   gl_Position = umModelViewProj * vec4(aVertexPosition, 1.0);
}
