export default class Matrix4 {

    constructor(data = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) {
        this.elements = new Float32Array(data);
    }

    copy(src) {
        this.elements.set(src.elements, 0);
        return this;
    }

    toArray(dst = new Float32Array(16)) {
        dst.set(this.elements, 0);
        return dst;
    }

    static concatenate(lhs, rhs, dst = new Matrix4()) {
        const [aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, an, ao, ap] = lhs.elements;
        const [ba, bb, bc, bd, be, bf, bg, bh, bi, bj, bk, bl, bm, bn, bo, bp] = rhs.elements;
        dst.elements[0] = aa * ba + ae * bb + ai * bc + am * bd;
        dst.elements[1] = ab * ba + af * bb + aj * bc + an * bd;
        dst.elements[2] = ac * ba + ag * bb + ak * bc + ao * bd;
        dst.elements[3] = ad * ba + ah * bb + al * bc + ap * bd;
        dst.elements[4] = aa * be + ae * bf + ai * bg + am * bh;
        dst.elements[5] = ab * be + af * bf + aj * bg + an * bh;
        dst.elements[6] = ac * be + ag * bf + ak * bg + ao * bh;
        dst.elements[7] = ad * be + ah * bf + al * bg + ap * bh;
        dst.elements[8] = aa * bi + ae * bj + ai * bk + am * bl;
        dst.elements[9] = ab * bi + af * bj + aj * bk + an * bl;
        dst.elements[10] = ac * bi + ag * bj + ak * bk + ao * bl;
        dst.elements[11] = ad * bi + ah * bj + al * bk + ap * bl;
        dst.elements[12] = aa * bm + ae * bn + ai * bo + am * bp;
        dst.elements[13] = ab * bm + af * bn + aj * bo + an * bp;
        dst.elements[14] = ac * bm + ag * bn + ak * bo + ao * bp;
        dst.elements[15] = ad * bm + ah * bn + al * bo + ap * bp;
        return dst;
    }

    static invert(src, dst = new Matrix4()) {
        const m00 = src.elements[0];
        const m01 = src.elements[1];
        const m02 = src.elements[2];
        const m03 = src.elements[3];
        const m10 = src.elements[4];
        const m11 = src.elements[5];
        const m12 = src.elements[6];
        const m13 = src.elements[7];
        const m20 = src.elements[8];
        const m21 = src.elements[9];
        const m22 = src.elements[10];
        const m23 = src.elements[11];
        const m30 = src.elements[12];
        const m31 = src.elements[13];
        const m32 = src.elements[14];
        const m33 = src.elements[15];
        const b00 = m00 * m11 - m10 * m01
        const b01 = m00 * m21 - m20 * m01
        const b02 = m00 * m31 - m30 * m01
        const b03 = m10 * m21 - m20 * m11
        const b04 = m10 * m31 - m30 * m11
        const b05 = m20 * m31 - m30 * m21
        const b06 = m02 * m13 - m12 * m03
        const b07 = m02 * m23 - m22 * m03
        const b08 = m02 * m33 - m32 * m03
        const b09 = m12 * m23 - m22 * m13
        const b10 = m12 * m33 - m32 * m13
        const b11 = m22 * m33 - m32 * m23
        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
        const invDet = 1 / det
        dst.elements[0] = (b11 * m11 - b10 * m21 + b09 * m31) * invDet
        dst.elements[1] = (b10 * m20 - b11 * m10 - b09 * m30) * invDet
        dst.elements[2] = (b05 * m13 - b04 * m23 + b03 * m33) * invDet
        dst.elements[3] = (b04 * m22 - b05 * m12 - b03 * m32) * invDet
        dst.elements[4] = (b08 * m21 - b11 * m01 - b07 * m31) * invDet
        dst.elements[5] = (b11 * m00 - b08 * m20 + b07 * m30) * invDet
        dst.elements[6] = (b02 * m23 - b05 * m03 - b01 * m33) * invDet
        dst.elements[7] = (b05 * m02 - b02 * m22 + b01 * m32) * invDet
        dst.elements[8] = (b10 * m01 - b08 * m11 + b06 * m31) * invDet
        dst.elements[9] = (b08 * m10 - b10 * m00 - b06 * m30) * invDet
        dst.elements[10] = (b04 * m03 - b02 * m13 + b00 * m33) * invDet
        dst.elements[11] = (b02 * m12 - b04 * m02 - b00 * m32) * invDet
        dst.elements[12] = (b07 * m11 - b09 * m01 - b06 * m21) * invDet
        dst.elements[13] = (b09 * m00 - b07 * m10 + b06 * m20) * invDet
        dst.elements[14] = (b01 * m13 - b03 * m03 - b00 * m23) * invDet
        dst.elements[15] = (b03 * m02 - b01 * m12 + b00 * m22) * invDet
        return dst;
    }

    static createScale(x, y, z, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[0] = x;
        dst.elements[5] = y;
        dst.elements[10] = z;
        dst.elements[15] = 1;
        return dst;
    }

    static createTranslation(x, y, z, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[12] = x;
        dst.elements[13] = y;
        dst.elements[14] = z;
        dst.elements[0] = dst.elements[5] = dst.elements[10] = dst.elements[15] = 1;
        return dst;
    }

    static createRotationX(angle, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[5] = dst.elements[10] = Math.cos(angle);
        dst.elements[6] = Math.sin(angle);
        dst.elements[9] = -dst.elements[6];
        dst.elements[0] = dst.elements[15] = 1;
        return dst;
    }

    static createRotationY(angle, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[0] = dst.elements[10] = Math.cos(angle);
        dst.elements[8] = Math.sin(angle);
        dst.elements[2] = -dst.elements[8];
        dst.elements[5] = dst.elements[15] = 1;
        return dst;
    }

    static createRotationZ(angle, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[0] = dst.elements[5] = Math.cos(angle);
        dst.elements[1] = Math.sin(angle);
        dst.elements[4] = -dst.elements[1];
        dst.elements[10] = dst.elements[15] = 1;
        return dst;
    }

    static createLookAt(eye, center, up, dst = new Matrix4()) {
        const z0 = eye.x - center.x;
        const z1 = eye.y - center.y;
        const z2 = eye.z - center.z;
        const lz = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        const x0 = up.y * z2 - up.z * z1;
        const x1 = up.z * z0 - up.x * z2;
        const x2 = up.x * z1 - up.y * z0;
        const lx = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        const y0 = z1 * x2 - z2 * x1;
        const y1 = z2 * x0 - z0 * x2;
        const y2 = z0 * x1 - z1 * x0;
        const ly = 1 / Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        dst.elements[0] = x0 * lx;
        dst.elements[1] = y0 * ly;
        dst.elements[2] = z0 * lz;
        dst.elements[3] = 0;
        dst.elements[4] = x1 * lx;
        dst.elements[5] = y1 * ly;
        dst.elements[6] = z1 * lz;
        dst.elements[7] = 0;
        dst.elements[8] = x2 * lx;
        dst.elements[9] = y2 * ly;
        dst.elements[10] = z2 * lz;
        dst.elements[11] = 0;
        dst.elements[12] = -(x0 * eye.x + x1 * eye.y + x2 * eye.z) * lx;
        dst.elements[13] = -(y0 * eye.x + y1 * eye.y + y2 * eye.z) * ly;
        dst.elements[14] = -(z0 * eye.x + z1 * eye.y + z2 * eye.z) * lz;
        dst.elements[15] = 1;
        return dst;
    }

    static createPerspectiveFov(fov, aspectRatio, nearPlane, farPlane, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[5] = 1 / Math.tan(fov * Math.PI / 360);
        dst.elements[0] = dst.elements[5] / aspectRatio;
        dst.elements[10] = -(farPlane + nearPlane) / (farPlane - nearPlane);
        dst.elements[11] = -1;
        dst.elements[14] = -(2 * farPlane * nearPlane) / (farPlane - nearPlane);
        return dst;
    }

    static createOrthographic(left, right, bottom, top, near, far, dst = new Matrix4()) {
        dst.elements.fill(0);
        dst.elements[0] = 2 / (right - left);
        dst.elements[5] = 2 / (top - bottom);
        dst.elements[10] = -2 / (far - near);
        dst.elements[12] = -(right + left) / (right - left);
        dst.elements[13] = -(top + bottom) / (top - bottom);
        dst.elements[14] = -(far + near) / (far - near);
        dst.elements[15] = 1;
        return dst;
    }
}
