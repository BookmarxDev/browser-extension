import { Component } from '@angular/core';
import { BasePageDirective } from '../shared/base-page.directive';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-not-found',
	templateUrl: './not-found.component.html',
	styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent extends BasePageDirective
{
	constructor(private route: ActivatedRoute, private titleService: Title)
	{
		super(route, titleService);
	}
}
