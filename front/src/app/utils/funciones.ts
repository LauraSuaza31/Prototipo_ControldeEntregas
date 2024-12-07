import Swal from "sweetalert2";
import { ResponseModel } from "../models/response.model";

export class funciones {

    /***
     * Convierte una enumeración en una arreglo
     * @author DLD
     */
    enumToArray(enumeracion: any): Array<any> {    
        const lista = [];
    
        for (const [propertyKey, propertyValue] of Object.entries(enumeracion)) {
        if (!Number.isNaN(Number(propertyKey))) {
            continue;
        }
        lista.push({ id: propertyValue, descripcion: propertyKey });
        }
        console.log(lista);
    
        return lista;
    }

    /**
     * Define si una información es undefined, nula, o está vacia
     * @param info
     * @returns 
     * @author DLD
     */
    isDefinedAndNotEmpty(info: any): boolean {
        let valido = false;
        if (info != null && info != undefined && info != "") {
            valido = true;
        }
        return valido
    }

    /**
     * Muestra mensaje de confirmación
     * @param mensaje
     * @returns 
     * @author DLD
     */
    confirmarMensaje(mensaje: string) : Promise<boolean> {
        return new Promise((resolve, reject) => {
            let confirmacion = false;
            Swal.fire({
                title: mensaje,
                showDenyButton: true,
                confirmButtonText: 'Yes',
                denyButtonText: 'No',
                customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-3',
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    confirmacion = true;
                } else if (result.isDenied) {
                    confirmacion = false;
                }
                resolve(confirmacion);
            });
            return confirmacion;
        });
    }

    /**
     * Muestra mensaje de exito
     * @param mensaje
     * @returns 
     * @author DLD
     */
    mensajeExito(mensaje: string): void {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: mensaje,
            showConfirmButton: false,
            timer: 3000
        })
    }

    /**
     * Muestra mensaje de error
     * @param mensaje
     * @returns 
     * @author DLD
     */
    mensajeError(mensaje: string): void {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: mensaje,
            showConfirmButton: false,
            timer: 3000
        })
    }

    /**
     * Muestra mensaje de advertencia
     * @param mensaje
     * @returns 
     * @author DLD
     */
    mensajeAdvertencia(mensaje: string): void {
        Swal.fire({
            position: 'center',
            icon: 'warning',
            title: mensaje,
            showConfirmButton: false,
            timer: 3000
        })
    }

    /**
     * Muestra mensaje de excepción
     * @param mensaje
     * @returns 
     * @author DLD
     */
    userExcepcion(mensaje: string, error: any, nombreComponente: string): void {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: mensaje,
            showConfirmButton: false,
            timer: 3000
        })
        console.log(error.message + ' - ' + nombreComponente);
    }

    /**
     * Valida response validator
     * @param mensaje
     * @returns 
     * @author DLD
     */
    responseValidator(respuesta: ResponseModel): boolean {
        let valido = false;
        if (respuesta.estado = 200) {
            valido = true;
        }
        return valido;
    }
}