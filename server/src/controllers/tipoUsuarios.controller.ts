import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerTipoUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "CONF"."tipo_usuarios"."id" AS "id", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombre" ' +
                            ' FROM "CONF"."tipo_usuarios" ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerTipoUsuarioPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'SELECT' +
                                ' "CONF"."tipo_usuarios"."id" AS "id", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombre", ' +
                            ' FROM "CONF"."tipo_usuarios" '+
                            ' WHERE "CONF"."tipo_usuarios"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearTipoUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {nombre} = req.body;
        // Se inserta una area
        const consultaSql =  ' INSERT INTO "CONF"."tipo_usuarios" ' +
                                ' (nombre) VALUES ' +
                                ' ($1) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "CONF"."tipo_usuarios" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        return res.json({
            mensaje: 'Tipo de usuario creado con exito!',
            datos: {
                id: responseId.rows[0].max,
                nombre: nombre,
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const modificarTipoUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {nombre} = req.body;

        const consultaSql = ' UPDATE "CONF"."tipo_usuarios" SET ' +
                                ' "nombre" = $1 ' +
                            ' WHERE "id" = $2 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, id]);
        return res.json({
            mensaje: 'Tipo de usuario modificado con exito!',
            datos: {
                id,
                nombre
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje:'Internal Server error in BD'});
    }
};

export const eliminarTipoUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        pool.query('DELETE FROM "CONF"."tipo_usuarios" WHERE "CONF"."tipo_usuarios"."id"= $1', [id]);
        return  res.json({mensaje: 'Tipo de usuario eliminado con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};