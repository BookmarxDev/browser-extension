import { IBookmarkTreeNode } from "../../web-api/chrome/models/ibookmark-tree-node";

export class BookmarkTreeNode
{
	constructor(existingBookmarkTreeNode: IBookmarkTreeNode)
	{
		if (existingBookmarkTreeNode != null)
		{
			this.DateAdded = existingBookmarkTreeNode.dateAdded;
			this.Id = existingBookmarkTreeNode.id;
			this.Index = existingBookmarkTreeNode.index;
			this.ParentId = existingBookmarkTreeNode.parentId;
			this.Title = existingBookmarkTreeNode.title;

			if (existingBookmarkTreeNode.url != null
				&& existingBookmarkTreeNode.url != undefined
				&& existingBookmarkTreeNode.url != "")
			{
				this.Url = existingBookmarkTreeNode.url;
			}

			if (existingBookmarkTreeNode.children)
			{
				this.Children = existingBookmarkTreeNode.children.map((child) => new BookmarkTreeNode(child));
			}
		}
	}

	/**
	 * Optional.
	 * This field is omitted if the node is not a folder.
	 * However, for the purpose of drag-and-drop sorting it needs to be an empty array.
	 */
	public Children?: BookmarkTreeNode[] = [];

	public DateAdded: number;

	/**
	 * Defaults to the unicode character for a file folder.
	 */
	public Icon: string = "&#x1F4C1;";

	/**
	 * A UUID that's generated for each bookmark node.
	 */
	public Id: string;

	public Index: number;

	public ParentId: string;

	public Title: string;

	/**
	 * Optional.
	 * If this node is a folder, this property is omitted.
	 */
	public Url?: string;
}