import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EquipoModel } from '../models/equipo.model';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  
  url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener equipos
     * @returns
     * @author Oscar-Ramirez
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/equipos');
    }

    /**
     * Petición para obtener una equipo por el id
     * @returns
     * @author Oscar-Ramirez
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/equipos/'+ id);
    }

    /**
     * Petición para crear una equipo
     * @returns
     * @author Oscar-Ramirez
     */
    crear(datos: EquipoModel): Observable<any> {
        return this.http.post(this.url + '/equipos', datos);
    }

    /**
     * Petición para modificar una equipo
     * @returns
     * @author Oscar-Ramirez
     */
    modificar(id: number, datos: EquipoModel): Observable<any> {
        return this.http.put(this.url + '/equipos/' + id, datos);
    }

    /**
     * Petición para eliminar una equipo
     * @returns
     * @author Oscar-Ramirez
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/equipos/'+ id);
    }
}
