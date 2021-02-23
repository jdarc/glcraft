#version 300 es

precision highp float;

const vec3 AMBIENT = vec3(0.4, 0.35, 0.35);
const float BIAS = -0.006;
const float DEPTH_PIXEL_SIZE = 1.0 / 2048.0;

uniform sampler2D uDepthSampler;
uniform sampler2D uAmbientOccSampler;
uniform sampler2D uDiffuseSampler;
uniform sampler2D uNormalSampler;

in vec4 vDepthPosition;
in vec4 vNormal;
in vec4 vLightDir;
in vec4 vToEye;
in vec2 vUv;

out vec4 fragColor;

mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {
    vec3 dp1 = dFdx(p);
    vec3 dp2 = dFdy(p);
    vec2 duv1 = dFdx(uv);
    vec2 duv2 = dFdy(uv);
    vec3 dp2perp = cross(dp2, N);
    vec3 dp1perp = cross(N, dp1);
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
    float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
    return mat3(T * invmax, B * invmax, N);
}

vec3 perturbNormal(vec3 N, vec3 V, vec2 texcoord) {
    vec3 map = (texture(uNormalSampler, texcoord).xyz * 255.0 - 128.0) / 127.0;
    return normalize(cotangentFrame(N, -V, texcoord) * map);
}

void main() {
    vec3 L = normalize(vLightDir.xyz);
    vec3 V = normalize(vToEye.xyz);
    vec3 N = perturbNormal(normalize(vNormal.xyz), V, vUv);

    vec3 baseColor = texture(uDiffuseSampler, vUv).rgb * vec3(texture(uAmbientOccSampler, vUv).b);

    vec3 finalColor = vec3(0.0);
    float lambertTerm = dot(N, L);
    if (lambertTerm > 0.0) {
        float shadow = 9.0;
        vec3 xyz = vDepthPosition.xyz / vDepthPosition.w;
        float depth = xyz.z + BIAS;
        for (int y = -1; y < 2; ++y) {
            for (int x = -1; x < 2; ++x) {
                vec2 offset = xyz.xy + vec2(float(x) * DEPTH_PIXEL_SIZE, float(y) * DEPTH_PIXEL_SIZE);
                bool inWindow = offset.x > 0.0 && offset.x < 1.0 && offset.y > 0.0 && offset.y < 1.0;
                if (inWindow && texture(uDepthSampler, offset).r < depth) {
                    shadow -= 1.0;
                }
            }
        }
        float specular = pow(max(dot(reflect(-L, N), V), 0.0), 15.0);
        finalColor += (lambertTerm * baseColor + vec3(specular)) * (shadow / 9.0);
    }

    fragColor = vec4(AMBIENT * baseColor + finalColor, 1.0);
}
