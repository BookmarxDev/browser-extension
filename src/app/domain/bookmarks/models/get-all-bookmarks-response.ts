import { BookmarkCollection } from "../entities/bookmark-collection";

export class GetAllBookmarksResponse
{
	public BookmarkCollections: BookmarkCollection[] = [];

	public EncryptedPrivateKey: string;
}