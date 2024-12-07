export class EquipoModel {
    id: number = 0;
    idSerial: string = '';
    nombre: string = '';
    estado: number = 0;
    fechaCreacion: Date = new Date();
    usuarioCreacion: string = '';
    fechaModificacion: Date = new Date();
    usuarioModificacion: string = '';
}