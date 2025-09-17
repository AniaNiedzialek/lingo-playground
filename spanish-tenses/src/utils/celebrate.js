import confetti from "canvas-confetti";

export function busrtConfetti() {
    confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 45,
        origin: { y:0.6}
    });
}
