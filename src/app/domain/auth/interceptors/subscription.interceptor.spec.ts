import { TestBed } from '@angular/core/testing';

import { SubscriptionInterceptor } from './subscription.interceptor';

describe('SubscriptionInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SubscriptionInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SubscriptionInterceptor = TestBed.inject(SubscriptionInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
