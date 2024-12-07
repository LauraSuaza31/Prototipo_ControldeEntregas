import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion } from 'src/app/utils/enums';
import { AsignacionEquiposService } from '../../../services/asignacion-equipos.service';
import { AsignacionEquiposModel } from '../../../models/asignacionEquipos.model';
import { funciones } from 'src/app/utils/funciones';
import { EquipoModel } from '../../../models/equipo.model';
import { EmpleadoModel } from '../../../models/empleado.model';
import { EquiposService } from '../../../services/equipos.service';
import { EmpleadosService } from '../../../services/empleados.service';
import { UsuarioModel } from 'src/app/modules/configuration/models/usuario.model';

@Component({
    selector: 'app-captura-asignacion',
    templateUrl: './captura-asignacion.component.html',
    providers: [AsignacionEquiposService]
})

export class CapturaAsignacionComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("modalAsignacionEquipos") modalAsignacionEquipos?: NgbModalRef;

    modal!: NgbModalRef;
    validaFor: boolean = false;
    // (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
    formularioAsignacionEquipos!: FormGroup;
    listaEquipos: Array<EquipoModel> = new Array<EquipoModel>();
    listaEmpleadosTmp: Array<EmpleadoModel> = new Array<EmpleadoModel>();
    listaEmpleadoRecibe: Array<EmpleadoModel> = new Array<EmpleadoModel>();
    listaEmpleadoEntrega: Array<EmpleadoModel> = new Array<EmpleadoModel>();
    funcionesGenerales = new funciones();
    modeloAsignacionEquipo: AsignacionEquiposModel = new AsignacionEquiposModel();
    accionARealizar = Accion;
    infoUsuarioSesion: UsuarioModel = new UsuarioModel();

    @Input() accion: Accion = Accion.Ninguno;
    @Input()
    get visible(): boolean { return false; }
    set visible(value: boolean) {
        if (value) {
            this.abrirModal();
        }
    }
    @Output() visibleChange = new EventEmitter();
    @Output() actualizar = new EventEmitter<{ datos: AsignacionEquiposModel, accion: Accion }>();
    @Output() limpiarDatos = new EventEmitter();

    constructor(
        private modalService: NgbModal,
        private creadorFormulario: FormBuilder,
        private servicioAsignacionEquipos: AsignacionEquiposService,
        private servicioEquipos: EquiposService,
        private servicioEmpleados: EmpleadosService
    ) {
        this.inicializarFormulario();
    }

    /**
     * se ejecuta cada que se cambian los datos del input datos Asignacion
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

    async ngOnInit(): Promise<void> {
        this.infoUsuarioSesion = JSON.parse(sessionStorage.getItem('datosUsuario')!);
        await this.obtenerEmpleados();
        await this.obtenerEquipos();
    }

    ngOnDestroy(): void {
        this.validaFor = false;
        this.modeloAsignacionEquipo = new AsignacionEquiposModel();
        this.accion = Accion.Ninguno;
    }

    /**
     * Se inicializa el formulario con su respectivas validaciones
     * @author angier
     */
    inicializarFormulario(): void {
        try {
            this.formularioAsignacionEquipos = this.creadorFormulario.group({
                idEquipo: [0, [Validators.required]],
                idEmpleadoRecibe: [0, [Validators.required]],
                idEmpleadoEntrega: [0, [Validators.required]],
                fechaEntrega: [null, [Validators.maxLength(20), Validators.required]],
                horaEntrega: [null, [Validators.maxLength(20), Validators.required]]
            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de Asignación!', error, `${this.inicializarFormulario.name}`);
        }
    }

    /**
     * Se abre el modal de asignación
     * @author angier
     */
    abrirModal(): void {
        try {
            this.modal = this.modalService.open(this.modalAsignacionEquipos, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
            this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al abrir el modal de asignación!', error, `${this.abrirModal.name}`);
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
                    this.formularioAsignacionEquipos.controls['idEquipo'].enable();
                    this.formularioAsignacionEquipos.controls['idEmpleadoRecibe'].enable();
                    this.formularioAsignacionEquipos.controls['idEmpleadoEntrega'].enable();
                    this.formularioAsignacionEquipos.controls['fechaEntrega'].enable();
                    this.formularioAsignacionEquipos.controls['horaEntrega'].enable();

                    this.modeloAsignacionEquipo = new AsignacionEquiposModel();
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
                if (this.formularioAsignacionEquipos.valid) {
                    let modelo = new AsignacionEquiposModel();
                    modelo = this.formularioAsignacionEquipos.value;
                    switch (this.accion) {
                        case Accion.Adicion:
                            modelo.fechaCreacion = new Date();
                            modelo.usuarioCreacion = this.infoUsuarioSesion.nombre;
                            this.crear(modelo);
                            break;
                    }
                } else {
                    this.funcionesGenerales.mensajeAdvertencia('No se completaron algunos campos requeridos! ');
                }
                resolve();
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al guardar los datos de la asignación!', error, `${this.guardar.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la creación de una asignación
     * @author angier}
     */
    crear(datosAsignacionEquipo: AsignacionEquiposModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de crear y se envia la info necesaria.
                const servicioAgregar = this.servicioAsignacionEquipos.crear(datosAsignacionEquipo).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                /// Mostramos mensaje de exito, y enviamos la información recibida a 
                                /// a la parte principal de las asignaciones.
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.modeloAsignacionEquipo = response.datos;
                                this.actualizar.emit({ datos: this.modeloAsignacionEquipo, accion: Accion.Adicion });
                                this.cerrarModal();
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar crear una asignación');
                        }
                        servicioAgregar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al crear la asignación', error, `${this.crear.name}`);
                        servicioAgregar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al crear la asignación', error, `${this.crear.name}`);
                reject();
            }
        });
    }

    /**
     * Se obtiene la lista de asignaciones
     * @author angier
     */
    obtenerEquipos(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioEquipos.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaEquipos = response.datos;
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron asignaciones creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los asignaciones!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los asignaciones', error, `${this.obtenerEquipos.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los cargos! ', error, `${this.obtenerEquipos.name}`);
                reject();
            }
        })
    }

    /**
     * Se obtiene la lista de asignación
     * @author angier
     */
    obtenerEmpleados(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioEmpleados.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaEmpleadosTmp = response.datos;
                                this.listaEmpleadoRecibe = response.datos;
                                this.listaEmpleadoEntrega = response.datos;

                                if (this.funcionesGenerales.isDefinedAndNotEmpty(this.infoUsuarioSesion)) {
                                    const index = this.listaEmpleadoRecibe.findIndex(emp => emp.id === this.infoUsuarioSesion.idEmpleado);
                                    this.listaEmpleadoRecibe.splice(index, 1);
                                }
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron asignaciones creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los asignaciones!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los asignaciones', error, `${this.obtenerEmpleados.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los asignaciones! ', error, `${this.obtenerEmpleados.name}`);
                reject;
            }
        })
    }

    /**
     * Se cierra modal de asignación
       * @author angier
     */
    async cerrarModal(): Promise<void> {
        try {
            this.modal?.close();
            this.formularioAsignacionEquipos.reset();
            this.validaFor = false;
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
        }
    }
}
