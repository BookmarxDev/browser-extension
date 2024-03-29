import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';

@Component({
	selector: 'app-dialog-create-collection',
	templateUrl: './dialog-create-collection.component.html',
	styleUrls: ['./dialog-create-collection.component.scss']
})
export class DialogCreateCollectionComponent implements OnInit
{
	constructor(
		public dialogRef: MatDialogRef<DialogCreateCollectionComponent>,
		@Inject(MAT_DIALOG_DATA) public BookmarkCollection: BookmarkCollection) { }

	public FormError: string = "";

	// https://angular.io/guide/reactive-forms#grouping-form-controls
	public CreateCollectionForm = new FormGroup({
		collectionTitle: new FormControl('', [
			Validators.required,
			Validators.minLength(3)
		])
	});

	get CollectionTitle() { return this.CreateCollectionForm.get('collectionTitle'); }

	public ngOnInit(): void
	{
	}

	public CloseDialog(): void
	{
		this.dialogRef.close();
	}

	public ProcessForm(): void
	{
		if (this.CreateCollectionForm.valid)
		{
			let collection = new BookmarkCollection(
				this.BookmarkCollection.Depth + 1,
				this.BookmarkCollection.Id,
				this.CollectionTitle.value);
				
			this.dialogRef.close(collection);
		}
		else
		{
			this.FormError = "Please enter a valid collection title.";
		}

	}
}
