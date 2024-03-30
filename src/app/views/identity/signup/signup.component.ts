import { Component } from '@angular/core';
import { BasePageDirective } from '../../shared/base-page.directive';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActiveUserDetail } from 'src/app/domain/auth/models/active-user-detail';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { UserCredential, sendEmailVerification } from '@angular/fire/auth';
import { MemberAccountCreateRequest } from 'src/app/domain/membership/models/member-account-create-request';
import { MembershipAuthService } from 'src/app/domain/membership/services/membership-auth.service';
import { IdentityActionResponseDto } from 'src/app/domain/membership/models/identity-action-response-dto';
import { ParticlesConfig } from '../../shared/config/particles-config';
import * as openpgp from 'openpgp';
import * as bcrypt from 'bcryptjs';
import { environment } from 'src/environments/environment';

declare let particlesJS: any;

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
})
export class SignupComponent extends BasePageDirective
{
	@BlockUI()
	private _blockUI: NgBlockUI;
	private _ig: string;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _router: Router,
		private _membershipAuthService: MembershipAuthService)
	{
		super(_route, _titleService);
	}

	//#region Properties

	public FormError: string = "";
	public CurrentYear: string = "";

	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public SignUpForm = new FormGroup({
		signUpEmail: new FormControl('', [
			Validators.required,
			Validators.minLength(3)
		]),
		signUpPassword: new FormControl('', [
			Validators.required,
			Validators.minLength(8)
		]),
		signUpFirstName: new FormControl('', [
			Validators.required,
			Validators.minLength(1)
		]),
		signUpLastName: new FormControl('', [
			Validators.required,
			Validators.minLength(1)
		]),
	});

	get SignUpEmail() { return this.SignUpForm.get('signUpEmail'); }
	get SignUpPassword() { return this.SignUpForm.get('signUpPassword'); }
	get SignUpFirstName() { return this.SignUpForm.get('signUpFirstName'); }
	get SignUpLastName() { return this.SignUpForm.get('signUpLastName'); }

	//#endregion Properties

	//#region OnInit

	public override	ngOnInit(): void
	{
		particlesJS('particles-su-js', ParticlesConfig, function () { });

		let currentDate = new Date();
		this.CurrentYear = currentDate.getFullYear().toString();
	}

	//#endregion OnInit

	//#region Signups

	/**
	 * Process the sign up and update some basic user info.
	 * https://firebase.google.com/docs/reference/js/v8/firebase.User?authuser=1#updateprofile
	 */
	public ProcessSignUpWithEmailAndPassword(): void
	{
		this._blockUI.start();

		// Reset any error messages
		this.FormError = "";

		let signupEmail = this.SignUpEmail?.value.trim();
		let firstName = this.SignUpFirstName?.value.trim();
		let lastName = this.SignUpLastName?.value.trim();
		let signupPassword = this.SignUpPassword?.value.trim();

		// Creates a user with Google Firebase
		this._authService.SignUpWithEmailAndPassword(
			signupEmail,
			signupPassword
		)
			.then((res: UserCredential) =>
			{
				// If no user exists and signup was successful.
				// Send a confirmation email right away.
				sendEmailVerification(res.user);

				res.user.getIdToken()
					.then((token: string) =>
					{
						if (token != "")
						{
							const fullName = `${ firstName } ${ lastName }`;

							// After signup we don't care that they verify their email, next time they 
							// log in they'll be asked to verify it. Just make it easy right now.
							// Need to manually set the data so the auth guard works
							// Immediately update the users first and last name
							let memberAccountCreateRequest = new MemberAccountCreateRequest();
							memberAccountCreateRequest.AccessToken = token;
							memberAccountCreateRequest.AuthProviderUID = res.user.uid;
							memberAccountCreateRequest.EmailAddress = signupEmail;
							memberAccountCreateRequest.FirstName = firstName;
							memberAccountCreateRequest.LastName = lastName;

							// Generate a new salt
							const salt = bcrypt.genSaltSync(environment.defaultCostFactor);
							memberAccountCreateRequest.SaltCostFactor = environment.defaultCostFactor;
							memberAccountCreateRequest.UserSalt = salt;

							var hash = bcrypt.hashSync(signupPassword, salt);

							this.GenerateKeyPair(hash, fullName, signupEmail, memberAccountCreateRequest)
								.then(() =>
								{
									this._membershipAuthService.CreateNewMemberAccount(memberAccountCreateRequest)
										.subscribe((response: IdentityActionResponseDto) =>
										{
											let activeUserDetail = new ActiveUserDetail();
											activeUserDetail.User = res.user;
											activeUserDetail.MemberAccountID = response.MemberAccountID;
											activeUserDetail.IsSubscriptionValid = response.IsSubscriptionValid;
											activeUserDetail.UserHash = hash;
											activeUserDetail.PublicKey = memberAccountCreateRequest.PublicKey;

											this._authService.UpdateDisplayName(activeUserDetail, fullName)
												.then(() =>
												{
													this.SetUserDataAndRedirect(activeUserDetail);
													this._blockUI.stop();
												});
										});
								});
						}
					});
			}).catch((err: any) =>
			{
				// Handle all form errors here
				// https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth?authuser=1#createuserwithemailandpassword
				let errorCode = err.code; // A code
				let errorMessage = ""; // And a message for the code

				switch (errorCode)
				{
					// Any error just tell em the password or email is wrong
					case "auth/email-already-in-use":
						errorMessage = "Email is already in use, please try logging in.";
						break;
					case "auth/invalid-email":
						errorMessage = "Invalid email, please enter a valid email.";
						break;
					case "auth/operation-not-allowed":
						errorMessage = "Oops, something went wrong, please contact us for support.";
						break;
					case "auth/weak-password":
						errorMessage = "Your password is not strong enough.";
						break;
				}

				this.FormError = errorMessage;
			});
	}

	//#endregion Signups

	//#region Private Methods

	private SetUserDataAndRedirect(activeUserDetail: ActiveUserDetail): void
	{
		// Need to manually set the data so the auth guard works
		this._authService.SetUserData(activeUserDetail);
		this._router.navigate(['/']);
	}

	// https://www.npmjs.com/package/openpgp#generate-new-key-pair
	private async GenerateKeyPair(
		hash: string,
		name: string,
		email: string,
		memberAccountCreateRequest: MemberAccountCreateRequest): Promise<void>
	{
		const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
			type: 'ecc', // Type of the key, defaults to ECC
			curve: 'curve25519', // ECC curve name, defaults to curve25519
			userIDs: [{ name: name, email: email }], // you can pass multiple user IDs
			passphrase: hash, // protects the private key
			format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
		});

		memberAccountCreateRequest.PasswordProtectedPrivateKey = privateKey;
		memberAccountCreateRequest.PublicKey = publicKey;
	}

	//#endregion Private Methods
}
