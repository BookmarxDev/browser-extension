import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BookmarkTreeNode } from 'src/app/domain/bookmarks/entities/bookmark-tree-node';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-bookmark-tree',
	templateUrl: './bookmark-tree.component.html',
	styleUrls: ['./bookmark-tree.component.scss']
})
export class BookmarkTreeComponent
{
	@Input() item: BookmarkTreeNode;
	@Input() parentItem?: BookmarkTreeNode;

	@Input()
	public set connectedDropListsIds(ids: string[])
	{
		this.allDropListsIds = ids;
	}
	
	public get connectedDropListsIds(): string[]
	{
		return this.allDropListsIds.filter((id) => id !== this.item.Id);
	}
	
	public allDropListsIds: string[];

	public get dragDisabled(): boolean
	{
		return !this.parentItem;
	}

	public get parentItemId(): string
	{
		return this.dragDisabled ? '' : this.parentItem.Id;
	}


	@Output() itemDrop: EventEmitter<CdkDragDrop<BookmarkTreeNode>>

	constructor()
	{
		this.allDropListsIds = [];
		this.itemDrop = new EventEmitter();
	}

	public onDragDrop(event: CdkDragDrop<BookmarkTreeNode, BookmarkTreeNode>): void
	{
		this.itemDrop.emit(event);
	}
}
