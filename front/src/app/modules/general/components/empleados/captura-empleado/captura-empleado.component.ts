import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados, Genero } from 'src/app/utils/enums';
import { EmpleadosService } from '../../../services/empleados.service';
import { EmpleadoModel } from '../../../models/empleado.model';
import { funciones } from 'src/app/utils/funciones';
import { CargosService } from '../../../services/cargos.service';
import { AreasService } from '../../../services/areas.service';
import { CargoModel } from '../../../models/cargo.model';
import { AreaModel } from '../../../models/area.model';


@Component({
    selector: 'app-captura-empleado',
    templateUrl: './captura-empleado.component.html',
    providers: [EmpleadosService, CargosService]
})
export class CapturaEmpleadoComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("modalEmpleado") modalEmpleados?: NgbModalRef;

    modal!: NgbModalRef;
    validaFor: boolean = false;
    // (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
    formularioEmpleados!: FormGroup;
    estados = Estados;
    genero = Genero;
    listaEstados: Array<Estados> = new Array<Estados>();
    listaGenero: Array<Genero> = new Array<Genero>();
    listaCargos: Array<CargoModel> = new Array<CargoModel>();
    listaAreas: Array<AreaModel> = new Array<AreaModel>();
    funcionesGenerales = new funciones();
    modeloEmpleado: EmpleadoModel = new EmpleadoModel();
    accionARealizar = Accion;

    @Input() datosEmpleado: EmpleadoModel = new EmpleadoModel();
    @Input() accion: Accion = Accion.Ninguno;
    @Input()
    get visible(): boolean { return false; }
    set visible(value: boolean) {
        if (value) {
            this.abrirModal();
        }
    }
    @Output() visibleChange = new EventEmitter();
    @Output() actualizar = new EventEmitter<{ datos: EmpleadoModel, accion: Accion }>();
    @Output() limpiarDatos = new EventEmitter();

    constructor(
        private modalService: NgbModal,
        private creadorFormulario: FormBuilder,
        private servicioEmpleados: EmpleadosService,
        private servicioCargos: CargosService,
        private servicioAreas: AreasService
    ) {
        this.inicializarFormulario();
    }

    /**
     * se ejecuta cada que se cambian los datos del input datos Empleado
     * @param changes 
     * @author angier
     */
    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.hasOwnProperty('visible')) {
            if (changes['visible'].currentValue) {
                this.listaEstados = this.funcionesGenerales.enumToArray(this.estados);
                this.listaGenero = this.funcionesGenerales.enumToArray(this.genero);
                await this.obtenerCargos();
                await this.obtenerAreas();
                this.validarDatosEntrada();

            }
        }
    }

    async ngOnInit(): Promise<void> {
        this.listaEstados = this.funcionesGenerales.enumToArray(this.estados);
        this.listaGenero = this.funcionesGenerales.enumToArray(this.genero);
    }

    ngOnDestroy(): void {
        this.datosEmpleado = new EmpleadoModel();
        this.validaFor = false;
        this.listaEstados = new Array<Estados>();
        this.modeloEmpleado = new EmpleadoModel();
        this.accion = Accion.Ninguno;
    }

    /**
     * Se inicializa el formulario con su respectivas validaciones
     * @author angier
     */
    inicializarFormulario(): void {
        try {
            this.formularioEmpleados = this.creadorFormulario.group({
                identificacion: [null, [Validators.maxLength(20), Validators.required]],
                nombre: [null, [Validators.maxLength(20), Validators.required]],
                apellido: [null, [Validators.maxLength(20), Validators.required]],
                genero: [null, [Validators.maxLength(20), Validators.required]],
                idCargo: [0, [Validators.required]],
                idArea: [0, [Validators.required]],
                estado: [0, [Validators.required]]

            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de Empleados!', error, `${this.inicializarFormulario.name}`);
        }
    }

    /**
     * Se abre el modal de empleados
     * @author angier
     */
    abrirModal(): void {
        try {
            this.modal = this.modalService.open(this.modalEmpleados, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
            this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al abrir el modal de empleados!', error, `${this.abrirModal.name}`);
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
     * @author DLD
     */
    validarDatosEntrada(): void {
        try {
            switch (this.accion) {
                case Accion.Adicion:
                    this.formularioEmpleados.controls['identificacion'].enable();
                    this.modeloEmpleado = new EmpleadoModel();
                    break;
                case Accion.Edicion:
                    this.formularioEmpleados.controls['identificacion'].disable();
                    debugger;
                    this.modeloEmpleado = this.datosEmpleado;
                    this.formularioEmpleados.patchValue(this.datosEmpleado);
                    this.formularioEmpleados.controls['genero'].patchValue(this.datosEmpleado.genero === 'F' ? 0 : 1);
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
                debugger;
                this.validaFor = true;
                if (this.formularioEmpleados.valid) {
                    let modelo = new EmpleadoModel();
                    modelo = this.formularioEmpleados.value;
                    modelo.genero = this.formularioEmpleados.controls['genero'].value === 0 ? 'F' : 'M';
                    switch (this.accion) {
                        case Accion.Adicion:
                            modelo.fechaCreacion = new Date();
                            modelo.usuarioCreacion = 'Administrador';
                            this.crear(modelo);
                            break;
                        case Accion.Edicion:
                            modelo.fechaModificacion = new Date();
                            modelo.usuarioModificacion = 'Administrador';
                            modelo.identificacion = this.datosEmpleado.identificacion;
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
                this.funcionesGenerales.userExcepcion('Error al guardar los datos del empleado!', error, `${this.guardar.name}`);
            }
        });
    }

    /**
     * Se realiza la creación de un empleado
     * @author angier}
     */
    crear(datosEmpleado: EmpleadoModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de crear y se envia la info necesaria.
                const servicioAgregar = this.servicioEmpleados.crear(datosEmpleado).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                /// Mostramos mensaje de exito, y enviamos la información recibida a 
                                /// a la parte principal de los empleados.
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.modeloEmpleado = response.datos;
                                this.actualizar.emit({ datos: this.modeloEmpleado, accion: Accion.Adicion });
                                this.cerrarModal();
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar crear un empleado');
                        }
                        servicioAgregar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al crear el empleado', error, `${this.crear.name}`);
                        servicioAgregar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al crear el empleado', error, `${this.crear.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la modificación del empleado seleccionada
     * @returns 
     * @author angier
     */
    modificar(datosEmpleado: EmpleadoModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de modificar y se envia la info necesaria.
                const servicioModificar = this.servicioEmpleados.modificar(this.datosEmpleado.id, datosEmpleado).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            /// Mostramos mensaje de exito, y enviamos la información recibida a 
                            /// a la parte principal de los empleados.
                            this.funcionesGenerales.mensajeExito(response.mensaje);
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                this.modeloEmpleado = response.datos;
                                this.actualizar.emit({ datos: this.modeloEmpleado, accion: Accion.Edicion });
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar modificar el empleado!');
                        }
                        servicioModificar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al modificar el empleado', error, `${this.modificar.name}`);
                        servicioModificar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al modificar el empleado', error, `${this.modificar.name}`);
                reject();
            }
        })
    }

    /**
	 * Se obtiene la lista de cargos
	 * @author angier
	 */
	obtenerCargos(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioCargos.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaCargos = response.datos;
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron cargos creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los cargos!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los cargos', error, `${this.obtenerCargos.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los cargos! ', error, `${this.obtenerCargos.name}`);
                reject();
            }
        })
	}

    /**
	 * Se obtiene la lista de areas
	 * @author angier
	 */
	obtenerAreas(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioAreas.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaAreas = response.datos;
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron areas creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los areas!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los areas', error, `${this.obtenerAreas.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los areas! ', error, `${this.obtenerAreas.name}`);
                reject;
            }
        })
	}

    /**
     * Se cierra modal de empleados
       * @author angier
     */
    async cerrarModal(): Promise<void> {
        try {
            this.modal?.close();
            this.formularioEmpleados.reset();
            this.validaFor = false;
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
        }
    }
}