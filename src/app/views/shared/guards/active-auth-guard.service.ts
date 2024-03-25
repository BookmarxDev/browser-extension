import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

/**
 * Guards against viewing pages when someone is already logged in.
 */
@Injectable({
	providedIn: 'root'
})
export class ActiveAuthGuardService implements CanActivate
{
	/**
		 * Guards against viewing pages when someone is already logged in.
		 * https://angular.io/guide/router#preventing-unauthorized-access
		 * @param _authService 
		 * @param _router 
		 */
	constructor(private _authService: AuthService, private _router: Router) { }

	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
	{
		// If they are logged in then kick them to the feed
		if (this._authService.IsLoggedIn == true)
		{
			this._router.navigate(['/']);
		}

		return true;
	}
}
