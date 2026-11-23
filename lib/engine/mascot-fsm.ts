/**
 * Finite State Machine (FSM) and priority animation queue for Mascot "Mirzo".
 * Guarantees skipping/interrupting transitions settles at the exact same target state.
 */

export type MascotState =
  | 'idle'
  | 'speaking'
  | 'thinking'
  | 'happy'
  | 'encouraging'
  | 'celebrating'
  | 'sleeping'
  | 'streak';

export interface MascotCue {
  state: MascotState;
  subtitle: string;
  priority: number; // higher interrupts lower
  durationMs: number;
}

export interface MascotFsmSnapshot {
  currentState: MascotState;
  subtitle: string;
  queue: MascotCue[];
}

const STATE_PRIORITIES: Record<MascotState, number> = {
  sleeping: 0,
  idle: 1,
  thinking: 2,
  speaking: 3,
  encouraging: 4,
  happy: 5,
  streak: 6,
  celebrating: 7,
};

export function createMascotSnapshot(
  initialSubtitle = 'Salom! Men Mirzo. Bugun birga kod sirlarini ochamiz!'
): MascotFsmSnapshot {
  return {
    currentState: 'idle',
    subtitle: initialSubtitle,
    queue: [],
  };
}

export function dispatchMascotCue(
  snapshot: MascotFsmSnapshot,
  cue: Omit<MascotCue, 'priority'> & { priority?: number }
): MascotFsmSnapshot {
  const priority = cue.priority ?? STATE_PRIORITIES[cue.state];
  const currentPriority = STATE_PRIORITIES[snapshot.currentState];

  if (priority >= currentPriority) {
    return {
      currentState: cue.state,
      subtitle: cue.subtitle,
      queue: snapshot.queue,
    };
  }

  return {
    ...snapshot,
    queue: [...snapshot.queue, { ...cue, priority }].sort(
      (a, b) => b.priority - a.priority
    ),
  };
}

export function settleMascotStep(snapshot: MascotFsmSnapshot): MascotFsmSnapshot {
  if (snapshot.queue.length > 0) {
    const [next, ...rest] = snapshot.queue;
    return {
      currentState: next.state,
      subtitle: next.subtitle,
      queue: rest,
    };
  }

  return {
    currentState: 'idle',
    subtitle: snapshot.subtitle,
    queue: [],
  };
}

export function skipMascotQueue(snapshot: MascotFsmSnapshot): MascotFsmSnapshot {
  if (snapshot.queue.length === 0) {
    return {
      currentState: 'idle',
      subtitle: snapshot.subtitle,
      queue: [],
    };
  }
  const last = snapshot.queue[snapshot.queue.length - 1];
  return {
    currentState: 'idle',
    subtitle: last.subtitle,
    queue: [],
  };
}
