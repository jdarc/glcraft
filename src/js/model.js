const imageToTexture = (renderer, part, name) => {
    const img = `${name}Image`;
    const map = `${name}Texture`;
    if (part.material[img]) {
        part.material[map] = part.material[map] || renderer.createImageTexture(part.material[img]);
        delete part.material[img];
    }
    return part.material[map];
};

export default parts => ({
    render(renderer) {
        parts.forEach(part => {
            renderer.ambientTexture = imageToTexture(renderer, part, "ambient");
            renderer.diffuseTexture = imageToTexture(renderer, part, "diffuse");
            renderer.normalTexture = imageToTexture(renderer, part, "normal");
            renderer.emissiveTexture = imageToTexture(renderer, part, "emissive");
            part.mesh.render(renderer);
        });
    }
})
