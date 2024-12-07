import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { CargosService } from '../../../services/cargos.service';
import { CargoModel } from '../../../models/cargo.model';
import { funciones } from 'src/app/utils/funciones';

@Component({
    selector: 'app-captura-cargo',
    templateUrl: './captura-cargo.component.html',
    providers: [CargosService]
})
export class CapturaCargoComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("modalCargos") modalCargos?: NgbModalRef;

    modal!: NgbModalRef;
    validaFor: boolean = false;
    // (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
    formularioCargos!: FormGroup;
    estados = Estados;
    listaEstados: Array<Estados> = new Array<Estados>();
    funcionesGenerales = new funciones();
    modeloCargo: CargoModel = new CargoModel();
    accionARealizar = Accion;

    @Input() datosCargo: CargoModel = new CargoModel();
    @Input() accion: Accion = Accion.Ninguno;
    @Input()
    get visible(): boolean { return false; }
    set visible(value: boolean) {
        if (value) {
            this.abrirModal();
        }
    }
    @Output() visibleChange = new EventEmitter();
    @Output() actualizar = new EventEmitter<{ datos: CargoModel, accion: Accion }>();
    @Output() limpiarDatos = new EventEmitter();

    constructor(
        private modalService: NgbModal,
        private creadorFormulario: FormBuilder,
        private servicioCargos: CargosService
    ) {
        this.inicializarFormulario();
    }

    /**
     * se ejecuta cada que se cambian los datos del input datosCargos
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
        this.datosCargo = new CargoModel();
        this.validaFor = false;
        this.listaEstados = new Array<Estados>();
        this.modeloCargo = new CargoModel();
        this.accion = Accion.Ninguno;
    }

    /**
     * Se inicializa el formulario con su respectivas validaciones
     * @author angier
     */
    inicializarFormulario(): void {
        try {
            this.formularioCargos = this.creadorFormulario.group({
                nombre: [null, [Validators.maxLength(20), Validators.required]],
                estado: [0, [Validators.required]]
            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de Cargos!', error, `${this.inicializarFormulario.name}`);
        }
    }

    /**
     * Se abre el modal de usuarios
     * @author angier
     */
    abrirModal(): void {
        try {
            this.modal = this.modalService.open(this.modalCargos, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
            this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al abrir el modal de cargos!', error, `${this.abrirModal.name}`);
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
                    this.modeloCargo = new CargoModel();
                    break;
                case Accion.Edicion:
                    this.modeloCargo = this.datosCargo;
                    this.formularioCargos.patchValue(this.datosCargo);
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
                if (this.formularioCargos.valid) {
                    let modelo = new CargoModel();
                    modelo = this.formularioCargos.value;
                    switch (this.accion) {
                        case Accion.Adicion:
                            modelo.fechaCreacion = new Date();
                            modelo.usuarioCreacion = 'Administrador';
                            this.crear(modelo);
                            break;
                        case Accion.Edicion:
                            modelo.fechaModificacion = new Date();
                            modelo.usuarioModificacion = 'Administrador';
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
                this.funcionesGenerales.userExcepcion('Error al guardar los datos de la cargo!', error, `${this.guardar.name}`);
            }
        });
    }

    /**
     * Se realiza la creación de una cargo
     * @author angier}
     */
    crear(datosCargo: CargoModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de crear y se envia la info necesaria.
                const servicioAgregar = this.servicioCargos.crear(datosCargo).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                /// Mostramos mensaje de exito, y enviamos la información recibida a 
                                /// a la parte principal de los cargos.
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.modeloCargo = response.datos;
                                this.actualizar.emit({ datos: this.modeloCargo, accion: Accion.Adicion });
                                this.cerrarModal();
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar crear un cargo');
                        }
                        servicioAgregar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al crear el cargo', error, `${this.crear.name}`);
                        servicioAgregar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al crear el cargo', error, `${this.crear.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la modificación de la cargo seleccionada
     * @returns 
     * @author angier
     */
    modificar(datosCargo: CargoModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de modificar y se envia la info necesaria.
                const servicioModificar = this.servicioCargos.modificar(this.datosCargo.id, datosCargo).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            /// Mostramos mensaje de exito, y enviamos la información recibida a 
                            /// a la parte principal de los cargos.
                            this.funcionesGenerales.mensajeExito(response.mensaje);
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                this.modeloCargo = response.datos;
                                this.actualizar.emit({ datos: this.modeloCargo, accion: Accion.Edicion });
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar modificar el cargo!');
                        }
                        servicioModificar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al modificar el cargo', error, `${this.modificar.name}`);
                        servicioModificar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al modificar el cargo', error, `${this.modificar.name}`);
                reject();
            }
        })
    }

    /**
     * Se cierra modal de cargos
     * @author angier
     */
    async cerrarModal(): Promise<void> {
        try {
            this.modal?.close();
            this.formularioCargos.reset();
            this.validaFor = false;
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
        }
    }
}


