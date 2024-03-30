import { ChangeDetectorRef, Component, HostListener, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BasePageDirective } from '../shared/base-page.directive';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { BookmarksService } from 'src/app/domain/bookmarks/services/bookmarks.service';
import { IBookmarkTreeNode } from 'src/app/domain/web-api/chrome/models/ibookmark-tree-node';
import { CdkDragDrop, moveItemInArray, CdkDragStart } from '@angular/cdk/drag-drop';
import { BookmarkCollection } from 'src/app/domain/bookmarks/entities/bookmark-collection';
import * as uuid from 'uuid';
import { Bookmark } from 'src/app/domain/bookmarks/entities/bookmark';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { BookmarkImportStateType } from 'src/app/domain/bookmarks/enums/bookmark-import-state-type';
import { MatMenu } from '@angular/material/menu';
import * as openpgp from 'openpgp';
import { GetAllBookmarksResponse } from 'src/app/domain/bookmarks/models/get-all-bookmarks-response';
import { DirectoryMenuAction } from 'src/app/domain/bookmarks/models/directory-menu-action';
import { DirectoryMenuChangeType } from 'src/app/domain/bookmarks/enums/directory-menu-change-type';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher
{
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean
	{
		const isSubmitted = form && form.submitted;
		return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
	}
}

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BasePageDirective
{
	private singleClickTimer: any;

	private pointerXCoord: number = 0;

	private isDraggingSide: boolean = false;

	@BlockUI()
	private _blockUI: NgBlockUI;

	constructor(
		private _route: ActivatedRoute,
		private _titleService: Title,
		private _authService: AuthService,
		private _bookmarksService: BookmarksService,
		private _cdr: ChangeDetectorRef,
		private _sanitizer: DomSanitizer,
		private _snackBar: MatSnackBar)
	{
		super(_route, _titleService);
	}

	public BookmarkCollections: BookmarkCollection[] = [];

	public BookmarkCollectionsPendingImport: BookmarkCollection[] = [];

	public BookmarkCollectionsDeleted: BookmarkCollection[] = [];

	public ActiveCollection: BookmarkCollection = null;

	public IsDragging: boolean;

	public BodyElement: HTMLElement = document.body;

	public FileExplorerWidthPX: number = 225;

	public BookmarkImportState: BookmarkImportStateType = BookmarkImportStateType.None;

	public emailFormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

	public getEmailFormControlValue(): string
	{
		return this.emailFormControl.value;
	}

	public matcher = new MyErrorStateMatcher();

	@ViewChild('navmenu', { static: true })
	navMenu: MatMenu;

	public AddBookmarkFormGroup: FormGroup;

	public get bookmarkTitleControl(): AbstractControl
	{
		return this.AddBookmarkFormGroup.get('bookmarkTitle');
	}

	public get bookmarkUrlControl(): AbstractControl
	{
		return this.AddBookmarkFormGroup.get('bookmarkUrl');
	}

	public ShowProgressBar: boolean = false;

	public override ngOnInit(): void
	{
		super.ngOnInit();

		this.AddBookmarkFormGroup = new FormGroup({
			bookmarkTitle: new FormControl('', [Validators.required]),
			bookmarkUrl: new FormControl('', [Validators.required])
		});

		this.ShowProgressBar = true;
		this._blockUI.start();
		this._bookmarksService.GetAll()
			.subscribe({
				next: async (result: GetAllBookmarksResponse) =>
				{
					if (result != null && result?.BookmarkCollections?.length > 0)
					{
						// This is going to be lengthy
						let decryptedCollections: BookmarkCollection[] = [];

						let user = this._authService.GetCurrentUser();
						user.EncryptedPrivateKey = result.EncryptedPrivateKey;

						const privateKey = await openpgp.decryptKey({
							privateKey: await openpgp.readPrivateKey({ armoredKey: result.EncryptedPrivateKey }),
							passphrase: user.UserHash
						});

						this._authService.SetUserData(user);

						for (let i = 0; i < result.BookmarkCollections.length; i++)
						{
							let collection = result.BookmarkCollections[i];
							let mappedCollection = new BookmarkCollection();
							mappedCollection.Map(collection);

							let collectionTitleArmored = await openpgp.readMessage({
								armoredMessage: collection.Title // Parse armored message
							});

							// Consider signing with pub key
							let { data: decryptedTitle } = await openpgp.decrypt({
								message: collectionTitleArmored,
								decryptionKeys: privateKey
							});

							mappedCollection.Title = decryptedTitle;

							// check signature validity (signed messages only)
							// try {
							//     await signatures[0].verified; // throws on invalid signature
							//     console.log('Signature is valid');
							// } catch (e) {
							//     throw new Error('Signature could not be verified: ' + e.message);
							// }

							decryptedCollections.push(mappedCollection);
						}

						this.BookmarkCollections = [...decryptedCollections];
						//this.ActiveCollection = this.BookmarkCollections[0];
						this.OpenBookmarkCollection(null, this.BookmarkCollections[0]);
					}
					else
					{
						this.BookmarkImportState = BookmarkImportStateType.NoExistingBookmarks;
					}
				},
				error: (error) =>
				{
					console.log(error);
				},
				complete: () =>
				{
					this._cdr.detectChanges();
					this.ShowProgressBar = false;
					this._blockUI.stop();
				}
			});
	}

	public AddNewBookmark(): void
	{
		let newBookmark = new Bookmark(
			this.bookmarkTitleControl.value,
			this.bookmarkUrlControl.value,
			this.ActiveCollection.Id);

		// Because this is a reference type, any changes made to the reference
		// have an effect on the original instance, so this update also modifies
		// the main bookmark collection value. Neat.
		this.ActiveCollection.BookmarksDecrypted.push(newBookmark);

		this.UpsertMainBookmarks(true);

		this.AddBookmarkFormGroup.reset();
		this.AddBookmarkFormGroup.markAsPristine();
	}

	public async UpsertMainBookmarks(showSnackBar: boolean = false): Promise<void>
	{
		this._blockUI.start();

		try
		{
			// Add the pending import collections to the main collections.
			this.BookmarkCollectionsPendingImport.forEach((collection) =>
			{
				this.BookmarkCollections.push(collection);
			});

			// Clear out the pending import collections.
			this.BookmarkCollectionsPendingImport = [];
			this.BookmarkImportState = BookmarkImportStateType.None;
			this._cdr.detectChanges();
		}
		catch (error)
		{
			return;
		}

		let user = this._authService.GetCurrentUser();
		let publicKey = await openpgp.readKey({ armoredKey: user.PublicKey });
		let encryptedCollections: BookmarkCollection[] = [];

		// Encrypt!
		// Loop through every single collection and encrypt what needs encrypting.
		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			let collection = this.BookmarkCollections[i];
			let collectionEncrypted = new BookmarkCollection();
			collectionEncrypted.Map(collection);

			let encryptedTitle = await openpgp.encrypt({
				message: await openpgp.createMessage({ text: collection.Title }),
				encryptionKeys: publicKey
				// Consider adding signing keys
			});

			collectionEncrypted.Title = encryptedTitle;

			let encryptedBookmarksJson = await openpgp.encrypt({
				message: await openpgp.createMessage({ text: JSON.stringify(collection.BookmarksDecrypted) }),
				encryptionKeys: publicKey
				// Consider adding signing keys
			});

			collectionEncrypted.BookmarksEncryptedJSON = encryptedBookmarksJson;

			// This is very process intensive. And honestly we have no need to
			// see metadata about the bookmarks themselves. We only really need
			// metadata around the collections themselves. So, let's encrypt the
			// entire array of bookmarks all at once. Similar, conceptually, to
			// encrypting the entire byte array of an image file, or any file.
			// // Loop through each bookmark and encrypt what needs encrypting.
			// if (collection.Bookmarks?.length > 0)
			// {
			// 	for (let bi = 0; bi < collection.Bookmarks.length; bi++)
			// 	{
			// 		let bookmark = collection.Bookmarks[bi];

			// 		let encryptedBookmarkTitle = await openpgp.encrypt({
			// 			message: await openpgp.createMessage({ text: bookmark.Title }),
			// 			encryptionKeys: publicKey
			// 			// Consider adding signing keys
			// 		});
			// 		bookmark.Title = encryptedBookmarkTitle;

			// 		let encryptedBookmarkUrl = await openpgp.encrypt({
			// 			message: await openpgp.createMessage({ text: bookmark.Url }),
			// 			encryptionKeys: publicKey
			// 			// Consider adding signing keys
			// 		});
			// 		bookmark.Url = encryptedBookmarkUrl;
			// 	}
			// }

			encryptedCollections.push(collectionEncrypted);
		}

		this._bookmarksService.SyncBookmarks(encryptedCollections)
			.subscribe({
				next: (result: BookmarkCollection[]) =>
				{
					if (showSnackBar)
					{
						this._snackBar.open("Bookmarks have been successfully saved.", "Ok", {
							politeness: 'polite',
							duration: 5000
						});
					}
				},
				error: (error) =>
				{
					console.log(error);
				},
				complete: () =>
				{
					this._blockUI.stop();
				}
			});
	}

	// TODO: Circle back to this.
	// public UpsertDeletedBookmarks(showSnackBar: boolean = false): void
	// {
	// 	this._bookmarksService.SaveDeletedBookmarks(this.BookmarkCollectionsDeleted)
	// 		.subscribe({
	// 			next: (result: BookmarkCollection[]) =>
	// 			{
	// 				if (showSnackBar)
	// 				{
	// 					this._snackBar.open("Bookmarks have been successfully saved.", "Ok", {
	// 						politeness: 'polite',
	// 						duration: 5000
	// 					});
	// 				}
	// 			},
	// 			error: (error) =>
	// 			{
	// 				console.log(error);
	// 			}
	// 		});
	// }

	public CollapseAllFolders(): void
	{
		this.BookmarkCollections.forEach((collection) =>
		{
			collection.ChildCollectionsCollapsed = true;

			// Do not collapse root folders. We still need to see those.
			if (collection.ParentId != null)
			{
				collection.IsCollapsed = true;
			}
		});

		this.UpsertMainBookmarks();
	}

	public OpenAllFolders(): void
	{
		this.BookmarkCollections.forEach((collection) =>
		{
			collection.ChildCollectionsCollapsed = false;
			collection.IsCollapsed = false;
		});

		this.UpsertMainBookmarks();
	}

	public ShowImportForm(): void
	{
		this.BookmarkImportState = BookmarkImportStateType.UserEnabledImport;
	}

	public OnResizableClick(event: MouseEvent): void
	{
		this.isDraggingSide = true;
		this.pointerXCoord = event.clientX;
		event.preventDefault();
		event.stopPropagation();
	}

	@HostListener('document:mousemove', ['$event'])
	onCornerMove(event: MouseEvent)
	{
		if (!this.isDraggingSide)
		{
			return;
		}

		let offsetX = event.clientX - this.pointerXCoord;

		this.FileExplorerWidthPX += offsetX;

		this.pointerXCoord = event.clientX;
	}

	@HostListener('document:mouseup', ['$event'])
	onCornerRelease(event: MouseEvent)
	{
		this.isDraggingSide = false;
	}

	public CancelImportingBookmarks(): void
	{
		this.BookmarkImportState = BookmarkImportStateType.NoExistingBookmarks;
		this.BookmarkCollectionsPendingImport = [];
	}

	public OpenBookmarkCollection($event: Event, collection: BookmarkCollection): void
	{
		$event?.preventDefault();
		if (this.BookmarkImportState == BookmarkImportStateType.None)
		{
			this.ShowProgressBar = true;

			this.singleClickTimer = setTimeout(async () =>
			{
				if (this.IsDragging)
				{
					this.IsDragging = false;
					return;
				}

				if (collection.BookmarksDecrypted?.length > 0)
				{
					// The bookmarks were already decrypted, let's not do it again :/
					this.ActiveCollection = collection;
				}
				else if (collection.BookmarksEncryptedJSON != "")
				{
					// Decrypt the JSON blob of bookmarks and then map and set them into the array for viewing.
					let user = this._authService.GetCurrentUser();

					const privateKey = await openpgp.decryptKey({
						privateKey: await openpgp.readPrivateKey({ armoredKey: user.EncryptedPrivateKey }),
						passphrase: user.UserHash
					});

					let bookmarksArmored = await openpgp.readMessage({
						armoredMessage: collection.BookmarksEncryptedJSON // Parse armored message
					});

					// Consider signing with pub key
					let { data: decryptedBookmarks } = await openpgp.decrypt({
						message: bookmarksArmored,
						decryptionKeys: privateKey
					});

					let bookmarksRaw = JSON.parse(decryptedBookmarks) as Bookmark[];

					if (bookmarksRaw != null && typeof (bookmarksRaw) != "undefined")
					{
						// Start to map
						let decryptedBookmarks = [];

						for (let i = 0; i < bookmarksRaw.length; i++)
						{
							let bookmark = new Bookmark();
							bookmark.Map(bookmarksRaw[i]);
							decryptedBookmarks.push(bookmark);
						}

						collection.BookmarksDecrypted = decryptedBookmarks;
					}

					this.ActiveCollection = collection;
					this._cdr.detectChanges();
					this.ShowProgressBar = false;
				}
			}, 250);
		}
		else
		{
			this.ShowFinishImportingBookmarksWarning();
		}
	}

	private ShowFinishImportingBookmarksWarning(): void
	{
		this._snackBar.open("You must save the imported bookmarks before making changes.", "Ok", {
			politeness: 'assertive',
			duration: 5000
		});
	}

	public HandleDoubleClick($event: Event, collection: BookmarkCollection): void
	{
		$event.preventDefault();

		clearTimeout(this.singleClickTimer);

		this.ToggleTree(collection, !collection.ChildCollectionsCollapsed);

		// Run a save on the new state.
		this.UpsertMainBookmarks();
	}

	public GenerateMatMenuTriggerName(index: number): MatMenu
	{
		return this.navMenu;
	}

	/**
	 * This is a costly method, but there's not really a way around it.
	 * It's not a huge deal because it's only called when the user is dragging something.
	 * @param viewModelCollection
	 */
	public HandleDrop(viewModelCollection: CdkDragDrop<BookmarkCollection[]>)
	{
		this.ShowProgressBar = true;
		this.BodyElement.classList.remove('inheritCursors');
		this.BodyElement.style.cursor = 'unset';

		if (this.BookmarkImportState == BookmarkImportStateType.None)
		{
			// Move the item in the array right away so all subsequent logic is being performed on the new state.
			moveItemInArray(this.BookmarkCollections, viewModelCollection.previousIndex, viewModelCollection.currentIndex);

			let oldCollectionDepth = viewModelCollection.item.data.Depth;
			let laggingCollection = this.BookmarkCollections[viewModelCollection.currentIndex - 1];
			let movedCollection = this.BookmarkCollections[viewModelCollection.currentIndex];
			let leadingCollection = this.BookmarkCollections[viewModelCollection.currentIndex + 1];

			if (laggingCollection != null && laggingCollection.ChildCollectionsCollapsed)
			{
				let laggingCollectionChildren = this.GetChildCollections(laggingCollection.Id);

				let laggingCollectionChildrenCount = laggingCollectionChildren.length;

				let movedCollectionIndex = viewModelCollection.currentIndex + laggingCollectionChildrenCount;
				moveItemInArray(this.BookmarkCollections, viewModelCollection.currentIndex, movedCollectionIndex);

				laggingCollection = this.BookmarkCollections[movedCollectionIndex - 1];
				movedCollection = this.BookmarkCollections[movedCollectionIndex];
				leadingCollection = this.BookmarkCollections[movedCollectionIndex + 1];
			}

			// The way in which the user is dragging the item and how Angular Material
			// handles moving the target element changes depending on drag direction.
			// In order to correctly handle move locations we need to factor this in.
			if (viewModelCollection.currentIndex > viewModelCollection.previousIndex)
			{
				// When you drag DOWN the target slides up so we need to use the leading collection.
				let isChild = this.IsChildCollection(leadingCollection, movedCollection);
				if (isChild)
				{
					// Move the item back to where it was originally.
					moveItemInArray(this.BookmarkCollections, viewModelCollection.currentIndex, viewModelCollection.previousIndex);

					this._snackBar.open("Cannot move a collection into itself or its child collection.", "Ok", {
						politeness: 'assertive',
						duration: 5000
					});

					// Kick out as we don't need to perform any logic.
					return;
				}
				else if (leadingCollection == null)
				{
					// Collection was dragged to the very bottom so reparent to root.
					movedCollection.Depth = 0;
					movedCollection.ParentId = null;
				}
				else
				{
					// Simply move the folder to the same level as the leading collection.
					movedCollection.Depth = leadingCollection.Depth;
					movedCollection.ParentId = leadingCollection.ParentId;
				}
			}
			else if (viewModelCollection.currentIndex == viewModelCollection.previousIndex)
			{
				// Nothing happened so we don't do anything.
				return;
			}
			else if (laggingCollection == null || leadingCollection == null)
			{
				// The collection was dropped at the very top or very bottom and now has no parent.
				movedCollection.Depth = 0;
				movedCollection.ParentId = null;
			}
			else
			{
				// When you drag UP the target slides down so we need to use the lagging collection.
				movedCollection.Depth = laggingCollection.HasChildren ? laggingCollection.Depth + 1 : leadingCollection.Depth;
				movedCollection.ParentId = laggingCollection.HasChildren ? laggingCollection.Id : leadingCollection.ParentId;
			}

			// To figure out the depth change, take the new value minus the old.
			let depthAdjustment: number = movedCollection.Depth - oldCollectionDepth;

			this.ReparentChildItemsOfMovedCollection(movedCollection, depthAdjustment);

			this.UpsertMainBookmarks(true);
		}
		else
		{
			this.ShowFinishImportingBookmarksWarning();
		}

		this.ShowProgressBar = false;
	}

	private ReparentChildItemsOfMovedCollection(movedCollection: BookmarkCollection, depthAdjustment: number): void
	{
		// If there are any child elements on the moved collection then go move those back under the collection.
		if (movedCollection.HasChildren)
		{
			// Now, reorder everything correctly.
			let reorderedCollections: BookmarkCollection[] = [];
			let childCollections: BookmarkCollection[] = this.GetChildCollections(movedCollection.Id);

			// Remove child collections from BookmarkCollections array
			reorderedCollections = this.BookmarkCollections.filter(collection => !childCollections.includes(collection));

			// Reinsert child collections after the moved viewModelCollection
			for (let i = 0; i < reorderedCollections.length; i++)
			{
				if (reorderedCollections[i].Id === movedCollection.Id)
				{
					// Update the depth to match the new location.
					childCollections.forEach((collection) =>
					{
						collection.Depth += depthAdjustment;
					});

					// Insert the child collections into the array right after the parent collection.
					reorderedCollections = reorderedCollections.slice(0, i + 1).concat(childCollections).concat(reorderedCollections.slice(i + 1));
					break;
				}
			}

			// Rewrite our indexes to match the new order.
			reorderedCollections.forEach((collection, index) =>
			{
				collection.Index = index;
			});

			this.BookmarkCollections = [...reorderedCollections];
			this._cdr.detectChanges();
		}
	}

	public HandleDragStart(event: CdkDragStart, collection: BookmarkCollection): void
	{
		this.IsDragging = true;
		this.ToggleTree(collection, true);
		this.BodyElement.classList.add('inheritCursors');
		this.BodyElement.style.cursor = 'grabbing';
	}

	/**
	 * Sets collapsed properties to true, always.
	 * @param collection 
	 */
	public ToggleTree(collection: BookmarkCollection, isCollapsed: boolean): void
	{
		collection.ChildCollectionsCollapsed = isCollapsed;

		// Go and find all the children of this collection and collapse them.
		// We also need to go and find all the children of the children and collapse them.
		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId == collection.Id)
			{
				this.BookmarkCollections[i].IsCollapsed = isCollapsed;

				// We only want to modify nested folders if we're closing them.
				// If we open all of them every time we toggle it's annoying.
				if (isCollapsed)
				{
					// recursively call the function for child collections
					this.ToggleTree(this.BookmarkCollections[i], isCollapsed);
				}
			}
		}
	}

	public SignOut(): void
	{
		this._authService.SignOut();
	}

	/**
	 * Sanitize a URL to prevent XSS attacks.
	 * @param userGeneratedUrl 
	 * @returns 
	 */
	public SanitizeUrl(userGeneratedUrl: string): string
	{
		return this._sanitizer.sanitize(SecurityContext.URL, userGeneratedUrl);
	}

	public ImportExistingBookmarks(): void
	{
		this.BookmarkImportState = BookmarkImportStateType.ImportPending;

		//@ts-expect-error - This is a chrome extension property.
		chrome.bookmarks.getTree((bookmarks) =>
		{
			// Get the root tree node for now.
			// This first one is always a folder which will contain child elements.
			let bookmarksToImport: IBookmarkTreeNode[] = bookmarks[0].children;

			if (bookmarksToImport.length > 0)
			{
				let collections: BookmarkCollection[] = [];

				// New root node for the current devices set of bookmarks.
				let deviceBookmarkCollection = new BookmarkCollection();
				deviceBookmarkCollection.Id = uuid.v4();
				deviceBookmarkCollection.ParentId = null;
				deviceBookmarkCollection.Title = this.getEmailFormControlValue();
				deviceBookmarkCollection.HasChildren = true;
				collections.push(deviceBookmarkCollection);

				// This initial import goes and gets all the browsers existing bookmarks.
				// This typically will include Favorites, Other and Mobile, so we need
				// to loop over these initial root nodes first to get to the actual bookmarks.
				for (let i = 0; i < bookmarksToImport.length; i++)
				{
					// These root collections will never have a parent, so we set it to null.
					let bookmarkCollection = new BookmarkCollection();
					// Walking backwards for the index on these root folders to keep them up top.
					bookmarkCollection.Id = uuid.v4();
					bookmarkCollection.ParentId = deviceBookmarkCollection.Id;
					bookmarkCollection.Depth = deviceBookmarkCollection.Depth + 1;
					bookmarkCollection.Title = bookmarksToImport[i].title;
					collections = collections.concat(this.FlattenBookmarkTreeNodesIntoCollections(bookmarksToImport[i], bookmarkCollection));
				}

				// Sort the collections by index to pull root folders to the top, then start setting the indexes on collections.
				collections = collections.sort((a, b) => a.Index - b.Index);
				for (let i = 0; i < collections.length; i++)
				{
					collections[i].Index = i;
				}

				this.BookmarkCollectionsPendingImport = [...collections];
				this._cdr.detectChanges();
			}
		});
	}

	/**
	 * Mark the current collection and all nested collections as soft deleted.
	 * This is also a very expensive method. The bookmarks array(s) get iterated 
	 * repeatedly as we need to traverse both the delete collections and then the 
	 * parent collections and remove as we go along. Attempts are made to reduce
	 * iterations by continuing out of the loop as soon as an item is found.
	 * But still...yuck.
	 * @param deletedCollection 
	 */
	public HandleDirectoryMenuAction(changeAction: DirectoryMenuAction): void
	{
		let original = changeAction.OriginalBookmarkCollection;
		let added = changeAction.NewBookmarkCollection;

		if (changeAction.ChangeType == DirectoryMenuChangeType.Add)
		{
			for (let i = 0; i < this.BookmarkCollections.length; i++)
			{
				if (this.BookmarkCollections[i].Id === original.Id)
				{
					// i + 1 as we want it to be a child element, now.
					this.BookmarkCollections.splice(i + 1, 0, added);
					break;
				}
			}
		}
		else if (changeAction.ChangeType == DirectoryMenuChangeType.Remove)
		{
			if (original != null && original.IsSoftDeleted)
			{
				let childCollections = this.GetChildCollections(original.Id);

				// To keep it simple, just hard delete from the array.
				for (let i = 0; i < this.BookmarkCollections.length; i++)
				{
					if (this.BookmarkCollections[i].Id === original.Id)
					{
						// Nuke that root element and all child elements.
						let deleteCount = childCollections?.length == 0 ? 1 : childCollections.length;
						this.BookmarkCollections.splice(i, deleteCount);
					}
				}

				// TODO: Circle back.
				// let deletedCollections = [];
				// childCollections.forEach((collection) =>
				// {
				// 	collection.IsSoftDeleted = true;
				// });

				// deletedCollections = [original, ...childCollections];

				// // We'll loop over the deleted collections, first.
				// for (let i = 0; i < deletedCollections.length; i++)
				// {
				// 	let currentDeletedCollection: BookmarkCollection = deletedCollections[i];

				// 	// Next, find the corresponding item in the main collections list.
				// 	for (let mi = 0; mi < this.BookmarkCollections.length; mi++)
				// 	{
				// 		let currentMainCollection = this.BookmarkCollections[mi];
				// 		if (currentDeletedCollection.Id === currentMainCollection.Id)
				// 		{
				// 			// Update it to show deleted then immediately bail to go on to the next and reduce iterations.
				// 			currentMainCollection.IsSoftDeleted = true;
				// 		}
				// 	}
				// }

				// // Finally, we're going to completely reconstruct the existing collections
				// // and also build up a new deleted collections list. Then, when we get those
				// // created we'll rewrite both the BookmarkCollections and DeletedBookmarkCollections
				// // arrays with the new arrays. This is better than actively deleting elements
				// // at specified array positions, since we'll be modifying the array we're working on.
				// let collectionsToKeep = [];
				// let collectionsToDelete = [];
				// for (let index = 0; index < this.BookmarkCollections.length; index++)
				// {
				// 	let currentCollection = this.BookmarkCollections[index];

				// 	if (currentCollection.IsSoftDeleted)
				// 	{
				// 		// The root folder which was just deleted should be reparented to root.
				// 		if (currentCollection.Id == original.Id)
				// 		{
				// 			currentCollection.ParentId = null;
				// 			currentCollection.Depth = 0;
				// 		}

				// 		collectionsToDelete.push(currentCollection);
				// 	}
				// 	else
				// 	{
				// 		collectionsToKeep.push(currentCollection);
				// 	}
				// }

				// // Overwrite the existing bookmark collections.
				// this.BookmarkCollections = [...collectionsToKeep];
				// collectionsToDelete.forEach((deletedCollection) =>
				// {
				// 	this.BookmarkCollectionsDeleted.push(deletedCollection);
				// });

				//this.UpsertDeletedBookmarks(true);
			}
		}
		else if (changeAction.ChangeType == DirectoryMenuChangeType.Rename)
		{

		}

		this._cdr.detectChanges();
		this.UpsertMainBookmarks(true);
	}

	//#region Private Methods

	/**
	 * One method to rule them all, and in the recursion, bind them.
	 * This method gets all the child collections of a given parent Id.
	 * Reuse this to help keep your sanity and to not reinvent the wheel.
	 * @param parentId 
	 * @returns 
	 */
	private GetChildCollections(parentId: string): BookmarkCollection[]
	{
		let childCollections: BookmarkCollection[] = [];

		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId === parentId)
			{
				childCollections.push(this.BookmarkCollections[i]);
				let grandchildren = this.GetChildCollections(this.BookmarkCollections[i].Id);
				childCollections = childCollections.concat(grandchildren);
			}
		}

		return childCollections;
	}

	private FlattenBookmarkTreeNodesIntoCollections(
		bookmarkTreeNode: IBookmarkTreeNode,
		bookmarkCollection: BookmarkCollection): BookmarkCollection[]
	{
		let bookmarkCollections: BookmarkCollection[] = [bookmarkCollection];

		if (bookmarkTreeNode.children)
		{
			bookmarkTreeNode.children.forEach((child, index) =>
			{
				if (child.url != null && child.url != undefined && child.url != "")
				{
					// If the URL has a value it's a bookmark so add it.
					let bookmark = new Bookmark(child.title, child.url, bookmarkCollection.Id);
					bookmarkCollection.BookmarksDecrypted.push(bookmark);
					return;
				}
				else if (child.children)
				{

					bookmarkCollection.HasChildren = true;

					// If there are any more children items on this then iterate those.
					let childBookmarkCollection = new BookmarkCollection();
					childBookmarkCollection.Id = uuid.v4();
					childBookmarkCollection.ParentId = bookmarkCollection.Id;
					childBookmarkCollection.Title = child.title;
					childBookmarkCollection.Depth = bookmarkCollection.Depth + 1;
					bookmarkCollections = bookmarkCollections.concat(this.FlattenBookmarkTreeNodesIntoCollections(child, childBookmarkCollection));

					// Check if it's the last child
					if (index === bookmarkTreeNode.children.length - 1)
					{
						childBookmarkCollection.IsLastChild = true;
					}
				}
			});
		}

		return bookmarkCollections;
	}

	/**
	 * Iterate over the collections to see if the target collection is a child of the active collection.
	 * @param targetCollection 
	 * @param activeCollection 
	 * @returns 
	 */
	private IsChildCollection(targetCollection: BookmarkCollection, activeCollection: BookmarkCollection): boolean
	{
		if (targetCollection == null)
		{
			return false;
		}

		if (targetCollection.ParentId === activeCollection.Id)
		{
			return true;
		}

		for (let i = 0; i < this.BookmarkCollections.length; i++)
		{
			if (this.BookmarkCollections[i].ParentId === activeCollection.Id)
			{
				if (this.IsChildCollection(targetCollection, this.BookmarkCollections[i]))
				{
					return true;
				}
			}
		}

		return false;
	}

	//#endregion Private Methods
}
