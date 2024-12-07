import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerEquipos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "GEN"."equipos"."id" AS "id", ' +
                                ' "GEN"."equipos"."id_serial" AS "idSerial", ' +
                                ' "GEN"."equipos"."nombre" AS "nombre", ' +
                                ' "GEN"."equipos"."estado" AS "estado" ' +
                            ' FROM "GEN"."equipos" ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerEquipoPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'SELECT' +
                                ' "GEN"."equipos"."id" AS "id", ' +
                                ' "GEN"."equipos"."id_serial" AS "idSerial", ' +
                                ' "GEN"."equipos"."nombre" AS "nombre", ' +
                                ' "GEN"."equipos"."estado" AS "estado" ' +
                            ' FROM "GEN"."equipos" '+
                            ' WHERE "GEN"."equipos"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearEquipo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {idSerial, nombre, estado, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta una area
        const consultaSql =  ' INSERT INTO "GEN"."equipos" ' +
                                ' (id_serial, nombre, estado, fecha_creacion, usuario_creacion) VALUES ' +
                                ' ($1, $2, $3, $4, $5) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [idSerial, nombre, estado, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "GEN"."equipos" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        return res.json({
            mensaje: 'Equipo creado con exito!',
            datos: {
                id: responseId.rows[0].max,
                idSerial: idSerial,
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

export const modificarEquipo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {idSerial, nombre, estado, fechaModificacion, usuarioModificacion} = req.body;

        const consultaSql = ' UPDATE "GEN"."equipos" SET ' +
                                ' "id_serial" = $1, ' +
                                ' "nombre" = $2, ' +
                                ' "estado" = $3, ' +
                                ' "fecha_modificacion" = $4, ' +
                                ' "usuario_modificacion" = $5 ' +
                            ' WHERE "id" = $6 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [idSerial, nombre, estado, fechaModificacion, usuarioModificacion, id]);
        return res.json({
            mensaje: 'Equipo modificado con exito!',
            datos: {
                id,
                idSerial,
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

export const eliminarEquipo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        pool.query('DELETE FROM "GEN"."equipos" WHERE "GEN"."equipos"."id"= $1', [id]);
        return  res.json({mensaje: 'Equipo eliminado con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};