import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/app/models/response.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { EmpleadoModel } from '../../models/empleado.model';
import { EmpleadosService } from '../../services/empleados.service';


@Component({
	selector: 'app-empleados',
	templateUrl: './empleados.component.html',
	providers: [
		EmpleadosService
	]
})
export class EmpleadosComponent implements OnInit {

	listaEmpleados: Array<EmpleadoModel> = new Array<EmpleadoModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirModalEmpleados: boolean = false;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloEmpleado: EmpleadoModel = new EmpleadoModel();

	constructor(
		private servicioEmpleados: EmpleadosService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de empleados
	 * @author angier
	 */
	obtener(): void {
		try {
			const servicio = this.servicioEmpleados.obtener().subscribe(
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
				},
				error => {
					this.funcionesGenerales.userExcepcion('Error al obtener los empleados', error, `${this.obtener.name}`);
					servicio.unsubscribe();
				});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener los empleados! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de empleado
	 * @author angier
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirModalEmpleados = true;
	}

	/**
	 * abre el modal y envia los datos del registro seleccionado al modal,
	 * para realizar la respectiva modificación
	 * @author angier
	 */
	seleccionarEmpleado(data: EmpleadoModel): void {
		this.modeloEmpleado = new EmpleadoModel();
		if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
			this.modeloEmpleado = data;
			this.accion = Accion.Edicion;
			this.abrirModalEmpleados = true;
		}
	}

	/**
	 * Se realiza la eliminación de un empleado
	 * @returns 
	 * @author angier
	 */
	eliminar(datosEmpleado: EmpleadoModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar el empleado?');
				if (confirmar) {
					const servicioEliminar = this.servicioEmpleados.eliminar(datosEmpleado.id).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosEmpleado, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar el empleado!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar el empleado', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
				}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar el empleado', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de empleados dependiendo de la acción que se este realizando
	  * @author DLD
	 */
	actualizarGrid(informacion: { datos: EmpleadoModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaEmpleados)) {
				this.listaEmpleados = new Array<EmpleadoModel>();
			}
			const index = this.listaEmpleados.findIndex(m => m.id === informacion.datos.id);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaEmpleados.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaEmpleados.splice(index, 1);
						this.listaEmpleados.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaEmpleados.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de empleados! ', error, `${this.actualizarGrid.name}`);
		}
	}
}