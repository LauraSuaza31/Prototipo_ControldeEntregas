import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { EquipoModel } from '../../models/equipo.model';
import { EquiposService } from '../../services/equipos.service';

@Component({
	selector: 'app-equipos',
	templateUrl: './equipos.component.html',
	providers: [
		EquiposService
	]
})
export class EquiposComponent implements OnInit {

	listaEquipos: Array<EquipoModel> = new Array<EquipoModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirModalEquipos: boolean = false;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloEquipo: EquipoModel = new EquipoModel();

	constructor(
		private servicioEquipos: EquiposService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de equipos
	 * @author Oscar-Ramirez
	 */
	obtener(): void {
		try {
			const servicio = this.servicioEquipos.obtener().subscribe(
				(response: ResponseModel) => {
					if (this.funcionesGenerales.responseValidator(response)) {
						if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
							// obtencion de datos
							this.listaEquipos = response.datos;
						} else {
							this.funcionesGenerales.mensajeAdvertencia('No se encontraron equipos creados!');
						}
					} else {
						this.funcionesGenerales.mensajeError('Error al intentar obtener los equipos!');
					}
					servicio.unsubscribe();
				},
				error => {
					this.funcionesGenerales.userExcepcion('Error al obtener los equipos', error, `${this.obtener.name}`);
					servicio.unsubscribe();
				});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener los equipos! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de equipos
	 * @author Oscar-Ramirez
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirModalEquipos = true;
	}

	/**
	 * abre el modal y envia los datos del registro seleccionado al modal,
	 * para realizar la respectiva modificación
	 * @author Oscar-Ramirez
	 */
	seleccionarEquipo(data: EquipoModel): void {
		this.modeloEquipo = new EquipoModel();
		if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
			this.modeloEquipo = data;
			this.accion = Accion.Edicion;
			this.abrirModalEquipos = true;
		}
	}

	/**
	 * Se realiza la eliminación de un equipo
	 * @returns 
	 * @author Oscar-Ramirez
	 */
	eliminar(datosEquipo: EquipoModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar el equipo?');
				if (confirmar) {
					const servicioEliminar = this.servicioEquipos.eliminar(datosEquipo.id).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosEquipo, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar el equipo!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar el equipo', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
				}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar el equipo', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de equipos dependiendo de la acción que se este realizando
	  * @author Oscar-Ramirez
	 */
	actualizarGrid(informacion: { datos: EquipoModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaEquipos)) {
				this.listaEquipos = new Array<EquipoModel>();
			}
			const index = this.listaEquipos.findIndex(m => m.id === informacion.datos.id);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaEquipos.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaEquipos.splice(index, 1);
						this.listaEquipos.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaEquipos.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de equipos! ', error, `${this.actualizarGrid.name}`);
		}
	}
}
