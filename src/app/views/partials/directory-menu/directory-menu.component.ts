import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';
import { DialogDeleteCollectionComponent } from '../../dialogs/dialog-delete-collection/dialog-delete-collection.component';
import { DialogCreateCollectionComponent } from '../../dialogs/dialog-create-collection/dialog-create-collection.component';
import { DirectoryMenuAction } from 'src/app/domain/bookmarks/models/directory-menu-action';
import { DirectoryMenuChangeType } from 'src/app/domain/bookmarks/enums/directory-menu-change-type';

@Component({
	selector: 'app-directory-menu',
	templateUrl: './directory-menu.component.html',
	styleUrls: ['./directory-menu.component.scss']
})
export class DirectoryMenuComponent implements OnInit
{
	constructor(public _dialog: MatDialog) { }

	@Input()
	public RespectiveBookmarkCollection: BookmarkCollection = null;

	@Output()
	public CollectionUpdated = new EventEmitter<DirectoryMenuAction>();

	public ngOnInit(): void
	{
	}

	public AddCollection(): void
	{
		const dialogRef = this._dialog.open(DialogCreateCollectionComponent, {
			width: '300px',
			data: this.RespectiveBookmarkCollection
		});

		dialogRef.afterClosed().subscribe(result =>
		{
			if (result)
			{
				let directoryMenuAction = new DirectoryMenuAction();
				directoryMenuAction.ChangeType = DirectoryMenuChangeType.Add;
				directoryMenuAction.OriginalBookmarkCollection = this.RespectiveBookmarkCollection;
				directoryMenuAction.NewBookmarkCollection = result;

				this.CollectionUpdated.emit(directoryMenuAction);
			}
		});
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

				let directoryMenuAction = new DirectoryMenuAction();
				directoryMenuAction.ChangeType = DirectoryMenuChangeType.Remove;
				directoryMenuAction.OriginalBookmarkCollection = this.RespectiveBookmarkCollection;

				this.CollectionUpdated.emit(directoryMenuAction);
			}
		});
	}
}
