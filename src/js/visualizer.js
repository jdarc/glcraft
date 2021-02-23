import glowVertSource from '../shaders/glow-vert.glsl';
import glowFragSource from '../shaders/glow-frag.glsl';
import renderVertSource from '../shaders/render-vert.glsl';
import renderFragSource from '../shaders/render-frag.glsl';
import depthVertSource from '../shaders/depth-vert.glsl';
import depthFragSource from '../shaders/depth-frag.glsl';
import quadVertSource from '../shaders/quad-vert.glsl';
import blendFragSource from '../shaders/blend-frag.glsl';
import blurFragSource from '../shaders/blur-frag.glsl';

import Vector3 from "./vector3";
import Matrix4 from "./matrix4";
import Renderer from "./renderer";
import { Program, BlurProgram, CompositeProgram } from "./program";
import { createDepthFramebuffer, createTextureFramebuffer } from "./toolkit";

const LIGHT_SCALE_MATRIX = new Matrix4([0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0]);

export default canvas => {
    const projMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    const lightView = new Matrix4();
    const lightProj = new Matrix4();
    const lightViewMatrix = new Float32Array(16);
    const lightProjMatrix = new Float32Array(16);
    const lightMatrix = new Float32Array(16);
    const light = new Vector3(0, 1, 0);

    const gl = canvas.getContext('webgl2');
    const glowProgram = Program(gl, glowVertSource, glowFragSource);
    const shaderProgram = Program(gl, renderVertSource, renderFragSource);
    const depthProgram = Program(gl, depthVertSource, depthFragSource);
    const blendProgram = CompositeProgram(gl, quadVertSource, blendFragSource);
    const blurProgram = BlurProgram(gl, quadVertSource, blurFragSource);
    const renderer = Renderer(gl);

    let depthMap;
    let emissiveMap;
    let glowMap;
    let renderMap;

    return {
        set view(matrix) {
            matrix.toArray(viewMatrix);
        },
        set proj(matrix) {
            matrix.toArray(projMatrix);
        },
        viewport(width, height) {
            glowMap && glowMap.delete();
            depthMap && depthMap.delete();
            renderMap && renderMap.delete();
            emissiveMap && emissiveMap.delete();

            depthMap = createDepthFramebuffer(gl, 2048, 2048);
            glowMap = createTextureFramebuffer(gl, width / 2, height / 2);
            emissiveMap = createTextureFramebuffer(gl, width / 2, height / 2);
            renderMap = createTextureFramebuffer(gl, width, height);
        },
        moveLightTo(x, y, z) {
            light.setTo(x, y, z);
            Matrix4.createLookAt(light, new Vector3(), new Vector3(0, 1, 0), lightView);
            Matrix4.createOrthographic(-200, 200, -200, 200, 1, 1000, lightProj);
            lightView.toArray(lightViewMatrix);
            lightProj.toArray(lightProjMatrix);
        },
        render(scene) {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.depthFunc(gl.LEQUAL);
            gl.clearColor(0, 0, 0, 1);

            const renderScene = (frameBuffer, program, glSetup) => {
                renderer.program = program;
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                glSetup();
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                scene.render(renderer);
            };

            gl.viewport(0, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2);
            renderScene(emissiveMap, glowProgram, () => {
                glowProgram.setViewMatrix(viewMatrix);
                glowProgram.setProjectionMatrix(projMatrix);
            });

            gl.viewport(0, 0, 2048, 2048);
            renderScene(depthMap, depthProgram, () => {
                depthProgram.setViewMatrix(lightViewMatrix);
                depthProgram.setProjectionMatrix(lightProjMatrix);
            });

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            renderScene(renderMap, shaderProgram, () => {
                Matrix4.concatenate(LIGHT_SCALE_MATRIX, Matrix4.concatenate(lightProj, lightView)).toArray(lightMatrix)
                shaderProgram.moveLightTo(light.x, light.y, light.z);
                shaderProgram.setViewMatrix(viewMatrix);
                shaderProgram.setProjectionMatrix(projMatrix);
                shaderProgram.setLightMatrix(lightMatrix);
                shaderProgram.depthTextureMap(depthMap.depthTexture);
            });

            gl.viewport(0, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2);
            blurProgram.use().execute(emissiveMap, glowMap)

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            blendProgram.use().execute(renderMap, emissiveMap);
        }
    }
}
