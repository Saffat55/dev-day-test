interface Element {
  sprite?: {
    play: () => void,
    pause: () => void,
    playOnce: ({
      frameStart: number,
      frameEnd: number,
      frameRate: number
    }) => void,
    playLoop: ({
      frameStart: number,
      frameEnd: number,
      frameRate: number
    }) => void,
    onComplete: (callback: () => void) => void,
    onLoop: (callback: () => void) => void
  };
}