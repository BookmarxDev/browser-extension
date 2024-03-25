import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

/**
 * Guards against viewing pages when someone is not logged in.
 */
@Injectable({
	providedIn: 'root'
})
export class InactiveAuthGuardService implements CanActivate
{
	/**
	 * Guards against viewing pages that require being logged in.
	 * https://angular.io/guide/router#preventing-unauthorized-access
	 * @param _authService 
	 * @param _router 
	 */
	constructor(private _authService: AuthService, private _router: Router) { }

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
	{
		// If they are not logged in kick them to the login page
		if (this._authService.IsLoggedIn !== true)
		{
			this._router.navigate(['identity/login']);
		}

		return true;
	}
}
