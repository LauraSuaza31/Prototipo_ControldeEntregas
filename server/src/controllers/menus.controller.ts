import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerMenus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' + 
                                ' "CONF"."menus"."id" AS "id", ' +
                                ' "CONF"."menus"."nombre_menu" AS "titulo", ' +
                                ' "CONF"."menus"."icono" AS "icono", ' +
                                ' "CONF"."menus"."ruta" AS "url", ' +
                                ' "CONF"."menus"."menu_padre" AS "menuPadre", ' +
                                ' "CONF"."menus"."tipo_menu" AS "tipoMenu" ' +
                            ' FROM "CONF"."menus" ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};