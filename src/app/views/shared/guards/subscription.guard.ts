import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate
{
	/**
	 * Guards against viewing pages that require a valid subscription.
	 * https://angular.io/guide/router#preventing-unauthorized-access
	 * @param _authService 
	 * @param _router 
	 */
	constructor(private _authService: AuthService, private _router: Router, private _activeRoute: ActivatedRoute) { }

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
	{
		// If their subscription is not valid then kick them to the home (albums) page.
		// They will be instructed to select a subscription option in order to continue.
		if (!this._authService.ValidateSubscription())
		{
			// Doing a hard reload here so any modals work properly.
			window.location.reload();
		}

		return true;
	}
}