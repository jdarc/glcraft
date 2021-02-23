import Matrix4 from "./matrix4";

function renderGeometry(transform, geometry) {
    return (renderer) => {
        renderer.transform = transform;
        geometry.render(renderer);
    };
}

export default (options = {}) => {
    const childNodes = [];
    const localTransform = options.transform || new Matrix4();
    const worldTransform = new Matrix4();
    const renderFn = options.geometry ? renderGeometry(worldTransform, options.geometry) : () => null;

    return {
        set localTransform(value) {
            localTransform.copy(value);
        },
        add(...children) {
            children.forEach(child => {
                if (child._parent !== this) {
                    child._parent = this;
                    childNodes.push(child);
                }
            });
            return this;
        },
        traverse(visitor) {
            visitor(this) && childNodes.forEach(child => child.traverse(visitor));
        },
        update() {
        },
        worldTransform() {
            return worldTransform;
        },
        transform() {
            this._parent && Matrix4.concatenate(this._parent.worldTransform(), localTransform, worldTransform)
        },
        render: renderFn
    }

}
