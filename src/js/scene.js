export default function Scene(root) {

    this.update = seconds => {
        root.traverse(node => {
            node.update(seconds);
            node.transform();
            return true;
        });
    };

    this.render = renderer => {
        root.traverse(node => {
            node.render(renderer);
            return true;
        });
    }
}
