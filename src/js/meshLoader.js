import Factory from "./factory";
import Material from "./material";
import Loader from "./loader";

const loadTextureMap = (resourcePath, materials, filename, materialName, materialType) => {
    const image = new Image();
    image.onload = () => materials[materialName][materialType] = image;
    image.src = `${resourcePath}/${filename}`;
};

const processMaterials = (resourcePath, filename, materials) => {
    const loader = Loader(resourcePath);
    loader.add('material-directives', filename);
    loader.load(resources => {
        let name = '';
        resources['material-directives'].split('\n').map(it => it.trim()).filter(it => it.length > 0 && it.charAt(0) !== '#')
            .forEach(line => {
                const fragments = line.split(' ');
                const key = fragments[0];
                const value = fragments[1];
                switch (key.toLowerCase()) {
                    case 'newmtl':
                        name = value;
                        break;
                    case 'map_kd':
                        loadTextureMap(resourcePath, materials, value, name, 'diffuseImage');
                        break;
                    case 'norm':
                        loadTextureMap(resourcePath, materials, value, name, 'normalImage');
                        break;
                    case 'map_ao':
                        loadTextureMap(resourcePath, materials, value, name, 'ambientImage');
                        break;
                    case 'map_ke':
                        loadTextureMap(resourcePath, materials, value, name, 'emissiveImage');
                        break;
                }
            });
    });
};

export default function loadMesh(resourcePath = '', directives) {
    const materials = [];
    const factory = Factory();
    directives.split('\n').forEach(line => {
        switch (line.substring(0, line.indexOf(' ')).toLowerCase()) {
            case 'mtllib':
                processMaterials(resourcePath, line.split(' ')[1].trim(), materials);
                break;
            case 'v':
                factory.addVertex(line.match(/v (.*) (.*) (.*)/).slice(1).map(parseFloat));
                break;
            case 'vn':
                factory.addNormal(line.match(/vn (.*) (.*) (.*)/).slice(1).map(parseFloat));
                break;
            case 'vt': {
                factory.addUv(line.match(/vt (.*) (.*)/).slice(1).map(parseFloat));
                break;
            }
            case 'f':
                const vx = [], vn = [], vt = [];
                const match = line.match(/f (.*) (.*) (.*)/).splice(1);
                for (let j = 0; j < match.length; j++) {
                    const fragments = match[j].split('/');
                    vx.push(parseInt(fragments[0]) - 1);
                    vt.push(parseInt(fragments[1]) - 1);
                    vn.push(parseInt(fragments[2]) - 1);
                }
                factory.addFace(vx, vn, vt);
                break;
            case 'usemtl':
                const name = line.match(/usemtl (.*)/)[1];
                !materials[name] && (materials[name] = new Material(name));
                factory.useMaterial(materials[name]);
                break;
        }
    });

    return factory.compile();
}
