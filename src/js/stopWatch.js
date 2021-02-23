export default function StopWatch() {
    let elapsed = 0;
    let tock = -1;

    return {
        get elapsedSeconds() {
            return elapsed / 1000.0;
        },
        tick(timestamp) {
            if (tock < 0) tock = timestamp;
            elapsed = (timestamp - tock);
            tock = timestamp;
        }
    }
}
