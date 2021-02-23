import { compileShader, createProgram, createVertexBuffer } from "./toolkit";
import Matrix4 from "./matrix4";

const generateShader = (gl, vertexShaderSrc, fragmentShaderSrc) => {
    const vertexShader = compileShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSrc, gl.FRAGMENT_SHADER);
    const shader = createProgram(gl, vertexShader, fragmentShader);

    shader.attributes = ["aVertexPosition", "aVertexNormal", "aTextureCoord"];
    shader.attributes.forEach(it => shader[it] = gl.getAttribLocation(shader, it))

    const totalUniforms = gl.getProgramParameter(shader, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < totalUniforms; ++i) {
        const { name } = gl.getActiveUniform(shader, i);
        shader[name] = gl.getUniformLocation(shader, name);
    }

    return shader;
};

export function Program(gl, vertexShaderSrc, fragmentShaderSrc) {
    let currentViewMatrix = new Matrix4();
    let currentProjMatrix = new Matrix4();
    return {
        gl,
        shader: generateShader(gl, vertexShaderSrc, fragmentShaderSrc),
        use() {
            gl.useProgram(this.shader);
            this.shader.attributes.forEach(it => this.shader[it] >= 0 && gl.enableVertexAttribArray(this.shader[it]))
            return this;
        },
        bindVertexBuffer(buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            if (this.shader["aVertexPosition"] !== -1) {
                gl.vertexAttribPointer(this.shader["aVertexPosition"], 3, gl.FLOAT, false, 32, 0);
            }
            if (this.shader["aVertexNormal"] !== -1) {
                gl.vertexAttribPointer(this.shader["aVertexNormal"], 3, gl.FLOAT, false, 32, 12);
            }
            if (this.shader["aTextureCoord"] !== -1) {
                gl.vertexAttribPointer(this.shader["aTextureCoord"], 2, gl.FLOAT, false, 32, 24);
            }
        },
        moveLightTo(x, y, z) {
            this.shader["uLightPosition"] && gl.uniform3f(this.shader["uLightPosition"], x, y, z);
        },
        setWorldMatrix(matrix) {
            this.shader["umModel"] && gl.uniformMatrix4fv(this.shader["umModel"], false, matrix);
            if (this.shader["umModelViewProj"]) {
                const full = Matrix4.concatenate(Matrix4.concatenate(currentProjMatrix, currentViewMatrix), new Matrix4(matrix));
                this.shader["umModelViewProj"] && gl.uniformMatrix4fv(this.shader["umModelViewProj"], false, full.elements);
            }
        },
        setNormalMatrix(elements) {
            this.shader["umNorm"] && gl.uniformMatrix4fv(this.shader["umNorm"], false, elements);
        },
        setViewMatrix(elements) {
            currentViewMatrix = new Matrix4(elements)
            this.shader["umView"] && gl.uniformMatrix4fv(this.shader["umView"], false, elements);
        },
        setProjectionMatrix(elements) {
            currentProjMatrix = new Matrix4(elements)
            this.shader["umProj"] && gl.uniformMatrix4fv(this.shader["umProj"], false, elements);
        },
        setLightMatrix(elements) {
            this.shader["umLightMatrix"] && gl.uniformMatrix4fv(this.shader["umLightMatrix"], false, elements);
        },
        depthTextureMap(map) {
            if (!this.shader["uDepthSampler"]) return;
            gl.activeTexture(gl.TEXTURE4);
            gl.uniform1i(this.shader["uDepthSampler"], 4);
            gl.bindTexture(gl.TEXTURE_2D, map);
        },
        ambientTexture(map) {
            if (!this.shader["uAmbientOccSampler"]) return;
            gl.activeTexture(gl.TEXTURE2);
            gl.uniform1i(this.shader["uAmbientOccSampler"], 2);
            gl.bindTexture(gl.TEXTURE_2D, map);
        },
        diffuseTexture(map) {
            if (!this.shader["uDiffuseSampler"]) return;
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(this.shader["uDiffuseSampler"], 0);
            gl.bindTexture(gl.TEXTURE_2D, map);
        },
        normalTexture(map) {
            if (!this.shader["uNormalSampler"]) return;
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(this.shader["uNormalSampler"], 1);
            gl.bindTexture(gl.TEXTURE_2D, map);
        },
        emissiveTexture(map) {
            if (!this.shader["uEmissiveSampler"]) return;
            gl.activeTexture(gl.TEXTURE3);
            gl.uniform1i(this.shader["uEmissiveSampler"], 3);
            gl.bindTexture(gl.TEXTURE_2D, map);
        }
    };
}

export const BlurProgram = (gl, vsCode, fsCode) => Object.assign(Program(gl, vsCode, fsCode), ({
    execute(sourceFrameBuffer, blurFrameBuffer) {
        this.vertexBuffer = this.vertexBuffer || createVertexBuffer(gl, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]));
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.uniform1i(this.shader["uSampler0"], 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const buffers = [sourceFrameBuffer, blurFrameBuffer]
        for (let i = 0; i < 6; ++i) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[1 - (i & 1)]);
            gl.uniform1i(this.shader["uOrientation"], i & 1);
            gl.bindTexture(gl.TEXTURE_2D, buffers[i & 1].colorTexture);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }
}));


export const CompositeProgram = (gl, vsCode, fsCode) => Object.assign(Program(gl, vsCode, fsCode), ({
    execute(srcFrameBuffer, dstFrameBuffer) {
        this.vertexBuffer = this.vertexBuffer || createVertexBuffer(gl, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]));
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(this.shader["uSampler0"], 0);
        gl.uniform1i(this.shader["uSampler1"], 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dstFrameBuffer.colorTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, srcFrameBuffer.colorTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this["aPositionAttribute"], 2, gl.FLOAT, false, 0, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}))

