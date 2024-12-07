import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { AsignacionEquiposModel } from '../../models/asignacionEquipos.model';
import { AsignacionEquiposService } from '../../services/asignacion-equipos.service';

@Component({
	selector: 'app-asignacion-equipos',
	templateUrl: './asignacion-equipos.component.html',
	providers: [
		AsignacionEquiposService
	]
})

export class AsignacionEquiposComponent implements OnInit {

	listaAsignacionEquipos: Array<AsignacionEquiposModel> = new Array<AsignacionEquiposModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirmodalAsignacionEquipos: boolean = false;
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloAsignacionEquipo: AsignacionEquiposModel = new AsignacionEquiposModel();

	constructor(
		private servicioAsignacionEquipos: AsignacionEquiposService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de asignación
	 * @author angier
	 */
	obtener(): void {
		try {
			const servicio = this.servicioAsignacionEquipos.obtener().subscribe(
				(response: ResponseModel) => {
					if (this.funcionesGenerales.responseValidator(response)) {
						if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
							// obtencion de datos
							this.listaAsignacionEquipos = response.datos;
						} else {
							this.funcionesGenerales.mensajeAdvertencia('No se encontraron asignación creados!');
						}
					} else {
						this.funcionesGenerales.mensajeError('Error al intentar obtener las asignación!');
					}
					servicio.unsubscribe();
				},
				error => {
					this.funcionesGenerales.userExcepcion('Error al obtener las asignaciones', error, `${this.obtener.name}`);
					servicio.unsubscribe();
				});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener las asignaciones! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de asignación
	 * @author angier
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirmodalAsignacionEquipos = true;
	}

	/**
	 * Se realiza la eliminación de una asignación
	 * @returns 
	 * @author angier
	 */
	eliminar(datosAsignacionEquipo: AsignacionEquiposModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar la asignación?');
				if (confirmar) {
					const servicioEliminar = this.servicioAsignacionEquipos.eliminar(datosAsignacionEquipo.idAsignacion).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosAsignacionEquipo, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar la asignación!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar la asignación', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
				}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar la asignación', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de empleados dependiendo de la acción que se este realizando
	  * @author DLD
	 */
	actualizarGrid(informacion: { datos: AsignacionEquiposModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaAsignacionEquipos)) {
				this.listaAsignacionEquipos = new Array<AsignacionEquiposModel>();
			}
			const index = this.listaAsignacionEquipos.findIndex(m => m.idAsignacion === informacion.datos.idAsignacion);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaAsignacionEquipos.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaAsignacionEquipos.splice(index, 1);
						this.listaAsignacionEquipos.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaAsignacionEquipos.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de asignaciones! ', error, `${this.actualizarGrid.name}`);
		}
	}
}