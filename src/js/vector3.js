export default class Vector3 {

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    setTo(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(vec) {
        return this.setTo(vec.x, vec.y, vec.z)
    }

    add(rhs) {
        return this.setTo(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z)
    }

    normalize() {
        const invLen = 1 / this.length();
        return this.setTo(this.x * invLen, this.y * invLen, this.z * invLen)
    }
}
