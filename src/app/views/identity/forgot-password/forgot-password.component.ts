import { Component } from '@angular/core';
import { BasePageDirective } from '../../shared/base-page.directive';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent extends BasePageDirective
{
	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService)
	{
		super(_route, _titleService);
	}

	public FormError: string = "";
	public FormMessage: string = "";
	public CurrentYear: string = "";


	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public ForgotPasswordForm = new FormGroup({
		forgotPasswordEmail: new FormControl('', [
			Validators.required,
			Validators.minLength(3)
		])
	});

	get ForgotPasswordEmail() { return this.ForgotPasswordForm.get('forgotPasswordEmail'); }

	public override ngOnInit(): void
	{
		let currentDate = new Date();
		this.CurrentYear = currentDate.getFullYear().toString();
	}

	/**
	   * Sign the user in, son!
	   */
	public ProcessForgotPassword(): void
	{
		// Reset any error messages
		this.FormError = "";

		this._authService.SendForgotPasswordEmail(this.ForgotPasswordEmail?.value)
			.then(() =>
			{
				this.ForgotPasswordForm.reset();
				this.ForgotPasswordForm.markAsPristine();
				this.ForgotPasswordForm.markAsUntouched();
				this.FormMessage = "Password reset email sent. Please check your inbox.";
			}).catch((err: any) =>
			{
				// Handle all form errors here
				// https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#sendpasswordresetemail
				let errorCode = err.code; // A code
				let errorMessage = ""; // And a message for the code

				switch (errorCode)
				{
					// Any error just tell em the password or email is wrong
					case "auth/invalid-email":
					case "auth/wrong-password":
					case "auth/user-not-found":
					case "auth/user-disabled":
						errorMessage = "Email or password incorrect.";
						break;
				}

				this.FormError = errorMessage;
			});
	}
}
