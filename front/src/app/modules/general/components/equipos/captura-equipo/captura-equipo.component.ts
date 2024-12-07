import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { EquiposService } from '../../../services/equipos.service';
import { EquipoModel } from '../../../models/equipo.model';
import { funciones } from 'src/app/utils/funciones';

@Component({
	selector: 'app-captura-equipo',
	templateUrl: './captura-equipo.component.html',
	providers: [EquiposService]
})
export class CapturaEquipoComponent implements OnInit, OnChanges, OnDestroy {

	@ViewChild("modalEquipos") modalEquipos?: NgbModalRef;

	modal!: NgbModalRef;
	validaFor: boolean = false;
	// (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
	formularioEquipos!: FormGroup;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	funcionesGenerales = new funciones();
	modeloEquipo: EquipoModel = new EquipoModel();
	accionARealizar = Accion;

	@Input() datosEquipo: EquipoModel = new EquipoModel();
	@Input() accion: Accion = Accion.Ninguno;
	@Input()
	get visible(): boolean { return false; }
	set visible(value: boolean) {
		if (value) {
			this.abrirModal();
		}
	}
	@Output() visibleChange = new EventEmitter();
	@Output() actualizar = new EventEmitter<{ datos: EquipoModel, accion: Accion }>();
	@Output() limpiarDatos = new EventEmitter();

	constructor(
		private modalService: NgbModal,
		private creadorFormulario: FormBuilder,
		private servicioEquipos: EquiposService
	) {
		this.inicializarFormulario();
	}

	/**
	 * se ejecuta cada que se cambian los datos del input datosEquipos
	 * @param changes 
	 * @author Oscar-Ramirez
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
		this.datosEquipo = new EquipoModel();
		this.validaFor = false;
		this.listaEstados = new Array<Estados>();
		this.modeloEquipo = new EquipoModel();
		this.accion = Accion.Ninguno;
	}

	/**
	 * Se inicializa el formulario con su respectivas validaciones
	 * @author Oscar-Ramirez
	 */
	inicializarFormulario(): void {
		try {
			this.formularioEquipos = this.creadorFormulario.group({
				idSerial: [null, [Validators.maxLength(20), Validators.required]],
				nombre: [null, [Validators.maxLength(20), Validators.required]],
				estado: [0, [Validators.required]]
			})
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de Equipos!', error, `${this.inicializarFormulario.name}`);
		}
	}

	/**
	 * Se abre el modal de equipos
	 * @author Oscar-Ramirez
	 */
	abrirModal(): void {
		try {
			this.modal = this.modalService.open(this.modalEquipos, { beforeDismiss: () => this.ConfirmarCierre(), size: 'lg' });
			this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al abrir el modal de Equipos!', error, `${this.abrirModal.name}`);
		}
	}

	/**
	 * Confirmacion de cierre del modal
	 * @author Oscar-Ramirez
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
	 * @author Oscar-Ramirez
	 */
	validarDatosEntrada(): void {
		try {
			switch (this.accion) {
				case Accion.Adicion:
					this.modeloEquipo = new EquipoModel();
					break;
				case Accion.Edicion:
					this.modeloEquipo = this.datosEquipo;
					this.formularioEquipos.patchValue(this.datosEquipo);
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al validar los datos de entrada', error, `${this.validarDatosEntrada.name}`);
		}
	}

	/**
	 * Realiza el respectivo proceso dependiendo de la acción a realzar sea Adición o Edición
	 * @returns 
	 * @author Oscar-Ramirez
	 */
	guardar(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.validaFor = true;
				if (this.formularioEquipos.valid) {
					let modelo = new EquipoModel();
					modelo = this.formularioEquipos.value;
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
				this.funcionesGenerales.userExcepcion('Error al guardar los datos de la Equipo!', error, `${this.guardar.name}`);
			}
		});
	}

	/**
	 * Se realiza la creación de una Equipo
	 * @author Oscar-Ramirez
	 */
	crear(datosEquipo: EquipoModel): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Se realiza la petición al servicio de crear y se envia la info necesaria.
				const servicioAgregar = this.servicioEquipos.crear(datosEquipo).subscribe(
					(response: ResponseModel) => {
						// Se recibe la respuesta de la petición
						if (this.funcionesGenerales.responseValidator(response)) {
							if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
								/// Mostramos mensaje de exito, y enviamos la información recibida a 
								/// a la parte principal de los equipos.
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.modeloEquipo = response.datos;
								this.actualizar.emit({ datos: this.modeloEquipo, accion: Accion.Adicion });
								this.cerrarModal();
							}
						} else {
							this.funcionesGenerales.mensajeError('Error al intentar crear un equipo');
						}
						servicioAgregar.unsubscribe();
						resolve();
					}, error => {
						this.funcionesGenerales.userExcepcion('Error al crear el equipo', error, `${this.crear.name}`);
						servicioAgregar.unsubscribe();
						reject();
					}
				);
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al crear el equipo', error, `${this.crear.name}`);
				reject();
			}
		});
	}

	/**
	 * Se realiza la modificación de la equipo seleccionada
	 * @returns 
	 * @author Oscar-Ramirez
	 */
	modificar(datosEquipo: EquipoModel): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Se realiza la petición al servicio de modificar y se envia la info necesaria.
				const servicioModificar = this.servicioEquipos.modificar(this.datosEquipo.id, datosEquipo).subscribe(
					(response: ResponseModel) => {
						// Se recibe la respuesta de la petición
						if (this.funcionesGenerales.responseValidator(response)) {
							/// Mostramos mensaje de exito, y enviamos la información recibida a 
							/// a la parte principal de los equipos.
							this.funcionesGenerales.mensajeExito(response.mensaje);
							if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
								this.modeloEquipo = response.datos;
								this.actualizar.emit({ datos: this.modeloEquipo, accion: Accion.Edicion });
							}
						} else {
							this.funcionesGenerales.mensajeError('Error al intentar modificar el equipo!');
						}
						servicioModificar.unsubscribe();
						resolve();
					}, error => {
						this.funcionesGenerales.userExcepcion('Error al modificar el equipo', error, `${this.modificar.name}`);
						servicioModificar.unsubscribe();
						reject();
					}
				);
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al modificar el equipo', error, `${this.modificar.name}`);
				reject();
			}
		})
	}

	/**
	 * Se cierra modal de equipos
	   * @author Oscar-Ramirez
	 */
	async cerrarModal(): Promise<void> {
		try {
			this.modal?.close();
			this.formularioEquipos.reset();
			this.validaFor = false;
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
		}
	}
}
