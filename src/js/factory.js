import Mesh from "./mesh";
import Model from "./model";
import Vector3 from "./vector3";

const ELEMENTS = 3 * 8;

export default () => {
    let materials = {}, vertices = [], normals = [], uvs = [], faces = [], materialId = 0;
    return {
        useMaterial(material) {
            materialId = material.name;
            materials[materialId] = material;
        },
        addVertex(xyz) {
            vertices.push(xyz);
        },
        addNormal(xyz) {
            normals.push(xyz);
        },
        addUv(uv) {
            uvs.push(uv);
        },
        addFace(v, vn, vt) {
            faces.push({ vertex: v, normal: vn, uv: vt, m: materialId });
        },
        compile() {
            const materialBuckets = faces.reduce((rv, x) => {
                (rv[x.m] = rv[x.m] || []).push(x);
                return rv;
            }, {});

            const materialMesh = [];
            for (const bucket in materialBuckets) {
                if (materialBuckets.hasOwnProperty(bucket)) {
                    const faces = materialBuckets[bucket];
                    const buffer = new Float32Array(faces.length * ELEMENTS);
                    let offset = 0;
                    faces.forEach(face => {
                        buffer.set([
                                ...vertices[face.vertex[0]],
                                ...normals[face.normal[0]],
                                ...uvs[face.uv[0]],
                                ...vertices[face.vertex[1]],
                                ...normals[face.normal[1]],
                                ...uvs[face.uv[1]],
                                ...vertices[face.vertex[2]],
                                ...normals[face.normal[2]],
                                ...uvs[face.uv[2]]],
                            offset);
                        offset += ELEMENTS;
                    });
                    materialMesh.push({
                        material: materials[bucket],
                        mesh: Mesh(buffer, faces.length * 3)
                    });
                }
            }
            return Model(materialMesh);
        }
    }
}
