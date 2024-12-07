export class UsuarioModel {
    id: number = 0;
    idEmpleado: number = 0;
    idTipoUsuario: number = 0;
    nombre: string = '';
    estado: number = 0;
    fechaCreacion: Date = new Date();
    usuarioCreacion: string = '';
    fechaModificacion: Date = new Date();
    usuarioModificacion: string = '';

    /// Datos Adicionales
    nombreEmpleado: string = '';
    nombreTipoUsuario: string = '';
}