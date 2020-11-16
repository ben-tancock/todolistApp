import { TestBed } from '@angular/core/testing';

import { PushnotificationsService } from './pushnotifications.service';

describe('PushnotificationsService', () => {
  let service: PushnotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PushnotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
