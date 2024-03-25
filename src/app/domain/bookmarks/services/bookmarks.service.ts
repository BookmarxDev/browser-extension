import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BookmarkTreeNode } from '../entities/bookmark-tree-node';
import { BookmarkCollection } from '../entities/bookmark-collection';

@Injectable({
	providedIn: 'root'
})
export class BookmarksService
{
	constructor(private _httpClient: HttpClient) { }

	public GetAll(): Observable<any>
	{
		return this._httpClient.get(`${ environment.apiUrlV1 }/bookmarks/get-all`)
			.pipe(
				retry(3)
			);
	}

	// TODO: Circle back to this.
	// public SaveDeletedBookmarks(bookmarkCollections: BookmarkCollection[]): Observable<any>
	// {
	// 	const headers = new HttpHeaders().set('Content-Type', 'application/json');

	// 	return this._httpClient
	// 		.post(
	// 			`${ environment.apiUrlV1 }/bookmarks/save-deleted`,
	// 			bookmarkCollections,
	// 			{ headers })
	// 		.pipe(
	// 			retry(3)
	// 		);
	// }

	public SyncBookmarks(bookmarkCollections: BookmarkCollection[]): Observable<any>
	{
		const headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._httpClient
			.post(
				`${ environment.apiUrlV1 }/bookmarks/sync-bookmarks`,
				bookmarkCollections,
				{ headers })
			.pipe(
				retry(3)
			);
	}
}
