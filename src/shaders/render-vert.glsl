#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform mat4 umModel;
uniform mat4 umNorm;
uniform mat4 umView;
uniform mat4 umProj;

uniform vec3 uLightPosition;
uniform mat4 umLightProj;
uniform mat4 umLightView;
uniform mat4 umLightMatrix;

out vec4 vDepthPosition;
out vec4 vNormal;
out vec4 vLightDir;
out vec4 vToEye;
out vec2 vUv;

void main() {
    vUv = aTextureCoord;

    vec4 worldVertex = umModel * vec4(aVertexPosition, 1.0);
    vec4 viewVertex = umView * worldVertex;
    
    vDepthPosition = umLightMatrix * worldVertex;

    vNormal = umView * umModel * vec4(aVertexNormal, 0);
    vLightDir = vec4(uLightPosition, 0.0) - viewVertex;
    vToEye = -viewVertex;

    gl_Position = umProj * viewVertex;
}
