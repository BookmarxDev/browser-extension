import { TestBed } from '@angular/core/testing';

import { InactiveAuthGuardService } from './inactive-auth-guard.service';

describe('AuthGuardService', () =>
{
	let service: InactiveAuthGuardService;

	beforeEach(() =>
	{
		TestBed.configureTestingModule({});
		service = TestBed.inject(InactiveAuthGuardService);
	});

	it('should be created', () =>
	{
		expect(service).toBeTruthy();
	});
});
