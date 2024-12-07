import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AsignacionEquiposModel } from '../models/asignacionEquipos.model';

@Injectable({
  providedIn: 'root'
})
export class AsignacionEquiposService {
  
  url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener asignación
     * @returns
     * @author angier
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/asigequipos');
    }

    /**
     * Petición para obtener una asignación por el id
     * @returns
     * @author angier
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/asigequipos/'+ id);
    }

    /**
     * Petición para crear una asignación
     * @returns
     * @author angier
     */
    crear(datos: AsignacionEquiposModel): Observable<any> {
        return this.http.post(this.url + '/asigequipos', datos);
    }

    /**
     * Petición para modificar una asignación
     * @returns
     * @author angier
     */
    modificar(id: number, datos: AsignacionEquiposModel): Observable<any> {
        return this.http.put(this.url + '/asigequipos/' + id, datos);
    }

    /**
     * Petición para eliminar una asignación
     * @returns
     * @author angier
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/asigequipos/'+ id);
    }
}


