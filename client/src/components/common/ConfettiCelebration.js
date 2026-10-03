import confetti from 'canvas-confetti';

export const triggerSubtleConfetti = () => {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4f63e9', '#10b981', '#f59e0b', '#8b5cf6'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Ignore in unsupported environments
  }
};

export const triggerMajorConfetti = () => {
  try {
    const end = Date.now() + 1000;
    const colors = ['#4f63e9', '#10b981', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {}
};
