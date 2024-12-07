import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { AreaModel } from '../../models/area.model';
import { AreasService } from '../../services/areas.service';

@Component({
	selector: 'app-areas',
	templateUrl: './areas.component.html',
	providers: [
		AreasService
	]
})
export class AreasComponent implements OnInit {

	listaAreas: Array<AreaModel> = new Array<AreaModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirModalAreas: boolean = false;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloArea: AreaModel = new AreaModel();

	constructor(
		private servicioAreas : AreasService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de areas
	 * @author DLD
	 */
	obtener(): void {
		try {
			const servicio = this.servicioAreas.obtener().subscribe(
			(response: ResponseModel) => {
				if (this.funcionesGenerales.responseValidator(response)) {
					if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
						// obtencion de datos
						this.listaAreas = response.datos;
					} else {
						this.funcionesGenerales.mensajeAdvertencia('No se encontraron areas creadas!');
					}
				} else {
					this.funcionesGenerales.mensajeError('Error al intentar obtener las areas!');
				}
				servicio.unsubscribe();
			},
			error => {
				this.funcionesGenerales.userExcepcion('Error al obtener las areas', error, `${this.obtener.name}`);
				servicio.unsubscribe();
			});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener las areas! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de usuario
	 * @author DLD
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirModalAreas = true;
	}

	/**
	 * abre el modal y envia los datos del registro seleccionado al modal,
	 * para realizar la respectiva modificación
	 * @author DLD
	 */
	seleccionarArea(data: AreaModel): void {
		this.modeloArea = new AreaModel();
		if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
			this.modeloArea = data;
			this.accion = Accion.Edicion;
			this.abrirModalAreas = true;
		}
	}

	/**
	 * Se realiza la eliminación de una area
	 * @returns 
	 * @author DLD
	 */
	eliminar(datosArea: AreaModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar la area?');
					if (confirmar) {
						const servicioEliminar = this.servicioAreas.eliminar(datosArea.id).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosArea, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar la area!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar la tarea', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
					}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar la tarea', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de areas dependiendo de la acción que se este realizando
	  * @author DLD
	 */
	actualizarGrid(informacion: { datos: AreaModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaAreas)) {
				this.listaAreas = new Array<AreaModel>();
			}
			const index = this.listaAreas.findIndex(m => m.id === informacion.datos.id);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaAreas.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaAreas.splice(index, 1);
						this.listaAreas.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaAreas.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de areas! ', error, `${this.actualizarGrid.name}`);
		}
	}
}
