export const DispatchStatus = {
  UNASSIGNED: "UNASSIGNED",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  DROPPED_OFF: "DROPPED_OFF",
} as const;

export type DispatchStatus = (typeof DispatchStatus)[keyof typeof DispatchStatus];

/** Valid transitions from each status */
export const DISPATCH_TRANSITIONS: Record<DispatchStatus, DispatchStatus[]> = {
  [DispatchStatus.UNASSIGNED]: [DispatchStatus.ASSIGNED],
  [DispatchStatus.ASSIGNED]: [DispatchStatus.PICKED_UP],
  [DispatchStatus.PICKED_UP]: [DispatchStatus.DROPPED_OFF],
  [DispatchStatus.DROPPED_OFF]: [],
};

export function canTransitionDispatch(from: DispatchStatus, to: DispatchStatus): boolean {
  return DISPATCH_TRANSITIONS[from].includes(to);
}
