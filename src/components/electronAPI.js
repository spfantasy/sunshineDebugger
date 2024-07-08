
export async function listNode(keyword) {
    return await window.electron.fetchData("listNode", {"keyword": keyword});
}

export async function getNode(keyword) {
    return await window.electron.fetchData("getNode", {"keyword": keyword});
}

export async function fetchJson(filename) {
    return await window.electron.fetchData("json", {"filename": filename});
}
