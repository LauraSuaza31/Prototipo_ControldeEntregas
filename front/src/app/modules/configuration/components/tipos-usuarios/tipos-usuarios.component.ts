import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { TipoUsuariosModel } from '../../models/tipoUsuario.model';
import { TiposUsuariosService } from '../../services/tipos-usuarios.service';

@Component({
    selector: 'app-tipos-usuarios',
    templateUrl: './tipos-usuarios.component.html',
    providers: [
        TiposUsuariosService
    ]
})

export class TiposUsuariosComponent implements OnInit {

    listaTipoUsuarios: Array<TipoUsuariosModel> = new Array<TipoUsuariosModel>();
    infoTmp: any = null;
    listamp: any = Array<any>();
    abrirModalTipoUsuarios: boolean = false;
    estados = Estados;
    listaEstados: Array<Estados> = new Array<Estados>();
    accion: Accion = Accion.Ninguno;
    funcionesGenerales = new funciones();
    modeloTipoUsuarios: TipoUsuariosModel = new TipoUsuariosModel();

    constructor(
        private servicioTiposUsuarios: TiposUsuariosService
    ) { }

    ngOnInit(): void {
        this.obtener();
    }

    /**
     * Se obtiene la lista de tipos de usuarios
     * @author angier
     */
    obtener(): void {
        try {
            const servicio = this.servicioTiposUsuarios.obtener().subscribe(
                (response: ResponseModel) => {
                    if (this.funcionesGenerales.responseValidator(response)) {
                        if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                            // obtencion de datos
                            this.listaTipoUsuarios = response.datos;
                        } else {
                            this.funcionesGenerales.mensajeAdvertencia('No se encontraron tipos de usuarios creados!');
                        }
                    } else {
                        this.funcionesGenerales.mensajeError('Error al intentar obtener los tipos de usuarios!');
                    }
                    servicio.unsubscribe();
                },
                error => {
                    this.funcionesGenerales.userExcepcion('Error al obtener los tipos de usuarios', error, `${this.obtener.name}`);
                    servicio.unsubscribe();
                });
        }
        catch (error) {
            this.funcionesGenerales.userExcepcion('Error al obtener los tipos de usuarios! ', error, `${this.obtener.name}`);
        }
    }

    /**
     * Se abre el modal de tipos de usuario
     * @author angier
     */
    abrirModal(): void {
        this.accion = Accion.Adicion;
        this.abrirModalTipoUsuarios = true;
    }

    /**
     * abre el modal y envia los datos del registro seleccionado al modal,
     * para realizar la respectiva modificación
     * @author angier
     */
    seleccionarTipoUsuarios(data: TipoUsuariosModel): void {
        this.modeloTipoUsuarios = new TipoUsuariosModel();
        if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
            this.modeloTipoUsuarios = data;
            this.accion = Accion.Edicion;
            this.abrirModalTipoUsuarios = true;
        }
    }

    /**
     * Se realiza la eliminación de un tipo de usuario
     * @returns 
     * @author angier
     */
    eliminar(datosTipoUsuarios: TipoUsuariosModel): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar el tipo de usuario?');
                if (confirmar) {
                    const servicioEliminar = this.servicioTiposUsuarios.eliminar(datosTipoUsuarios.id).subscribe(
                        (response: ResponseModel) => {
                            if (this.funcionesGenerales.responseValidator(response)) {
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.actualizarGrid({ datos: datosTipoUsuarios, accion: Accion.Eliminacion });
                            } else {
                                this.funcionesGenerales.mensajeError('Error al intentar eliminar el tipo de usuario!');
                            }
                            servicioEliminar.unsubscribe();
                            resolve();
                        }, error => {
                            this.funcionesGenerales.userExcepcion('Error al eliminar el tipo de usuario', error, `${this.eliminar.name}`);
                            servicioEliminar.unsubscribe();
                            reject();
                        });
                }
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al eliminar el tipo de usuario', error, `${this.eliminar.name}`);
                reject();

            }
        })
    }

    /** 
      * Actualizar la tabla de tipos de usuario dependiendo de la acción que se este realizando
      * @author angier
     */
    actualizarGrid(informacion: { datos: TipoUsuariosModel, accion: Accion }): void {
        try {
            this.accion = informacion.accion;
            if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaTipoUsuarios)) {
                this.listaTipoUsuarios = new Array<TipoUsuariosModel>();
            }
            const index = this.listaTipoUsuarios.findIndex(m => m.id === informacion.datos.id);
            switch (this.accion) {
                case Accion.Adicion:
                    // Si se crea un registro en la bd, se agrega a la tabla visualmente.
                    this.listaTipoUsuarios.unshift(informacion.datos);
                    break;
                case Accion.Edicion:
                    // Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
                    if (index !== -1) {
                        this.listaTipoUsuarios.splice(index, 1);
                        this.listaTipoUsuarios.unshift(informacion.datos);
                    }
                    break;
                case Accion.Eliminacion:
                    // Si se elimina un registro en la bd, se elimina de la tabla visualmente.
                    if (index !== -1) {
                        this.listaTipoUsuarios.splice(index, 1);
                    }
                    break;
            }
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de tipo de usuarios! ', error, `${this.actualizarGrid.name}`);
        }
    }
}