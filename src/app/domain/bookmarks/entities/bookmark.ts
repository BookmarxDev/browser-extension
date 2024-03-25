import * as uuid from 'uuid';

export class Bookmark
{
	constructor(title: string, url: string, parentId: string)
	{
		this.Id = uuid.v4();
		this.Title = title;
		this.Url = url;
		this.ParentId = parentId;
	}

	public DateTimeAddedUTC: string;

	public Description: string;

	/**
	 * A UUID that's generated for each bookmark.
	 */
	public Id: string;

	/**
	 * The index of the bookmark, used for sorting.
	 */
	public Index: number;

	public Note: string;

	/**
	 * The parent collection Id of the bookmark.
	 */
	public ParentId: string;

	public Title: string;

	public Url: string;
}