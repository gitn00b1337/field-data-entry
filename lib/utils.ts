
export function generateUUID() {
    const val = `${Date.now() + Math.random()}`.replace(/[.]/g, '');
    
    return `id_${val}`;
}

export function formatTotalSecondsToTimeString(totalSeconds: number) {
    const cleanSeconds = Number(totalSeconds) || 0;
    const hours = Math.floor(cleanSeconds / 3600);
    const minutes = Math.floor((cleanSeconds - hours*3600) / 60);
    const seconds = Math.floor((cleanSeconds - hours*3600 - minutes*60));

    function formatTimePart(part: number) {
        return part.toLocaleString('en-GB', { minimumIntegerDigits: 2, useGrouping: false });
    }

    return `${formatTimePart(hours)}:${formatTimePart(minutes)}:${formatTimePart(seconds)}`;
}