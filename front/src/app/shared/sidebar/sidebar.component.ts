import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenusModel, SubMenusModel } from 'src/app/models/menus.model';
import { ResponseModel } from 'src/app/models/response.model';
import { UsuarioModel } from 'src/app/modules/configuration/models/usuario.model';
import { SidebarService } from 'src/app/services/sidebar.service';
import { funciones } from 'src/app/utils/funciones';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

    menuItems?: any[];
    menus: Array<MenusModel> = new Array<MenusModel>();
    funcionesGenerales = new funciones();
    menu: MenusModel = new MenusModel();
    infoUsuarioSesion: UsuarioModel = new UsuarioModel();
    datosUsuario: UsuarioModel = new UsuarioModel();

    constructor(
        private sidebarService: SidebarService,
        private router: Router
    ) {
       
    }

    ngOnInit(): void {
        debugger;
        this.infoUsuarioSesion = JSON.parse(sessionStorage.getItem('datosUsuario')!);
        this.obtenerMenus();
    }

    /**
	 * Se obtiene la lista de menus
	 * @author DLD
	 */
	obtenerMenus(): void {
		try {
			const servicio = this.sidebarService.obtener().subscribe(
			(response: ResponseModel) => {
				if (this.funcionesGenerales.responseValidator(response)) {
					if (this.funcionesGenerales.isDefinedAndNotEmpty(response.datos)) {
						// obtencion de datos
                        response.datos.forEach((menu: MenusModel) => {
                            this.menu = new MenusModel();
                            if (parseInt(menu.tipoMenu) === 1) {
                                this.menu = menu;
                                this.menu.subMenu = new Array<SubMenusModel>();
                                this.menus.push(this.menu);
                            } else {
                                this.menu = this.menus.find(m => m.id === parseInt(menu.menuPadre))!;

                                if (this.funcionesGenerales.isDefinedAndNotEmpty(this.menu)) {
                                    this.menu?.subMenu.push(menu);
                                }
                            }
                        });
					} else {
						this.funcionesGenerales.mensajeAdvertencia('No se encontraron menus creadas!');
					}
				} else {
					this.funcionesGenerales.mensajeError('Error al intentar obtener los menus!');
				}
				servicio.unsubscribe();
			},
			error => {
				this.funcionesGenerales.userExcepcion('Error al obtener los menus', error, `${this.obtenerMenus.name}`);
				servicio.unsubscribe();
			});
		}
		catch (error) {
			this.funcionesGenerales.userExcepcion('Error al obtener los menus! ', error, `${this.obtenerMenus.name}`);
		}
	}
}
