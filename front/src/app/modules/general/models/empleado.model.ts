export class EmpleadoModel {
    id: number = 0;
    identificacion: string = '';
    nombre: string = '';
    apellido: string = '';
    genero: any;
    idCargo: number = 0;
    idArea: number = 0;
    estado: number = 0;
    fechaCreacion: Date = new Date();
    usuarioCreacion: string = '';
    fechaModificacion: Date = new Date();
    usuarioModificacion: string = '';
    // Datos adionales
    nombreArea: string = '';
    nombreCargo: string = '';
}