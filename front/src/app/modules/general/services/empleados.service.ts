import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmpleadoModel } from '../models/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  
  url: string = 'http://localhost:3000';

	constructor(public http: HttpClient) { }

    /**
     * Petición para obtener empleado
     * @returns
     * @author angier
     */
    obtener(): Observable<any> {
        return this.http.get(this.url + '/empleados');
    }

    /**
     * Petición para obtener un empleado por el id
     * @returns
     * @author angier
     */
    obtenerPorId (id: number): Observable<any> {
        return this.http.get(this.url + '/empleados/'+ id);
    }

    /**
     * Petición para crear un empleado
     * @returns
     * @author angier
     */
    crear(datos: EmpleadoModel): Observable<any> {
        return this.http.post(this.url + '/empleados', datos);
    }

    /**
     * Petición para modificar un empleado
     * @returns
     * @author angier
     */
    modificar(id: number, datos: EmpleadoModel): Observable<any> {
        return this.http.put(this.url + '/empleados/' + id, datos);
    }

    /**
     * Petición para eliminar un empleado
     * @returns
     * @author angier
     */
    eliminar(id: number): Observable<any> {
        return this.http.delete(this.url + '/empleados/'+ id);
    }
}

