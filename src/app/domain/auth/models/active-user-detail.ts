import { User } from "@angular/fire/auth";

export class ActiveUserDetail
{
	public User: User = null;

	public OGID: string = "";

	public IsSubscriptionValid: boolean = false;

	// A cache date for the last check of the subscription state.
	public SubscriptionCheckTimestamp: number = 0;
}