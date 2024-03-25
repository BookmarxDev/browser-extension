import { Component } from '@angular/core';
import { BasePageDirective } from '../../shared/base-page.directive';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
	selector: 'app-action',
	templateUrl: './action.component.html',
	styleUrls: ['./action.component.scss']
})
export class ActionComponent extends BasePageDirective
{
	private _queryParamsOnInitSubscription: Subscription;
	private _queryParamsProcessResetSubscription: Subscription;
	private _queryParamsEmailConfirmSubscription: Subscription;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _router: Router,
		private _meta: Meta,
	)
	{
		super(_route, _titleService);
	}

	// https://angular.io/api/core/ng-container
	public FormError: string = "";
	public FormSuccess: string = "";
	public CurrentYear: string = "";
	public IsPasswordResetAction = false;
	public IsVerifyEmailAction = false;

	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public PasswordResetForm = new FormGroup({
		newPassword: new FormControl('', [
			Validators.required,
			Validators.minLength(8)
		]),
		newPasswordVerification: new FormControl('', [
			Validators.required,
			Validators.minLength(8)
		])
	});

	get NewPassword() { return this.PasswordResetForm.get('newPassword'); }
	get NewPasswordVerification() { return this.PasswordResetForm.get('newPasswordVerification'); }

	public override ngOnInit(): void
	{
		this._meta.addTags([
			{ name: "description", content: "Reset your password to log in to your account." },
		]);

		let currentDate = new Date();
		this.CurrentYear = currentDate.getFullYear().toString();

		// Check which type of action this is and show appropriate form
		this._queryParamsOnInitSubscription = this._route.queryParams.subscribe(params =>
		{
			// Can be one of three vals: resetPassword, recoverEmail or verifyEmail
			let actionToPerform = params['mode'];

			// Firebase sends: mode and oobCode in the reset params
			if (actionToPerform == "resetPassword")
			{
				this.IsPasswordResetAction = true;
			}
			else if (actionToPerform == "verifyEmail")
			{
				this.IsVerifyEmailAction = true;
				this.ProcessEmailVerification();
			}
		});
	}

	/**
	 * Sign the user in, son!
	 */
	public ProcessPasswordReset(): void
	{
		// Reset any error messages
		this.FormError = "";

		if (this.NewPassword.value !== this.NewPasswordVerification.value)
		{
			this.FormError = "Your passwords do not match.";
		}
		else
		{
			// https://angular.io/guide/router#getting-route-information
			this._queryParamsProcessResetSubscription = this._route.queryParams.subscribe(params =>
			{
				// Firebase sends: mode and oobCode in the reset params
				const resetCode = params['oobCode'];
				if (resetCode != undefined && resetCode != null && resetCode != "")
				{
					this._authService.ProcessPasswordReset(resetCode, this.NewPassword?.value)
						.then(() =>
						{
							this.FormSuccess = "Password reset successful! You will be redirected to the login in a few seconds.";
							setTimeout(() =>
							{
								this._router.navigate(['/']);
							}, 4000);
						}).catch((err: any) =>
						{
							// Handle all form errors here
							// https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#confirmpasswordreset
							let errorCode = err.code; // A code
							let errorMessage = ""; // And a message for the code

							switch (errorCode)
							{
								// Any error just tell em the password or email is wrong
								case "auth/expired-action-code":
								case "auth/invalid-action-code":
								case "auth/user-not-found":
								case "auth/weak-password":
									errorMessage = "Something went wrong please try again.";
									break;
							}

							this.FormError = errorMessage;
						});
				}
				else
				{

					this.FormError = "Something went wrong, please try again.";
				}
			});
		}
	}

	private ProcessEmailVerification(): void
	{
		// https://angular.io/guide/router#getting-route-information
		this._queryParamsEmailConfirmSubscription = this._route.queryParams.subscribe(params =>
		{
			// Firebase sends: mode and oobCode in the reset params
			const verificationCode = params['oobCode'];
			if (verificationCode != undefined && verificationCode != null && verificationCode != "")
			{
				this._authService.VerifyEmailAddress(verificationCode)
					.then(() =>
					{
						this.FormSuccess = "Your email has been verified! Please click the link below to log in to your account.";
					}).catch((err: any) =>
					{
						this.FormError = "This verification code is invalid or expired. Please click the link below to try logging in again. You will be sent a new verification code.";
					});
			}
			else
			{

				this.FormError = "Something went wrong, please try again.";
			}
		});
	}

	public ngOnDestroy()
	{
		this._queryParamsOnInitSubscription != undefined ?? this._queryParamsOnInitSubscription.unsubscribe();
		this._queryParamsProcessResetSubscription != undefined ?? this._queryParamsProcessResetSubscription.unsubscribe();
		this._queryParamsEmailConfirmSubscription != undefined ?? this._queryParamsEmailConfirmSubscription.unsubscribe();
	}
}