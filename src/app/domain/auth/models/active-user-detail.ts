import { User } from "@angular/fire/auth";

export class ActiveUserDetail
{
	public IsSubscriptionValid: boolean = false;

	public MemberAccountID: string = "";

	public PublicKey: string = "";

	// A cache date for the last check of the subscription state.
	public SubscriptionCheckTimestamp: number = 0;

	public User: User = null;

	public UserHash: string = "";
}