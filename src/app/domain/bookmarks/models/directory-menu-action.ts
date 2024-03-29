import { BookmarkCollection } from "../entities/bookmark-collection";
import { DirectoryMenuChangeType } from "../enums/directory-menu-change-type";

export class DirectoryMenuAction
{
	public ChangeType: DirectoryMenuChangeType;

	public NewBookmarkCollection: BookmarkCollection;

	public OriginalBookmarkCollection: BookmarkCollection;
}
