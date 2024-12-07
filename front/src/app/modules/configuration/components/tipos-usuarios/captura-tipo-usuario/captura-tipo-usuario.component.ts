import { EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { TipoUsuariosModel } from '../../../models/tipoUsuario.model';
import { TiposUsuariosService } from '../../../services/tipos-usuarios.service';

@Component({
    selector: 'app-captura-tipo-usuario',
    templateUrl: './captura-tipo-usuario.component.html',
    providers: [TiposUsuariosService]
})
export class CapturaTipoUsuarioComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("modalTipoUsuarios") modalTipoUsuarios?: NgbModalRef;

    modal!: NgbModalRef;
    validaFor: boolean = false;
    // (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
    formularioTipoUsuarios!: FormGroup;
    estados = Estados;
    listaEstados: Array<Estados> = new Array<Estados>();
    funcionesGenerales = new funciones();
    modeloTipoUsuarios: TipoUsuariosModel = new TipoUsuariosModel();
    accionARealizar = Accion;

    @Input() datosTipoUsuarios: TipoUsuariosModel = new TipoUsuariosModel();
    @Input() accion: Accion = Accion.Ninguno;
    @Input()
    get visible(): boolean { return false; }
    set visible(value: boolean) {
        if (value) {
            this.abrirModal();
        }
    }
    @Output() visibleChange = new EventEmitter();
    @Output() actualizar = new EventEmitter<{ datos: TipoUsuariosModel, accion: Accion }>();
    @Output() limpiarDatos = new EventEmitter();

    constructor(
        private modalService: NgbModal,
        private creadorFormulario: FormBuilder,
        private servicioTiposUsuarios: TiposUsuariosService
    ) {
        this.inicializarFormulario();
    }

    /**
     * se ejecuta cada que se cambian los datos del input datosTipoUsuario
     * @param changes 
     * @author angier
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('visible')) {
            if (changes['visible'].currentValue) {
                this.validarDatosEntrada();
            }
        }
    }

    ngOnInit(): void {
        this.listaEstados = this.funcionesGenerales.enumToArray(this.estados);
    }

    ngOnDestroy(): void {
        this.datosTipoUsuarios = new TipoUsuariosModel();
        this.validaFor = false;
        this.listaEstados = new Array<Estados>();
        this.modeloTipoUsuarios = new TipoUsuariosModel();
        this.accion = Accion.Ninguno;
    }

    /**
     * Se inicializa el formulario con su respectivas validaciones
     * @author angier
     */
    inicializarFormulario(): void {
        try {
            this.formularioTipoUsuarios = this.creadorFormulario.group({
                nombre: [null, [Validators.maxLength(20), Validators.required]]
            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de TipoUsuarioss!', error, `${this.inicializarFormulario.name}`);
        }
    }

    /**
     * Se abre el modal de tipos de usuarios
     * @author angier
     */
    abrirModal(): void {
        try {
            this.modal = this.modalService.open(this.modalTipoUsuarios, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
            this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al abrir el modal de TipoUsuarioss!', error, `${this.abrirModal.name}`);
        }
    }

    /**
     * Confirmacion de cierre del modal
     * @author angier
     */
    async ConfirmarCierre(): Promise<boolean> {
        let conf: boolean;
        try {
            conf = await this.funcionesGenerales.confirmarMensaje('Esta seguro de descartar los cambios?');
        } catch (error) {
            conf = false;
        }
        return conf;
    }

    /**
     * valida los datos de entrada segun la acción a realizar sea (Adición o Edición) 
     * @author angier
     */
    validarDatosEntrada(): void {
        try {
            switch (this.accion) {
                case Accion.Adicion:
                    this.modeloTipoUsuarios = new TipoUsuariosModel();
                    break;
                case Accion.Edicion:
                    this.modeloTipoUsuarios = this.datosTipoUsuarios;
                    this.formularioTipoUsuarios.patchValue(this.datosTipoUsuarios);
                    break;
            }
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al validar los datos de entrada', error, `${this.validarDatosEntrada.name}`);
        }
    }

    /**
     * Realiza el respectivo proceso dependiendo de la acción a realzar sea Adición o Edición
     * @returns 
     * @author angier
     */
    guardar(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.validaFor = true;
                if (this.formularioTipoUsuarios.valid) {
                    let modelo = new TipoUsuariosModel();
                    modelo = this.formularioTipoUsuarios.value;
                    switch (this.accion) {
                        case Accion.Adicion:
                            this.crear(modelo);
                            break;
                        case Accion.Edicion:
                            this.modificar(modelo)
                                .then(() => {
                                    resolve();
                                    this.cerrarModal();
                                }).catch(() => {
                                    reject();
                                });
                            break;
                    }
                } else {
                    this.funcionesGenerales.mensajeAdvertencia('No se completaron algunos campos requeridos! ');
                }
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al guardar los datos de la Tipo Usuarios!', error, `${this.guardar.name}`);
            }
        });
    }

    /**
     * Se realiza la creación de una Tipo de usuarios
     * @author angier}
     */
    crear(datosTipoUsuarios: TipoUsuariosModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de crear y se envia la info necesaria.
                const servicioAgregar = this.servicioTiposUsuarios.crear(datosTipoUsuarios).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                /// Mostramos mensaje de exito, y enviamos la información recibida a 
                                /// a la parte principal de las Tipo Usuarios.
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.modeloTipoUsuarios = response.datos;
                                this.actualizar.emit({ datos: this.modeloTipoUsuarios, accion: Accion.Adicion });
                                this.cerrarModal();
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar crear una Tipo Usuarios');
                        }
                        servicioAgregar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al crear la TipoUsuarios', error, `${this.crear.name}`);
                        servicioAgregar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al crear la TipoUsuarios', error, `${this.crear.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la modificación de la Tipo de usuarios seleccionada
     * @returns 
     * @author angier
     */
    modificar(datosTipoUsuarios: TipoUsuariosModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de modificar y se envia la info necesaria.
                const servicioModificar = this.servicioTiposUsuarios.modificar(this.datosTipoUsuarios.id, datosTipoUsuarios).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            /// Mostramos mensaje de exito, y enviamos la información recibida a 
                            /// a la parte principal de las TipoUsuarioss.
                            this.funcionesGenerales.mensajeExito(response.mensaje);
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                this.modeloTipoUsuarios = response.datos;
                                this.actualizar.emit({ datos: this.modeloTipoUsuarios, accion: Accion.Edicion });
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar modificar la Tipo Usuarios!');
                        }
                        servicioModificar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al modificar la Tipo Usuarios', error, `${this.modificar.name}`);
                        servicioModificar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al modificar la Tipo Usuarios', error, `${this.modificar.name}`);
                reject();
            }
        })
    }

    /**
     * Se cierra modal de Tipo de usuarios
    * @author angier
     */
    async cerrarModal(): Promise<void> {
        try {
            this.modal?.close();
            this.formularioTipoUsuarios.reset();
            this.validaFor = false;
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
        }
    }
}