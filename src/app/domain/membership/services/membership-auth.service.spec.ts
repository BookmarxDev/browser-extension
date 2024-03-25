import { TestBed } from '@angular/core/testing';

import { MembershipAuthService } from './membership-auth.service';

describe('MembershipAuthService', () => {
  let service: MembershipAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MembershipAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
