import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';

@Component({
	selector: 'app-dialog-delete-collection',
	templateUrl: './dialog-delete-collection.component.html',
	styleUrls: ['./dialog-delete-collection.component.scss']
})
export class DialogDeleteCollectionComponent implements OnInit
{
	constructor(
		public dialogRef: MatDialogRef<DialogDeleteCollectionComponent>,
		@Inject(MAT_DIALOG_DATA) public BookmarkCollection: BookmarkCollection) { }

	public ngOnInit(): void
	{
	}

	public CloseDialog(): void
	{
		this.dialogRef.close();
	}

	public ConfirmDelete(): void
	{
		this.BookmarkCollection.IsSoftDeleted = true;
		this.dialogRef.close(this.BookmarkCollection);
	}
}
