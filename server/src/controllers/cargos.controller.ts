import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerCargos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "GEN"."cargos"."id" AS "id", ' +
                                ' "GEN"."cargos"."nombre" AS "nombre", ' +
                                ' "GEN"."cargos"."estado" AS "estado" ' +
                            ' FROM "GEN"."cargos" ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerCargoPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'SELECT' +
                                ' "GEN"."cargos"."id" AS "id", ' +
                                ' "GEN"."cargos"."nombre" AS "nombre", ' +
                                ' "GEN"."cargos"."estado" AS "estado" ' +
                            ' FROM "GEN"."cargos" '+
                            ' WHERE "GEN"."cargos"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearCargo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {nombre, estado, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta un cargo
        const consultaSql =  ' INSERT INTO "GEN"."cargos" ' +
                                ' (nombre, estado, fecha_creacion, usuario_creacion) VALUES ' +
                                ' ($1, $2, $3, $4) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, estado, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "GEN"."cargos" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        return res.json({
            mensaje: 'Cargo creado con exito!',
            datos: {
                id: responseId.rows[0].max,
                nombre: nombre,
                estado: estado,
                fechaCreacion: fechaCreacion,
                usuarioCreacion: usuarioCreacion
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const modificarCargo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {nombre, estado, fechaModificacion, usuarioModificacion} = req.body;

        const consultaSql = ' UPDATE "GEN"."cargos" SET ' +
                                ' "nombre" = $1, ' +
                                ' "estado" = $2, ' +
                                ' "fecha_modificacion" = $3, ' +
                                ' "usuario_modificacion" = $4 ' +
                            ' WHERE "id" = $5 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, estado, fechaModificacion, usuarioModificacion, id]);
        return res.json({
            mensaje: 'Cargo modificado con exito!',
            datos: {
                id,
                nombre,
                estado,
                fechaModificacion,
                usuarioModificacion
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje:'Internal Server error in BD'});
    }
};

export const eliminarCargo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);

        const consultaSql = 'DELETE FROM "GEN"."cargos" WHERE "GEN"."cargos"."id"= $1';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return  res.json({mensaje: 'Cargo eliminado con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};