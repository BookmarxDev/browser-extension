export class IdentityActionResponseDto
{
	public Errors: string[] = [];

	public IsSubscriptionValid: boolean = false;

	public MemberAccountID: string = "";

	public PublicKey: string = "";

	public SaltCostFactor: string = "";

	public UserSalt: string = "";
}