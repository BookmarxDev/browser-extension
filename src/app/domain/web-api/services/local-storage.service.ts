import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LocalStorageService
{
	private storageType: string = "localStorage";

	/**
	 * Custom built local storage service.
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
	 */
	constructor()
	{
		this.IsAvailable = this.IsStorageAvailable(this.storageType);
	}

	/**
	 * Let's you know if localStorage is available to use in this browser.
	 * */
	public IsAvailable: boolean = false;

	/**
	 * Clears out all localStorage objects.
	 * WARNING: THIS WILL ALSO CLEAR ALL 3RD PARTY STORAGE ITEMS.
	 * */
	public ClearAll(): void
	{
		window.localStorage.clear();
	}

	/**
	 * Gets a localStorage item.
	 * NOTE: This WILL work on a regular string types but it will not deserialize for you.
	 * @param key - The key used to set the item originally.
	 */
	public GetSerializedItem(key: string): string | null
	{
		return window.localStorage.getItem(key);
	}

	/**
	 * Gets a localStorage item.
	 * There is no need to deserialize your value. It's handled in this method.
	 * Simply tell it your type when you call the method like this: "...GetItem<string[]>("KeyName")".
	 * NOTE: This WILL NOT work on a regular string or int types. It must be an object or array value!
	 * @param key - The key used to set the item originally.
	 */
	public GetDeserializedItem<TObject>(key: string): TObject | null
	{
		let deserializedValue: TObject | null = null;

		let storedValue: TObject = JSON.parse(window.localStorage.getItem(key) ?? "null");

		if (storedValue != null)
		{
			deserializedValue = storedValue;
		}

		return deserializedValue;
	}

	/**
	 * Removes an item from localStorage.
	 * @param key - The key used to set the item originally.
	 */
	public RemoveItem(key: string): void
	{
		window.localStorage.removeItem(key);
	}

	/**
	 * Sets a localStorage item.
	 * There is no need to serialize your value ahead of time. It's handled in this method.
	 * Simply tell it your type when you call the method like this: "...SetItem<string, number[]>("KeyName", [1,2,3,4])".
	 * The key will always be a string so just tell it that.
	 * @param key - The key of the localStorage item.
	 * @param value - The value of the localStorage item.
	 */
	public SetItem<KType, TObject>(key: string, value: TObject): void
	{
		// Just set a blank string if this goes south.
		let serializedValue: string = "";

		// If it's not already a string let's serialize it to JSON.
		if (typeof (value) !== "string")
		{
			serializedValue = JSON.stringify(value);
		}

		// Finally, save the item to localStorage.
		window.localStorage.setItem(key, serializedValue);
	}

	/**
	 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
	 * @param type - A string representing the desired type. E.g. 'localStorage'
	 */
	private IsStorageAvailable(type: string): boolean
	{
		var isAvailable = false;
		var storage;

		try
		{
			//@ts-ignore - window takes an array index of type string, here
			storage = window[type];
			var x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			isAvailable = true;
		}
		catch (e)
		{
			isAvailable = false;
		}

		return isAvailable;
	}
}
