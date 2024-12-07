import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoUsuariosModel } from '../models/tipoUsuario.model';

@Injectable({
  providedIn: 'root'
})
export class TiposUsuariosService {

  url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener los tipos de usuario
     * @returns
     * @author angier
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/tiposUsuarios');
    }

    /**
     * Petición para obtener un tipo de usuario por el id
     * @returns
     * @author angier
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/tiposUsuarios/'+ id);
    }

    /**
     * Petición para crear un tipo de usuario
     * @returns
     * @author angier
     */
    crear(datos: TipoUsuariosModel): Observable<any> {
        return this.http.post(this.url + '/tiposUsuarios', datos);
    }

    /**
     * Petición para modificar un tipo de usuario
     * @returns
     * @author angier
     */
    modificar(id: number, datos: TipoUsuariosModel): Observable<any> {
        return this.http.put(this.url + '/tiposUsuarios/' + id, datos);
    }

    /**
     * Petición para eliminar un tipo de usuario
     * @returns
     * @author angier
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/tiposUsuarios/'+ id);
    }
}