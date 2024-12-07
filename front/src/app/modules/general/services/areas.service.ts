import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from 'src/app/models/response.model';
import { AreaModel } from '../models/area.model';

@Injectable({
	providedIn: 'root'
})
export class AreasService {

	url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener areas
     * @returns
     * @author DLD
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/areas');
    }

    /**
     * Petición para obtener una area por el id
     * @returns
     * @author DLD
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/areas/'+ id);
    }

    /**
     * Petición para crear una area
     * @returns
     * @author DLD
     */
    crear(datos: AreaModel): Observable<any> {
        return this.http.post(this.url + '/areas', datos);
    }

    /**
     * Petición para modificar una area
     * @returns
     * @author DLD
     */
    modificar(id: number, datos: AreaModel): Observable<any> {
        return this.http.put(this.url + '/areas/' + id, datos);
    }

    /**
     * Petición para eliminar una area
     * @returns
     * @author DLD
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/areas/'+ id);
    }
}
