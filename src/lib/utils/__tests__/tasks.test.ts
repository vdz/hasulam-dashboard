import { describe, expect, it } from 'vitest';
import { sortForViewer, taskDue, toggledStatus } from '../tasks';

const feast = new Date('2026-12-01T16:00:00Z');

describe('taskDue', () => {
  it('counts the offset back from the event start', () => {
    const due = taskDue({ eventStart: feast, offsetDays: -28, note: null });
    expect(due).toEqual({ kind: 'date', date: new Date('2026-11-03T16:00:00Z'), offsetDays: -28 });
  });

  it('falls back to the free-text note when the offset is unknown', () => {
    expect(taskDue({ eventStart: feast, offsetDays: null, note: 'אחרי משימה 1' })).toEqual({ kind: 'note', note: 'אחרי משימה 1' });
  });

  it('reports unknown when neither is set', () => {
    expect(taskDue({ eventStart: feast, offsetDays: null, note: null })).toEqual({ kind: 'unknown' });
  });
});

describe('toggledStatus', () => {
  it('marks an open task done and a done task open again', () => {
    expect(toggledStatus('todo')).toBe('done');
    expect(toggledStatus('done')).toBe('todo');
  });
});

describe('sortForViewer', () => {
  it('lists open tasks first, then by event date and template order', () => {
    const later = new Date('2027-01-01T00:00:00Z');
    const sorted = sortForViewer([
      { id: 'a', status: 'done' as const, eventStart: feast, position: 1 },
      { id: 'b', status: 'todo' as const, eventStart: later, position: 1 },
      { id: 'c', status: 'todo' as const, eventStart: feast, position: 5 },
      { id: 'd', status: 'todo' as const, eventStart: feast, position: 2 },
    ]);
    expect(sorted.map((t) => t.id)).toEqual(['d', 'c', 'b', 'a']);
  });
});
