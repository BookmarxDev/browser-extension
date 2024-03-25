import { Injectable } from '@angular/core';
import
{
	Auth,
	GoogleAuthProvider,
	User,
	UserCredential,
	applyActionCode,
	confirmPasswordReset,
	createUserWithEmailAndPassword,
	getRedirectResult,
	onIdTokenChanged,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithRedirect,
	signOut,
	updateProfile
} from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../../web-api/services/local-storage.service';
import { ActiveUserDetail } from '../models/active-user-detail';
import { ApiRequestHeader } from '../models/api-request-header';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class AuthService
{
	private readonly localUserStore: string = environment.memStorageKey;

	//#region Ctor

	constructor(
		private _firebaseAuth: Auth,
		private _localStorageService: LocalStorageService,
		private _router: Router
	)
	{
		// Refreshes the user any time a change is noticed
		// https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#onauthstatechanged
		this._firebaseAuth.onIdTokenChanged((user: any) =>
		{
			if (user)
			{
				var signedInUser = this._localStorageService.GetDeserializedItem<ActiveUserDetail>(this.localUserStore);

				if (signedInUser != null && signedInUser != undefined)
				{
					// Update the User property to contain the updated info so everything stays up to date
					signedInUser.User = user;
				}
			}
			else
			{
				// If no user is set then clear the storage item
				this._localStorageService.RemoveItem(this.localUserStore);
			}
		});
	}

	//#endregion Ctor

	//#region User Details

	/**
	 * A property that indicates whether or not a user is currently signed in.
	 */
	get IsLoggedIn(): boolean
	{
		let isLoggedIn = false;

		const userStore = this._localStorageService.GetDeserializedItem<ActiveUserDetail>(this.localUserStore);

		if (userStore != undefined
			&& userStore != null)
		{
			// So long as they have a user ID they're good
			isLoggedIn = userStore.User.uid != "";
		}

		return isLoggedIn;
	}

	public GetCurrentUser(): ActiveUserDetail
	{
		const userStore = this._localStorageService.GetDeserializedItem<ActiveUserDetail>(this.localUserStore);

		return userStore;
	}

	/**
	 * Manual option to set user data
	 * @param user 
	 */
	public SetUserData(user: ActiveUserDetail): void
	{
		this._localStorageService.SetItem<string, ActiveUserDetail>(this.localUserStore, user);
	}

	/**
	 * Get the currently logged in firebase user.
	 * Need to do this instead of rely on the User property to be sure it's 
	 * referencing the proper object with all available methods.
	 */
	public GetFirebaseUser(): Promise<User>
	{
		return new Promise((resolve, reject) =>
		{
			onIdTokenChanged(this._firebaseAuth, (user: User) =>
			{
				if (user != null)
				{
					resolve(user);
				}
				else
				{
					// No user to return just send back nothing so the next request can process.
					resolve(null);
				}
			});
		});
	}

	public GetAuthHeaders(): Promise<ApiRequestHeader>
	{
		return new Promise((resolve, reject) =>
		{
			this.GetFirebaseUser()
				.then((user: User) =>
				{
					if (user != null)
					{
						let apiRequestHeader = new ApiRequestHeader();
						apiRequestHeader.APIKey = user.uid;

						user.getIdToken().then((token: string) =>
						{
							apiRequestHeader.Token = token;
							resolve(apiRequestHeader);
						});
					}
					else
					{
						// No user to return just send back nothing so the next request can process.
						resolve(null);
					}
				});
		});
	}

	public UpdateDisplayName(user: ActiveUserDetail, displayName: string): Promise<void>
	{
		return updateProfile(user.User, {
			displayName: displayName
		});
	}

	/**
	 * A property that indicates whether or not the current user has a valid subscription.
	 */
	public ValidateSubscription(): boolean
	{
		let isSubscriptionValid = false;

		const userStore = this._localStorageService.GetDeserializedItem<ActiveUserDetail>(this.localUserStore);

		if (userStore != undefined
			&& userStore != null)
		{
			isSubscriptionValid = userStore.IsSubscriptionValid == true;
		}

		return isSubscriptionValid;
	}

	//#endregion User Details

	//#region Email Controls

	/**
	 * Sign in with email and password
	 * https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#signinwithemailandpassword
	 * @param email 
	 * @param password 
	 */
	public SignInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>
	{
		// Sanitize for good measure
		email = email.trim();
		password = password.trim()

		return signInWithEmailAndPassword(this._firebaseAuth, email, password);
	}

	/**
	 * Sign up with email and password
	 * https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#createuserwithemailandpassword
	 * @param email 
	 * @param password 
	 */
	public SignUpWithEmailAndPassword(email: string, password: string): Promise<UserCredential>
	{
		// Sanitize for good measure
		email = email.trim();
		password = password.trim()

		return createUserWithEmailAndPassword(this._firebaseAuth, email, password);
	}

	/**
	 * Verify an email address.
	 * @param actionCode - The code used to run the verification.
	 * @returns 
	 */
	public VerifyEmailAddress(actionCode: string): Promise<void>
	{
		return applyActionCode(this._firebaseAuth, actionCode);
	}

	//#endregion Email Controls

	//#region Google Controls

	/**
	 * https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#signinwithpopup
	 * @returns 
	 */
	public InitiateSignInWithGoogle(): Promise<UserCredential>
	{
		const provider = new GoogleAuthProvider();
		return signInWithRedirect(this._firebaseAuth, provider);
	}

	public ProcessRedirectResultFromGoogle(): Promise<UserCredential>
	{
		return getRedirectResult(this._firebaseAuth);
	}

	//#endregion Google Controls

	//#region Forgot Password Controls

	public ProcessPasswordReset(code: string, newPassword: string)
	{
		newPassword = newPassword.trim();

		return confirmPasswordReset(this._firebaseAuth, code, newPassword);
	}

	public SendForgotPasswordEmail(email: string)
	{
		email = email.trim();

		return sendPasswordResetEmail(this._firebaseAuth, email);
	}

	//#endregion Forgot Password Controls

	/**
	 * Log a user out
	 */
	public SignOut(): Promise<any>
	{
		return signOut(this._firebaseAuth)
			.then(() =>
			{
				this._localStorageService.RemoveItem(this.localUserStore);
				this._localStorageService.ClearAll();
				this._router.navigate(['/identity/login']);
			});
	}
}
