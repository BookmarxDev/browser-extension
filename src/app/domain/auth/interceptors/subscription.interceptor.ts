import { Injectable } from '@angular/core';
import
	{
		HttpRequest,
		HttpHandler,
		HttpEvent,
		HttpInterceptor,
		HttpResponse
	} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * https://angular.io/guide/http#intercepting-requests-and-responses
 */
@Injectable()
export class SubscriptionInterceptor implements HttpInterceptor
{
	/**
	 * @param _authService
	 */
	constructor(private _authService: AuthService) { }

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
	{
		return next.handle(req).pipe(
			tap(res =>
			{
				if (res instanceof HttpResponse)
				{
					let subStat = res.headers.get('X-Sub-Stat');
					if (subStat != null)
					{
						let currentUser = this._authService.GetCurrentUser();
						if (currentUser != null)
						{
							// So long as the two dates are being set and compared in the same
							// timezone it shouldn't matter that no locale is specified here.
							let newCacheTimestamp = new Date().getTime();

							// First check the cache for if we've already validated within the last hour.
							if (currentUser.SubscriptionCheckTimestamp > 0)
							{
								let millisecondsDifference = Math.abs(newCacheTimestamp - currentUser.SubscriptionCheckTimestamp);
								let hoursDifference = millisecondsDifference / (1000 * 60 * 60);

								// If an hour or more has passed then update the time and the value.
								if (hoursDifference > 1)
								{
									currentUser.SubscriptionCheckTimestamp = newCacheTimestamp;
									currentUser.IsSubscriptionValid = subStat === 'true' ? true : false;
								}
							}
							else
							{
								// Nothing was ever set, just set it.
								currentUser.SubscriptionCheckTimestamp = newCacheTimestamp;
								currentUser.IsSubscriptionValid = subStat === 'true' ? true : false;
							}

							// Set the user info to whatever changes took effect.
							this._authService.SetUserData(currentUser);
						}
					}
				}
			})
		)
	}
}
