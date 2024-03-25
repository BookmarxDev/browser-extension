import { Injectable } from '@angular/core';
import { UserCredential, GoogleAuthProvider } from '@angular/fire/auth';
// import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { MemberAccountCreateRequest } from '../../membership/models/member-account-create-request';
import { MembershipAuthService } from '../../membership/services/membership-auth.service';
import { AuthService } from './auth.service';
import { ActiveUserDetail } from '../models/active-user-detail';
import { IdentityActionResponseDto } from '../../membership/models/identity-action-response-dto';

@Injectable({
	providedIn: 'root'
})
export class GoogleAuthService
{
	constructor(
		private _authService: AuthService,
		private _membershipAuthService: MembershipAuthService,
		// private _recaptchaV3Service: ReCaptchaV3Service
	) { }

	public ProcessRedirectResultFromGoogle(recaptchaSubscription: Subscription, ig?: string): Promise<ActiveUserDetail>
	{
		return new Promise((resolve, reject) =>
		{
			this._authService.ProcessRedirectResultFromGoogle()
				.then((userCredential: UserCredential) =>
				{
					// MUST have a null check here, if this is not part of the redirect flow then do nothing
					if (userCredential != null)
					{
						// This gives you a Google Access Token. You can use it to access the Google API.
						const credential = GoogleAuthProvider.credentialFromResult(userCredential);
						const token = credential.accessToken;

						// Get the user's name and configure for the account
						let userDisplayName = userCredential.user.displayName.split(" ");
						let firstName = userDisplayName[0];
						let lastName = userDisplayName[1];

						userCredential.user.getIdToken()
							.then((token: string) =>
							{
								if (token != "")
								{
									// recaptchaSubscription = this._recaptchaV3Service.execute("signup_action")
									// 	.subscribe({
									// 		next: (reCAPTCHAToken: string) =>
									// 		{
									// After signup we don't care that they verify their email, next time they 
									// log in they'll be asked to verify it. Just make it easy right now.
									// Need to manually set the data so the auth guard works
									// Immediately update the users first and last name
									let memberAccountCreateRequest = new MemberAccountCreateRequest();
									memberAccountCreateRequest.APID = userCredential.user.uid;
									memberAccountCreateRequest.EmailAddress = userCredential.user.email;
									memberAccountCreateRequest.FirstName = firstName;
									memberAccountCreateRequest.LastName = lastName;
									memberAccountCreateRequest.AccessToken = token;
									// memberAccountCreateRequest.ReCAPTCHAToken = reCAPTCHAToken;
									memberAccountCreateRequest.IG = ig;

									this._membershipAuthService.SignInWithGoogle(memberAccountCreateRequest)
										.subscribe((response: IdentityActionResponseDto) =>
										{
											let activeUserDetail = new ActiveUserDetail();
											activeUserDetail.User = userCredential.user;
											activeUserDetail.OGID = response.OGID;
											activeUserDetail.IsSubscriptionValid = response.IsSubscriptionValid;

											resolve(activeUserDetail);
										});
									// 	}
									// });
								}
							});
					}
				}).catch((err: any) =>
				{
					reject(err);
				});
		});
	}
}