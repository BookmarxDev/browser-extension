import { Directive, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DataAttribute } from './models/data-attribute';

@Directive({
	selector: '[appBasePage]'
})
export class BasePageDirective implements OnInit
{
	constructor(route: ActivatedRoute, titleService: Title)
	{
		route.data.subscribe((data: any): void =>
		{
			console.log(data);
			// Access the data property from the route configuration.
			const myData = (data as DataAttribute).title ?? "Bookmarx";

			// Set the page title
			titleService.setTitle(myData);
		});
	}

	/**
	 * Override in any inherited classes.
	 */
	public ngOnInit(): void
	{
	}
}
