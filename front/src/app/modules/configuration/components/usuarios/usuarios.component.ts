import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from '../../models/usuario.model';
import { Accion, Estados } from 'src/app/utils/enums';
import { funciones } from 'src/app/utils/funciones';
import { UsuariosService } from '../../services/usuarios.service';
import { ResponseModel } from 'src/app/models/response.model';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {

	listaUsuarios: Array<UsuarioModel> = new Array<UsuarioModel>();
	infoTmp: any = null;
	listamp: any = Array<any>();
	abrirModalUsuario: boolean = false;
	estados = Estados;
	listaEstados: Array<Estados> = new Array<Estados>();
	accion: Accion = Accion.Ninguno;
	funcionesGenerales = new funciones();
	modeloUsuario: UsuarioModel = new UsuarioModel();

	constructor(
		private servicioUsuarios : UsuariosService
	) { }

	ngOnInit(): void {
		this.obtener();
	}

	/**
	 * Se obtiene la lista de usuarios
	 * @author DLD
	 */
	obtener(): void {
		try {
			const servicio = this.servicioUsuarios.obtener().subscribe(
			(response: ResponseModel) => {
				if (this.funcionesGenerales.responseValidator(response)) {
					if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
						// obtencion de datos
						this.listaUsuarios = response.datos;
					} else {
						this.funcionesGenerales.mensajeAdvertencia('No se encontraron usuarios creadas!');
					}
				} else {
					this.funcionesGenerales.mensajeError('Error al intentar obtener las usuarios!');
				}
				servicio.unsubscribe();
			},
			error => {
				this.funcionesGenerales.userExcepcion('Error al obtener las usuarios', error, `${this.obtener.name}`);
				servicio.unsubscribe();
			});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener las usuarios! ', error, `${this.obtener.name}`);
		}
	}

	/**
	 * Se abre el modal de usuario
	 * @author DLD
	 */
	abrirModal(): void {
		this.accion = Accion.Adicion;
		this.abrirModalUsuario = true;
	}

	/**
	 * abre el modal y envia los datos del registro seleccionado al modal,
	 * para realizar la respectiva modificación
	 * @author DLD
	 */
	seleccionarUsuario(data: UsuarioModel): void {
		this.modeloUsuario = new UsuarioModel();
		if (this.funcionesGenerales.isDefinedAndNotEmpty(data)) {
			this.modeloUsuario = data;
			this.accion = Accion.Edicion;
			this.abrirModalUsuario = true;
		}
	}

	/**
	 * Se realiza la eliminación de una usuario
	 * @returns 
	 * @author DLD
	 */
	eliminar(datosUsuario: UsuarioModel): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const confirmar = await this.funcionesGenerales.confirmarMensaje('¿Seguro que desea eliminar el usuario?');
					if (confirmar) {
						const servicioEliminar = this.servicioUsuarios.eliminar(datosUsuario.id).subscribe(
						(response: ResponseModel) => {
							if (this.funcionesGenerales.responseValidator(response)) {
								this.funcionesGenerales.mensajeExito(response.mensaje);
								this.actualizarGrid({ datos: datosUsuario, accion: Accion.Eliminacion });
							} else {
								this.funcionesGenerales.mensajeError('Error al intentar eliminar la usuario!');
							}
							servicioEliminar.unsubscribe();
							resolve();
						}, error => {
							this.funcionesGenerales.userExcepcion('Error al eliminar el usuario', error, `${this.eliminar.name}`);
							servicioEliminar.unsubscribe();
							reject();
						});
					}
			} catch (error) {
				this.funcionesGenerales.userExcepcion('Error al eliminar el usuario', error, `${this.eliminar.name}`);
				reject();

			}
		})
	}

	/** 
	  * Actualizar la tabla de usuarios dependiendo de la acción que se este realizando
	  * @author DLD
	 */
	actualizarGrid(informacion: { datos: UsuarioModel, accion: Accion }): void {
		try {
			this.accion = informacion.accion;
			if (!this.funcionesGenerales.isDefinedAndNotEmpty(this.listaUsuarios)) {
				this.listaUsuarios = new Array<UsuarioModel>();
			}
			const index = this.listaUsuarios.findIndex(m => m.id === informacion.datos.id);
			switch (this.accion) {
				case Accion.Adicion:
					// Si se crea un registro en la bd, se agrega a la tabla visualmente.
					this.listaUsuarios.unshift(informacion.datos);
					break;
				case Accion.Edicion:
					// Si se modifica un registro en la bd, se elimina y se agrega a la tabla visualmente.
					if (index !== -1) {
						this.listaUsuarios.splice(index, 1);
						this.listaUsuarios.unshift(informacion.datos);
					}
					break;
				case Accion.Eliminacion:
					// Si se elimina un registro en la bd, se elimina de la tabla visualmente.
					if (index !== -1) {
						this.listaUsuarios.splice(index, 1);
					}
					break;
			}
		} catch (error) {
			this.funcionesGenerales.userExcepcion('Error al intentar actualizar la tabla de usuarios! ', error, `${this.actualizarGrid.name}`);
		}
	}
}
