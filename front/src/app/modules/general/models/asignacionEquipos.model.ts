export class AsignacionEquiposModel {
    idAsignacion: any;
    idEquipo: number = 0;
    idEmpleadoRecibe: number = 0;
    idEmpleadoEntrega: number = 0;
    fechaEntrega: Date = new Date();
    horaEntrega: Date = new Date();
    fechaCreacion: Date = new Date();
    usuarioCreacion: string = '';
    fechaModificacion: Date = new Date();
    usuarioModificacion: string = '';
    // Datos adionales
    nombreEmpleadoRecibe: string = '';
    nombreEmpleadoEntrega: string = '';
    nombreEquipo: string = '';
}