export class MemberAccountCreateRequest
{
	public AccessToken: string;

	public AuthProviderUID: string;

	public EmailAddress: string;

	public FirstName: string;

	public LastName: string;

	public PasswordProtectedPrivateKey: string;

	public PublicKey: string;

	public SaltCostFactor: number;

	public UserSalt: string;
}
