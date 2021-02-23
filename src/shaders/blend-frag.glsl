#version 300 es

precision mediump float;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

in vec2 uv;
out vec4 fragColor;

void main() {
    fragColor = texture(uSampler0, uv) + texture(uSampler1, uv);
}
