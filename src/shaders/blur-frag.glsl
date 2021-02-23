#version 300 es

precision mediump float;

const vec2 resolution = vec2(1920.0 / 2.0, 1080.0 / 2.0);

uniform sampler2D uSampler0;
uniform int uOrientation;

in vec2 uv;
out vec4 fragColor;

vec3 adjustExposure(vec3 color, float value) {
    return (1.0 + value) * color;
}

void main() {
    vec4 color = vec4(0.0);
    vec2 direction = mix(vec2(1.0, 0.0), vec2(0.0, 1.0), float(uOrientation == 0)) / resolution;
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.294117647058823) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture(uSampler0, uv) * 0.1964825501511404;
    color += texture(uSampler0, uv + off1) * 0.2969069646728344;
    color += texture(uSampler0, uv - off1) * 0.2969069646728344;
    color += texture(uSampler0, uv + off2) * 0.09447039785044732;
    color += texture(uSampler0, uv - off2) * 0.09447039785044732;
    color += texture(uSampler0, uv + off3) * 0.010381362401148057;
    color += texture(uSampler0, uv - off3) * 0.010381362401148057;
    fragColor = vec4(adjustExposure(color.rgb, 0.3), 1.0);
}
