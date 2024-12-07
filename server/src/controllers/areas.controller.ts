import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerAreas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "GEN"."areas"."id" AS "id", ' +
                                ' "GEN"."areas"."nombre" AS "nombre", ' +
                                ' "GEN"."areas"."estado" AS "estado" ' +
                            ' FROM "GEN"."areas" ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerAreaPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'SELECT' +
                                ' "GEN"."areas"."id" AS "id", ' +
                                ' "GEN"."areas"."nombre" AS "nombre", ' +
                                ' "GEN"."areas"."estado" AS "estado" ' +
                            ' FROM "GEN"."areas" '+
                            ' WHERE "GEN"."areas"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {nombre, estado, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta una area
        const consultaSql =  ' INSERT INTO "GEN"."areas" ' +
                                ' (nombre, estado, fecha_creacion, usuario_creacion) VALUES ' +
                                ' ($1, $2, $3, $4) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, estado, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "GEN"."areas" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        return res.json({
            mensaje: 'Area creada con exito!',
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

export const modificarArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {nombre, estado, fechaModificacion, usuarioModificacion} = req.body;

        const consultaSql = ' UPDATE "GEN"."areas" SET ' +
                                ' "nombre" = $1, ' +
                                ' "estado" = $2, ' +
                                ' "fecha_modificacion" = $3, ' +
                                ' "usuario_modificacion" = $4 ' +
                            ' WHERE "id" = $5 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, estado, fechaModificacion, usuarioModificacion, id]);
        return res.json({
            mensaje: 'Area modificada con exito!',
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

export const eliminarArea = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        pool.query('DELETE FROM "GEN"."areas" WHERE "GEN"."areas"."id"= $1', [id]);
        return  res.json({mensaje: 'Area eliminada con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};