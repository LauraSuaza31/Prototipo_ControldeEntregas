export class MenusModel {
    id: number = 0;
    titulo: string = '';
    icono: string = '';
    url: string = '';
    tipoMenu: string = '';
    menuPadre: string = '';
    subMenu: Array<SubMenusModel>  = new Array<SubMenusModel>();
}

export class SubMenusModel {
    id: number = 0;
    titulo: string = '';
    icono: string = '';
    url: string = '';
    tipoMenu: string = '';
    menuPadre: string = '';
}