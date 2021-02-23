const process = (items, rootPath, resources, cb) => {
    const total = items.length;
    let current = 0;
    [...items].forEach(item => fetch(`${rootPath}/${item.url}`).then(response => response.text()).then(data => {
        resources[item.key] = data;
        if (++current === total) cb(resources);
    }));
    items.splice(0);
};

export default rootPath => {
    const loaded = [];
    const pending = [];

    return {
        add: (key, url) => pending.push({ key, url }),
        load: cb => process(pending, rootPath, loaded, cb)
    }
}
