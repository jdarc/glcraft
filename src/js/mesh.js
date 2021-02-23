export default (data, count) => ({
    render(renderer) {
        this.buffer = this.buffer || renderer.createVertexBuffer(data);
        renderer.draw(this.buffer, count);
    }
})
