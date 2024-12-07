import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SidebarService {

	url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

	/**
     * Petición para obtener los menús
     * @returns
     * @author DLD
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/menus');
    }
}
