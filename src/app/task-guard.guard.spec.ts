import { TestBed } from '@angular/core/testing';

import { TaskGuardGuard } from './task-guard.guard';

describe('TaskGuardGuard', () => {
  let guard: TaskGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TaskGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
