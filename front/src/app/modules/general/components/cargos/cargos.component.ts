import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { CargoModel } from '../../models/cargo.model';
import { CargosService } from '../../services/cargos.service';

@Component({
	selector: 'app-cargos',
	templateUrl: './cargos.component.html',
	providers: [
		CargosService
	]
})
export class CargosComponent implements OnInit {

	listaCargos: Array<CargoModel> = new Array<CargoModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirModalCargos: boolean = false;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloCargo: CargoModel = new CargoModel();

	constructor(
		private servicioCargos: CargosService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de cargos
	 * @author angier
	 */
	obtener(): void {
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
				},
				error => {
					this.funcionesGenerales.userExcepcion('Error al obtener los cargos', error, `${this.obtener.name}`);
					servicio.unsubscribe();
				});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener los cargos! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de cargos
	 * @author angier
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirModalCargos = true;
	}

	/**
	 * abre el modal y envia los datos del registro seleccionado al modal,
	 * para realizar la respectiva modificación
	 * @author angier
	 */
	seleccionarCargo(data: CargoModel): void {
		this.modeloCargo = new CargoModel();
		if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
			this.modeloCargo = data;
			this.accion = Accion.Edicion;
			this.abrirModalCargos = true;
		}
	}

	/**
	 * Se realiza la eliminación de un cargo
	 * @returns 
	 * @author angier
	 */
	eliminar(datosCargo: CargoModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar el cargo?');
				if (confirmar) {
					const servicioEliminar = this.servicioCargos.eliminar(datosCargo.id).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosCargo, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar el cargo!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar el cargo', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
				}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar el cargo', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de cargos dependiendo de la acción que se este realizando
	  * @author angier
	 */
	actualizarGrid(informacion: { datos: CargoModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaCargos)) {
				this.listaCargos = new Array<CargoModel>();
			}
			const index = this.listaCargos.findIndex(m => m.id === informacion.datos.id);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaCargos.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaCargos.splice(index, 1);
						this.listaCargos.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaCargos.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de cargos! ', error, `${this.actualizarGrid.name}`);
		}
	}
}

