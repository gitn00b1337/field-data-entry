
export function generateUUID() {
    const val = `${Date.now() + Math.random()}`.replace(/[.]/g, '');
    
    return `id_${val}`;
}
