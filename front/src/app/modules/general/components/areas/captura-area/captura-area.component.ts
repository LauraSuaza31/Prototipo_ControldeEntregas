import { EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { AreaModel } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';

@Component({
    selector: 'app-captura-area',
    templateUrl: './captura-area.component.html',
	providers: [AreasService]
})
export class CapturaAreaComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild("modalAreas") modalAreas?: NgbModalRef;
	
	modal!: NgbModalRef;
	validaFor: boolean = false;
	// (!) Es una forma de decirle al compilador explícitamente que una expresión tiene un valor distinto de nulo o indefinido
	formularioAreas!: FormGroup;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	funcionesGenerales = new funciones(); 
	modeloArea: AreaModel = new AreaModel();
	accionARealizar = Accion;

	@Input() datosArea: AreaModel = new AreaModel();
	@Input() accion: Accion = Accion.Ninguno;
	@Input()
	get visible(): boolean { return false; }
	set visible(value: boolean) {
		if (value) {
			this.abrirModal();
		}
	}
	@Output() visibleChange = new EventEmitter();
	@Output() actualizar = new EventEmitter<{ datos: AreaModel, accion: Accion }>();
	@Output() limpiarDatos = new EventEmitter();

	constructor(
		private modalService: NgbModal,
		private creadorFormulario: FormBuilder,
		private servicioAreas : AreasService
	) { 
		this.inicializarFormulario();
	}
	
	/**
	 * se ejecuta cada que se cambian los datos del input datosArea
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

	ngOnInit(): void {
		this.listaEstados = this.funcionesGenerales.enumToArray(this.estados);
	}

	ngOnDestroy(): void {
		this.datosArea = new AreaModel();
		this.validaFor = false;
		this.listaEstados = new Array<Estados>();
		this.modeloArea = new AreaModel();
		this.accion = Accion.Ninguno;
	}

	/**
	 * Se inicializa el formulario con su respectivas validaciones
	 * @author DLD
	 */
	inicializarFormulario(): void {
		try {
			this.formularioAreas = this.creadorFormulario.group({
				nombre: [null, [Validators.maxLength(20), Validators.required]],
				estado: [0, [Validators.required]]
			})
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al inicilizar el formulario de areas!', error, `${this.inicializarFormulario.name}`);
		}
	}

	/**
	 * Se abre el modal de usuarios
	 * @author DLD
	 */
	abrirModal(): void {
		try {
			this.modal = this.modalService.open(this.modalAreas, { beforeDismiss: () => this.ConfirmarCierre() , size: 'lg' });
			this.modal.result.then(() => { this.visibleChange.emit(false); }).catch(() => { this.visibleChange.emit(false); });
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al abrir el modal de areas!', error, `${this.abrirModal.name}`);
		}
	}

	/**
	 * Confirmacion de cierre del modal
	 * @author DLD
	 */
	async ConfirmarCierre(): Promise<boolean> {
		let conf: boolean;
		try {
			conf =  await this.funcionesGenerales.confirmarMensaje('Esta seguro de descartar los cambios?');
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
					this.modeloArea = new AreaModel();
					break;
				case Accion.Edicion:
					this.modeloArea = this.datosArea;
					this.formularioAreas.patchValue(this.datosArea);
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al validar los datos de entrada', error, `${this.validarDatosEntrada.name}`);
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
				if (this.formularioAreas.valid) {
					let modelo = new AreaModel();
					modelo = this.formularioAreas.value;
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
				this.funcionesGenerales.userExcepcion('Error al guardar los datos de la area!', error, `${this.guardar.name}`);
			}
		});
	}

	/**
	 * Se realiza la creación de una area
	 * @author DLD}
	 */
	crear(datosArea: AreaModel): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Se realiza la petición al servicio de crear y se envia la info necesaria.
				const servicioAgregar = this.servicioAreas.crear(datosArea).subscribe(
					(response: ResponseModel) => {
						// Se recibe la respuesta de la petición
						if  (this.funcionesGenerales.responseValidator(response)) {
							if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
								/// Mostramos mensaje de exito, y enviamos la información recibida a 
								/// a la parte principal de las areas.
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.modeloArea = response.datos;
								this.actualizar.emit({ datos: this.modeloArea, accion: Accion.Adicion });
								this.cerrarModal();
							} 
						} else {
							this.funcionesGenerales.mensajeError('Error al intentar crear una area');
						}
						servicioAgregar.unsubscribe();
						resolve();
					}, error => {
						this.funcionesGenerales.userExcepcion('Error al crear la area', error, `${this.crear.name}`);
						servicioAgregar.unsubscribe();
						reject();
					}
				);
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al crear la area', error, `${this.crear.name}`);
				reject();
			}
		});
	}

	/**
	 * Se realiza la modificación de la area seleccionada
	 * @returns 
	 * @author DLD
	 */
	modificar(datosArea: AreaModel): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Se realiza la petición al servicio de modificar y se envia la info necesaria.
				const servicioModificar = this.servicioAreas.modificar(this.datosArea.id, datosArea).subscribe(
					(response: ResponseModel) => {
						// Se recibe la respuesta de la petición
						if (this.funcionesGenerales.responseValidator(response)) {
							/// Mostramos mensaje de exito, y enviamos la información recibida a 
							/// a la parte principal de las areas.
							this.funcionesGenerales.mensajeExito(response.mensaje);
							if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
								this.modeloArea = response.datos;
								this.actualizar.emit({ datos: this.modeloArea, accion: Accion.Edicion });
							}
						} else {
							this.funcionesGenerales.mensajeError('Error al intentar modificar la area!');
						}
						servicioModificar.unsubscribe();
						resolve();
					}, error => {
						this.funcionesGenerales.userExcepcion('Error al modificar la area', error, `${this.modificar.name}`);
						servicioModificar.unsubscribe();
						reject();
					}
				);
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al modificar la area', error, `${this.modificar.name}`);
				reject();
			}
		})
	}

	/**
	 * Se cierra modal de areas
     * @author DLD
	 */
	async cerrarModal(): Promise<void> {
		try {
			this.modal?.close();
			this.formularioAreas.reset();
			this.validaFor = false;
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al cerrar el modal', error, `${this.cerrarModal.name}`);
		}
	}
}
