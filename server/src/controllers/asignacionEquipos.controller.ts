import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerAsignacionEquipos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "GEN"."asignacion_equipos"."id_asignacion" AS "idAsignacion", ' +
                                ' "GEN"."asignacion_equipos"."id_equipo" AS "idEquipo", ' +
                                ' "GEN"."asignacion_equipos"."id_empleado_recibe" AS "idEmpleadoRecibe", ' +
                                ' "GEN"."asignacion_equipos"."id_empleado_entrega" AS "idEmpleadoEntrega", ' +
                                ' "GEN"."asignacion_equipos"."fecha_entrega" AS "fechaEntrega", ' +
                                ' "GEN"."asignacion_equipos"."hora_entrega" AS "horaEntrega", ' +
                                ' "GEN"."equipos"."nombre" AS "nombreEquipo", ' +
                                ' empleados1."nombre" AS "nombreEmpleadoRecibe", ' +
                                ' empleados2."nombre" AS "nombreEmpleadoEntrega" ' +
                            ' FROM "GEN"."asignacion_equipos" ' +
                            ' LEFT JOIN "GEN".equipos ON "GEN".asignacion_equipos.id_equipo =  "GEN".equipos.id ' +
                            ' LEFT JOIN "GEN".empleados empleados1 ON "GEN".asignacion_equipos.id_empleado_recibe =  empleados1.id ' +
                            ' LEFT JOIN "GEN".empleados empleados2 ON "GEN".asignacion_equipos.id_empleado_entrega  =  empleados2.id ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerAsignacionEquiposPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = ' SELECT ' +
                                ' "GEN"."asignacion_equipos"."id_asignacion" AS "idAsignacion", ' +
                                ' "GEN"."asignacion_equipos"."id_equipo" AS "idEquipo", ' +
                                ' "GEN"."asignacion_equipos"."id_empleado_recibe" AS "idEmpleadoRecibe", ' +
                                ' "GEN"."asignacion_equipos"."id_empleado_entrega" AS "idEmpleadoEntrega", ' +
                                ' "GEN"."asignacion_equipos"."fecha_entrega" AS "fechaEntrega", ' +
                                ' "GEN"."asignacion_equipos"."hora_entrega" AS "horaEntrega", ' +
                                ' "GEN"."equipos"."nombre" AS "nombreEquipo", ' +
                                ' empleados1."nombre" AS "nombreEmpleadoRecibe", ' +
                                ' empleados2."nombre" AS "nombreEmpleadoEntrega" ' +
                            ' FROM "GEN"."asignacion_equipos" ' +
                            ' LEFT JOIN "GEN".equipos ON "GEN".asignacion_equipos.id_equipo =  "GEN".equipos.id ' +
                            ' LEFT JOIN "GEN".empleados empleados1 ON "GEN".asignacion_equipos.id_empleado_recibe =  empleados1.id ' +
                            ' LEFT JOIN "GEN".empleados empleados2 ON "GEN".asignacion_equipos.id_empleado_entrega  =  empleados2.id ' +
                            ' WHERE "GEN"."asignacion_equipos"."id_asignacion" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearAsignacionEquipos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {idEquipo, idEmpleadoRecibe, idEmpleadoEntrega, fechaEntrega, horaEntrega, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta un empleado
        const consultaSql =  ' INSERT INTO "GEN"."asignacion_equipos" ' +
                                ' (id_equipo, id_empleado_recibe, id_empleado_entrega, fecha_entrega, hora_entrega, fecha_creacion, usuario_creacion) VALUES ' +
                                ' ($1, $2, $3, $4, $5, $6, $7) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [idEquipo, idEmpleadoRecibe, idEmpleadoEntrega, fechaEntrega, horaEntrega, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id_asignacion) FROM "GEN"."asignacion_equipos" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        const sqlObtenerInfoAdicional = ' SELECT ' + 
                                            ' "GEN"."equipos"."nombre" AS "nombreEquipo", ' +
                                            ' empleados1."nombre" AS "nombreEmpleadoRecibe", ' +
                                            ' empleados2."nombre" AS "nombreEmpleadoEntrega" ' +
                                        ' FROM "GEN"."asignacion_equipos" '+
                                        ' LEFT JOIN "GEN".equipos ON "GEN".asignacion_equipos.id_equipo =  "GEN".equipos.id ' +
                                        ' LEFT JOIN "GEN".empleados empleados1 ON "GEN".asignacion_equipos.id_empleado_recibe =  empleados1.id ' +
                                        ' LEFT JOIN "GEN".empleados empleados2 ON "GEN".asignacion_equipos.id_empleado_entrega  =  empleados2.id ';

        const responseDatosAd: QueryResult = await
        pool.query(sqlObtenerInfoAdicional);

        return res.json({
            mensaje: 'Asignación creada con exito!',
            datos: {
                idAsignacion: responseId.rows[0].max,
                idEquipo: idEquipo,
                idEmpleadoRecibe: idEmpleadoRecibe,
                idEmpleadoEntrega: idEmpleadoEntrega,
                fechaEntrega: fechaEntrega,
                horaEntrega: horaEntrega,
                fechaCreacion: fechaCreacion,
                usuarioCreacion: usuarioCreacion,
                nombreEquipo: responseDatosAd.rows[0]['nombreEquipo'],
                nombreEmpleadoRecibe: responseDatosAd.rows[0]['nombreEmpleadoRecibe'],
                nombreEmpleadoEntrega: responseDatosAd.rows[0]['nombreEmpleadoEntrega']
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'+ e});
    }
};

export const eliminarAsignacionEquipos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'DELETE FROM "GEN"."asignacion_equipos" WHERE "GEN"."asignacion_equipos"."id_asignacion"= $1';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return  res.json({mensaje: 'Asignación eliminada con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'+ e});
    }
};