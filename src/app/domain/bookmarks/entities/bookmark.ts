import * as uuid from 'uuid';

export class Bookmark
{
	constructor(title?: string, url?: string, parentId?: string)
	{
		if (title != null && url != null && parentId != null)
		{
			this.Id = uuid.v4();
			this.Title = title;
			this.Url = url;
			this.ParentId = parentId;
		}
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

	public Map(bookmark: Bookmark): void
	{
		this.DateTimeAddedUTC = bookmark.DateTimeAddedUTC;
		this.Description = bookmark.Description;
		this.Id = bookmark.Id;
		this.Index = bookmark.Index;
		this.Note = bookmark.Note;
		this.ParentId = bookmark.ParentId;
		this.Title = bookmark.Title;
		this.Url = bookmark.Url;
	}
}