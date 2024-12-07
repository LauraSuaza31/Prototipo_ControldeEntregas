import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CargoModel } from '../models/cargo.model';

@Injectable({
  providedIn: 'root'
})
export class CargosService {
  
  url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener cargos
     * @returns
     * @author DLD
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/cargos');
    }

    /**
     * Petición para obtener una cargo por el id
     * @returns
     * @author DLD
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/cargos/'+ id);
    }

    /**
     * Petición para crear una cargo
     * @returns
     * @author DLD
     */
    crear(datos: CargoModel): Observable<any> {
        return this.http.post(this.url + '/cargos', datos);
    }

    /**
     * Petición para modificar una cargo
     * @returns
     * @author DLD
     */
    modificar(id: number, datos: CargoModel): Observable<any> {
        return this.http.put(this.url + '/cargos/' + id, datos);
    }

    /**
     * Petición para eliminar una cargo
     * @returns
     * @author DLD
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/cargos/'+ id);
    }
}