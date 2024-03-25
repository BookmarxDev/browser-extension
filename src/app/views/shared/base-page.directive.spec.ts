import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from './base-page.directive';
import { Title } from '@angular/platform-browser';

describe('BasePageDirective', () =>
{
	it('should create an instance', () =>
	{
		let route: ActivatedRoute = new ActivatedRoute();
		let titleService: Title = new Title(null);
		const directive = new BasePageDirective(route, titleService);
		expect(directive).toBeTruthy();
	});
});
