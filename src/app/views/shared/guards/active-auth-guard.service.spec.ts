import { TestBed } from '@angular/core/testing';
import { ActiveAuthGuardService } from './active-auth-guard.service';

describe('ActiveAuthService', () =>
{
	let service: ActiveAuthGuardService;

	beforeEach(() =>
	{
		TestBed.configureTestingModule({});
		service = TestBed.inject(ActiveAuthGuardService);
	});

	it('should be created', () =>
	{
		expect(service).toBeTruthy();
	});
});
