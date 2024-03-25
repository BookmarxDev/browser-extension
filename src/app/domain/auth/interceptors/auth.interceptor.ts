import { Injectable } from '@angular/core';
import
{
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpHeaders
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiRequestHeader } from '../models/api-request-header';

/**
 * Angular Interceptors
 * https://angular.io/guide/http#setting-default-headers
 * https://angular.io/guide/http#provide-the-interceptor
 * https://stackoverflow.com/questions/45978813/use-a-promise-in-angular-httpclient-interceptor#answer-45979654
 * The AuthInterceptor intercepts every single HTTP request and tacks on an auth
 * token to be passed along for use in any endpoint requiring authentication/authorization.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
	/**
	 * @param _authService
	 */
	constructor(private _authService: AuthService) { }

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
	{
		return from(this._authService.GetAuthHeaders())
			.pipe(
				switchMap((apiRequestHeader: ApiRequestHeader) =>
				{
					const bearerToken = `Bearer ${ apiRequestHeader?.Token }`;

					// Clone the request and replace the original headers with
					// cloned headers, updated with the authorization
					const headers = new HttpHeaders({
						'Authorization': bearerToken,
						'X-Api-Key': apiRequestHeader?.APIKey ?? ""
					});

					const authReq = req.clone({ headers });

					return next.handle(authReq);
				})
			);
	}
}
