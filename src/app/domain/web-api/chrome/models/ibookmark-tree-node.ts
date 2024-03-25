/**
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
 */
export interface IBookmarkTreeNode
{
	dateAdded: number;
	id: string;
	index: number;
	parentId: string;
	title: string;

	/**
	 * Optional.
	 * If this node is a folder, this property is omitted.
	 */
	url?: string;

	/**
	 * Optional.
	 * This field is omitted if the node is not a folder.
	 */
	children?: IBookmarkTreeNode[];
}