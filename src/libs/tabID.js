let created;
let id;

export function initializeID() {
    created = Date.now();
    id = Date.now() * 1024 + Math.floor(Math.random() * 1024);
}

export { id, created };