import { Bookmark } from "./bookmark";
import * as uuid from "uuid";

export class BookmarkCollection
{
	constructor(depth?: number, title?: string, parentId?: string)
	{
		if (depth != null && title != null)
		{
			this.Id = uuid.v4();
			this.DateTimeAddedUTC = new Date().toISOString();
			this.Depth = depth;
			this.ParentId = parentId;
			this.Title = title;
		}
	}

	public BookmarksDecrypted: Bookmark[] = [];

	public BookmarksEncryptedJSON: string;

	/**
	 * This determines if its child collections are collapsed.
	 * Different from IsCollapsed which tells us about itself.
	 * This one is used to show the correct arrow icon.
	 * It also helps ensure that each child collection state is in sync.
	 */
	public ChildCollectionsCollapsed: boolean = false;

	public DateTimeAddedUTC: string;

	/**
	 * Represents the depth of the collection in the folder tree.
	 * Helps simplify the UI by indenting the collections.
	 */
	public Depth: number = 0;

	/**
	 * A flattened way of knowing if the collection has child collections.
	 * This is used to determine if the collection should have a toggle button.
	 */
	public HasChildren: boolean = false;

	/**
	 * Defaults to the unicode character for a file folder.
	 */
	public Icon: string = "&#x1F4C1;";

	/**
	 * A UUID that's generated for each bookmark collection.
	 */
	public Id: string;

	/**
	 * The index of the bookmark collection.
	 * Used to order the collections.
	 * Upon flattening the tree, this value is just 0, then it gets reassigned.
	 */
	public Index: number = 0;

	/**
	 * Just some UI magic to toggle the visibility of the collection.
	 * This is used to determine if the collection should be shown or not
	 * when it is a nested collection.
	 */
	public IsCollapsed: boolean = false;

	/**
	 * I hate this but it's the easiest way to indicate if the collection is the last child
	 * without having to iterate through the entire collection to find out, every single time.
	 */
	public IsLastChild: boolean = false;

	/**
	 * Soft deletes will keep collections and their child collections
	 * in a trash folder so that they can be restored, or permanently deleted.
	 */
	public IsSoftDeleted: boolean = false;

	/**
	 * The parent collection Id of the bookmark collection.
	 * If this is null, then it's a root collection.
	 */
	public ParentId: string;

	public Title: string = "N/A";

	public TotalBookmarks: number = 0;

	public Map(collection: BookmarkCollection): void
	{
		this.BookmarksEncryptedJSON = collection.BookmarksEncryptedJSON;
		this.ChildCollectionsCollapsed = collection.ChildCollectionsCollapsed;
		this.DateTimeAddedUTC = collection.DateTimeAddedUTC;
		this.Depth = collection.Depth;
		this.HasChildren = collection.HasChildren;
		this.Icon = collection.Icon;
		this.Id = collection.Id;
		this.Index = collection.Index;
		this.IsCollapsed = collection.IsCollapsed;
		this.IsLastChild = collection.IsLastChild;
		this.IsSoftDeleted = collection.IsSoftDeleted;
		this.ParentId = collection.ParentId;
		this.Title = collection.Title;
		this.TotalBookmarks = collection.TotalBookmarks;
	}
}