import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {

    url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener usuarios
     * @returns
     * @author DLD
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/usuario');
    }

    /**
     * Petición para obtener una usuario por el id
     * @returns
     * @author DLD
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/usuario/'+ id);
    }

    /**
     * Petición para obtener una usuario por el empleado
     * @returns
     * @author DLD
     */
    obtenerPorEmpleado (empleado: number): Observable<any> {
        return this.http.get(this.url + '/usuarioempleado/'+ empleado);
    }

    /**
     * Petición para obtener una usuario por el nombre
     * @returns
     * @author DLD
     */
    obtenerPorNombre(nombre: string): Observable<any> {
        return this.http.get(this.url + '/usuarionombre/'+ nombre);
    }

    /**
     * Petición para crear una usuario
     * @returns
     * @author DLD
     */
    crear(datos: UsuarioModel): Observable<any> {
        return this.http.post(this.url + '/usuario', datos);
    }

    /**
     * Petición para modificar una usuario
     * @returns
     * @author DLD
     */
    modificar(id: number, datos: UsuarioModel): Observable<any> {
        return this.http.put(this.url + '/usuario/' + id, datos);
    }

    /**
     * Petición para eliminar una usuario
     * @returns
     * @author DLD
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/usuario/'+ id);
    }
}
