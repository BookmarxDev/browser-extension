import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';
import { DialogDeleteCollectionComponent } from '../../dialogs/dialog-delete-collection/dialog-delete-collection.component';

@Component({
	selector: 'app-directory-menu',
	templateUrl: './directory-menu.component.html',
	styleUrls: ['./directory-menu.component.scss']
})
export class DirectoryMenuComponent implements OnInit
{
	constructor(public _dialog: MatDialog) { }

	@Input()
	public RespectiveBookmarkCollection: BookmarkCollection = new BookmarkCollection();

	@Output()
	public CollectionUpdated = new EventEmitter<BookmarkCollection>();

	public ngOnInit(): void
	{
	}

	public DeleteCollection(): void
	{
		const dialogRef = this._dialog.open(DialogDeleteCollectionComponent, {
			width: '250px',
			data: this.RespectiveBookmarkCollection
		});

		dialogRef.afterClosed().subscribe(result =>
		{
			if (result)
			{
				this.RespectiveBookmarkCollection = result;
				this.CollectionUpdated.emit(this.RespectiveBookmarkCollection);
			}
		});
	}
}
