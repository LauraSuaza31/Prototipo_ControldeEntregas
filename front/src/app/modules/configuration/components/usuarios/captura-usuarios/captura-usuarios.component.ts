import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Accion, Estados } from 'src/app/utils/enums';
import { TipoUsuariosModel } from '../../../models/tipoUsuario.model';
import { funciones } from 'src/app/utils/funciones';
import { UsuariosService } from '../../../services/usuarios.service';
import { EmpleadosService } from 'src/app/modules/general/services/empleados.service';
import { TiposUsuariosService } from '../../../services/tipos-usuarios.service';
import { ResponseModel } from 'src/app/models/response.model';
import { UsuarioModel } from '../../../models/usuario.model';
import { EmpleadoModel } from 'src/app/modules/general/models/empleado.model';

@Component({
    selector: 'app-captura-usuarios',
    templateUrl: './captura-usuarios.component.html'
})
export class CapturaUsuariosComponent implements OnInit {

    @ViewChild("modalUsuario") modalUsuarios?: NgbModalRef;

    modal!: NgbModalRef;
    validaFor: boolean = false;
    // (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
    formularioUsuarios!: FormGroup;
    estados = Estados;
    listaEstados: Array<Estados> = new Array<Estados>();
    listaEmpleados: Array<UsuarioModel> = new Array<UsuarioModel>();
    listaTipoUsuarios: Array<TipoUsuariosModel> = new Array<TipoUsuariosModel>();
    funcionesGenerales = new funciones();
    modeloUsuario: UsuarioModel = new UsuarioModel();
    accionARealizar = Accion;
    empleadoExistente: boolean = false;

    @Input() datosUsuario: UsuarioModel = new UsuarioModel();
    @Input() accion: Accion = Accion.Ninguno;
    @Input()
    get visible(): boolean { return false; }
    set visible(value: boolean) {
        if (value) {
            this.abrirModal();
        }
    }
    @Output() visibleChange = new EventEmitter();
    @Output() actualizar = new EventEmitter<{ datos: UsuarioModel, accion: Accion }>();
    @Output() limpiarDatos = new EventEmitter();

    constructor(
        private modalService: NgbModal,
        private creadorFormulario: FormBuilder,
        private servicioUsuarios: UsuariosService,
        private servicioEmpleado: EmpleadosService,
        private servicioTipoUsuario: TiposUsuariosService
    ) {
        this.inicializarFormulario();
    }

    /**
     * se ejecuta cada que se cambian los datos del input datosUsuarios
     * @param changes 
     * @author DLD
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('visible')) {
            if (changes['visible'].currentValue) {
                this.validarDatosEntrada();
            }
        }
    }

    async ngOnInit(): Promise<void> {
        this.listaEstados = this.funcionesGenerales.enumToArray(this.estados);
        await this.obtenerEmpleados();
        await this.obtenerTiposUsuarios();
    }

    ngOnDestroy(): void {
        this.datosUsuario = new UsuarioModel();
        this.validaFor = false;
        this.listaEstados = new Array<Estados>();
        this.modeloUsuario = new UsuarioModel();
        this.accion = Accion.Ninguno;
    }

    /**
     * Se inicializa el formulario con su respectivas validaciones
     * @author DLD
     */
    inicializarFormulario(): void {
        try {
            this.formularioUsuarios = this.creadorFormulario.group({
                nombre: [null, [Validators.maxLength(20), Validators.required]],
                idTipoUsuario: [0, [Validators.required]],
                idEmpleado: [0, [Validators.required]],
                estado: [0, [Validators.required]]
            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de Usuarios!', error, `${this.inicializarFormulario.name}`);
        }
    }

    /**
     * Se abre el modal de usuarios
     * @author DLD
     */
    abrirModal(): void {
        try {
            this.modal = this.modalService.open(this.modalUsuarios, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
            this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al abrir el modal de empleados!', error, `${this.abrirModal.name}`);
        }
    }

    /**
     * Confirmacion de cierre del modal
     * @author DLD
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
                    this.formularioUsuarios.controls['nombre'].enable();
                    this.formularioUsuarios.controls['idEmpleado'].enable();
                    this.modeloUsuario = new UsuarioModel();
                    break;
                case Accion.Edicion:
                    this.formularioUsuarios.controls['nombre'].disable();
                    this.formularioUsuarios.controls['idEmpleado'].disable();
                    this.modeloUsuario = this.datosUsuario;
                    this.formularioUsuarios.patchValue(this.datosUsuario);
                    break;
            }
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al validar los datos de entrada', error, `${this.validarDatosEntrada.name}`);
        }
    }

    /**
     * Se verifica si el empleado seleccionado ya tiene un usuario asignado
     * @author DLD
     */
    seleccionoEmpleado(datosEmpleado: EmpleadoModel): void {
        try {
            if (this.accion === Accion.Adicion) {
                if (this.funcionesGenerales.isDefinedAndNotEmpty(datosEmpleado)) {
                    const servicio = this.servicioUsuarios.obtenerPorEmpleado(datosEmpleado.id).subscribe(
                        (response: ResponseModel) => {
                            if (this.funcionesGenerales.responseValidator(response)) {
                                if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                    this.funcionesGenerales.mensajeAdvertencia('El empleado seleccionado ya tiene un usuario asignado, por favor seleccione un nuevo empleado');
                                    this.empleadoExistente = true;
                                } else {
                                    this.empleadoExistente = false;
                                }
                            } else {
                                this.funcionesGenerales.mensajeError('Error al intentar obtener el empleado seleccionado!');
                            }
                            servicio.unsubscribe();
                        },
                        error => {
                            this.funcionesGenerales.userExcepcion('Error el empleado seleccionado', error, `${this.seleccionoEmpleado.name}`);
                            servicio.unsubscribe();
                        });
                    
                }
            }
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al obtener el empleado seleccionado', error, `${this.seleccionoEmpleado.name}`);
        }
    }
    /**
     * Realiza el respectivo proceso dependiendo de la acción a realzar sea Adición o Edición
     * @returns 
     * @author DLD
     */
    guardar(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.validaFor = true;
                if (this.formularioUsuarios.valid) {
                    let modelo = new UsuarioModel();
                    modelo = this.formularioUsuarios.value;
                    switch (this.accion) {
                        case Accion.Adicion:
                            if (!this.empleadoExistente) {
                                modelo.fechaCreacion = new Date();
                                modelo.usuarioCreacion = 'Administrador';
                                this.crear(modelo);
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('El empleado seleccionado ya tiene un usuario asignado, por favor seleccione un nuevo empleado');
                            }
                            break;
                        case Accion.Edicion:
                            modelo.fechaModificacion = new Date();
                            modelo.usuarioModificacion = 'Administrador';
                            modelo.nombre = this.datosUsuario.nombre;
                            this.modificar(modelo);
                            break;
                    }
                } else {
                    this.funcionesGenerales.mensajeAdvertencia('No se completaron algunos campos requeridos! ');
                }
                resolve();
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al guardar los datos del usuario!', error, `${this.guardar.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la creación de un usuarios
     * @author DLD}
     */
    crear(datosUsuario: UsuarioModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de crear y se envia la info necesaria.
                const servicioAgregar = this.servicioUsuarios.crear(datosUsuario).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                /// Mostramos mensaje de exito, y enviamos la información recibida a 
                                /// a la parte principal de los usuarios.
                                this.funcionesGenerales.mensajeExito(response.mensaje);
                                this.modeloUsuario = response.datos;
                                this.actualizar.emit({ datos: this.modeloUsuario, accion: Accion.Adicion });
                                this.cerrarModal();
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar crear un usuario');
                        }
                        servicioAgregar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al crear el usuario', error, `${this.crear.name}`);
                        servicioAgregar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al crear el usuario', error, `${this.crear.name}`);
                reject();
            }
        });
    }

    /**
     * Se realiza la modificación del usuario seleccionada
     * @returns 
     * @author DLD
     */
    modificar(datosUsuario: UsuarioModel): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Se realiza la petición al servicio de modificar y se envia la info necesaria.
                const servicioModificar = this.servicioUsuarios.modificar(this.datosUsuario.id, datosUsuario).subscribe(
                    (response: ResponseModel) => {
                        // Se recibe la respuesta de la petición
                        if (this.funcionesGenerales.responseValidator(response)) {
                            /// Mostramos mensaje de exito, y enviamos la información recibida a 
                            /// a la parte principal de los usuarios.
                            this.funcionesGenerales.mensajeExito(response.mensaje);
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                this.modeloUsuario = response.datos;
                                this.actualizar.emit({ datos: this.modeloUsuario, accion: Accion.Edicion });
                            }
                            this.cerrarModal();
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar modificar el usuario!');
                        }
                        servicioModificar.unsubscribe();
                        resolve();
                    }, error => {
                        this.funcionesGenerales.userExcepcion('Error al modificar el usuario', error, `${this.modificar.name}`);
                        servicioModificar.unsubscribe();
                        reject();
                    }
                );
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al modificar el usuario', error, `${this.modificar.name}`);
                reject();
            }
        })
    }

    /**
	 * Se obtiene la lista de empleados
	 * @author DLD
	 */
	obtenerEmpleados(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioEmpleado.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaEmpleados = response.datos;
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron empleados creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los empleados!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los empleados', error, `${this.obtenerEmpleados.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los empleados! ', error, `${this.obtenerEmpleados.name}`);
                reject();
            }
        })
	}

    /**
	 * Se obtiene la lista de tipos de usuario
	 * @author DLD
	 */
	obtenerTiposUsuarios(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const servicio = this.servicioTipoUsuario.obtener().subscribe(
                    (response: ResponseModel) => {
                        if (this.funcionesGenerales.responseValidator(response)) {
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
                                // obtencion de datos
                                this.listaTipoUsuarios = response.datos;
                            } else {
                                this.funcionesGenerales.mensajeAdvertencia('No se encontraron tipos de usuario creados!');
                            }
                        } else {
                            this.funcionesGenerales.mensajeError('Error al intentar obtener los tipos de usuario!');
                        }
                        servicio.unsubscribe();
                        resolve();
                    },
                    error => {
                        this.funcionesGenerales.userExcepcion('Error al obtener los tipos de usuario', error, `${this.obtenerTiposUsuarios.name}`);
                        servicio.unsubscribe();
                        reject();
                    });
            }
            catch (error) {
                this.funcionesGenerales.userExcepcion('Error al obtener los tipos de usuario! ', error, `${this.obtenerTiposUsuarios.name}`);
                reject;
            }
        })
	}

    /**
     * Se cierra modal de tipos de usuario
       * @author DLD
     */
    async cerrarModal(): Promise<void> {
        try {
            this.modal?.close();
            this.formularioUsuarios.reset();
            this.validaFor = false;
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
        }
    }   
}