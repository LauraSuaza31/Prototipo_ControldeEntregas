import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerEmpleados = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "GEN"."empleados"."id" AS "id", ' +
                                ' "GEN"."empleados"."identificacion" AS "identificacion", ' +
                                ' "GEN"."empleados"."nombre" AS "nombre", ' +
                                ' "GEN"."empleados"."apellido" AS "apellido", ' +
                                ' "GEN"."empleados"."genero" AS "genero", ' +
                                ' "GEN"."empleados"."id_cargo" AS "idCargo", ' +
                                ' "GEN"."empleados"."id_area" AS "idArea", ' +
                                ' "GEN"."empleados"."estado" AS "estado", ' +
                                ' "GEN"."areas"."nombre" AS "nombreArea",' +
	                            ' "GEN"."cargos"."nombre"  AS "nombreCargo" ' +
                            ' FROM "GEN"."empleados" '+
                            ' LEFT JOIN "GEN".areas ON "GEN".empleados.id_area =  "GEN".areas.id ' +
                            ' LEFT JOIN "GEN".cargos ON "GEN".empleados.id_cargo =  "GEN".cargos.id ';
        
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const obtenerEmpleadoPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = 'SELECT' +
                                ' "GEN"."empleados"."id" AS "id", ' +
                                ' "GEN"."empleados"."identificacion" AS "identificacion", ' +
                                ' "GEN"."empleados"."nombre" AS "nombre", ' +
                                ' "GEN"."empleados"."apellido" AS "apellido", ' +
                                ' "GEN"."empleados"."genero" AS "genero", ' +
                                ' "GEN"."empleados"."id_cargo" AS "idCargo", ' +
                                ' "GEN"."empleados"."id_area" AS "idArea", ' +
                                ' "GEN"."empleados"."estado" AS "estado", ' +
                                ' "GEN"."areas"."nombre" AS "nombreArea",' +
	                            ' "GEN"."cargos"."nombre"  AS "nombreCargo" ' +
                            ' FROM "GEN"."empleados" '+
                            ' LEFT JOIN "GEN".areas ON "GEN".empleados.id_area =  "GEN".areas.id ' +
                            ' LEFT JOIN "GEN".cargos ON "GEN".empleados.id_cargo =  "GEN".cargos.id ' +
                            ' WHERE "GEN"."empleados"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const crearEmpleado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {identificacion, nombre, apellido, genero, idCargo, idArea, estado, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta un empleado
        const consultaSql =  ' INSERT INTO "GEN"."empleados" ' +
                                ' (identificacion, nombre, apellido, genero, id_cargo, id_area, estado, fecha_creacion, usuario_creacion) VALUES ' +
                                ' ($1, $2, $3, $4, $5, $6, $7, $8, $9) '
        
        const response: QueryResult = await
        pool.query(consultaSql, [identificacion, nombre, apellido, genero, idCargo, idArea, estado, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "GEN"."empleados" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        const sqlObtenerInfoAdicional = ' SELECT ' + 
	                                    ' "GEN"."areas"."nombre" AS "nombreArea",' +
                                        ' "GEN"."cargos"."nombre" AS "nombreCargo" ' +
                                    ' FROM "GEN"."empleados" ' +
                                    ' LEFT JOIN "GEN"."areas" on "GEN"."empleados"."id_area" =  "GEN"."areas"."id" ' +
                                    ' LEFT JOIN "GEN"."cargos" on "GEN"."empleados"."id_cargo" =  "GEN"."cargos"."id" ';

        const responseDatosAd: QueryResult = await
        pool.query(sqlObtenerInfoAdicional);

        return res.json({
            mensaje: 'Empleado creado con exito!',
            datos: {
                id: responseId.rows[0].max,
                identificacion: identificacion,
                nombre: nombre,
                apellido: apellido,
                genero: genero,
                id_cargo: idCargo,
                id_area: idArea,
                estado: estado,
                fechaCreacion: fechaCreacion,
                usuarioCreacion: usuarioCreacion,
                nombreArea: responseDatosAd.rows[0]['nombreArea'],
                nombreCargo: responseDatosAd.rows[0]['nombreCargo']
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};

export const modificarEmpleado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {identificacion, nombre, apellido, genero, idCargo, idArea, estado, fechaModificacion, usuarioModificacion} = req.body;

        const consultaSql = ' UPDATE "GEN"."empleados" SET ' +
                                ' "nombre" = $1, ' +
                                ' "apellido" = $2, ' +
                                ' "genero" = $3, ' +
                                ' "id_cargo" = $4, ' +
                                ' "id_area" = $5, ' +
                                ' "estado" = $6, ' +
                                ' "fecha_modificacion" = $7, ' +
                                ' "usuario_modificacion" = $8 ' +
                            ' WHERE "id" = $9 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre, apellido, genero, idCargo, idArea, estado, fechaModificacion, usuarioModificacion, id]);

        const sqlObtenerInfoAdicional = ' SELECT ' + 
	                                    ' "GEN"."areas"."nombre" AS "nombreArea",' +
                                        ' "GEN"."cargos"."nombre" AS "nombreCargo" ' +
                                    ' FROM "GEN"."empleados" ' +
                                    ' LEFT JOIN "GEN"."areas" on "GEN"."empleados"."id_area" =  "GEN"."areas"."id" ' +
                                    ' LEFT JOIN "GEN"."cargos" on "GEN"."empleados"."id_cargo" =  "GEN"."cargos"."id" ';

        const responseDatosAd: QueryResult = await
        pool.query(sqlObtenerInfoAdicional);

        return res.json({
            mensaje: 'Empleado modificado con exito!',
            datos: {
                id,
                identificacion,
                nombre,
                apellido,
                genero,
                idCargo,
                idArea,
                estado,
                fechaModificacion,
                usuarioModificacion,
                nombreArea: responseDatosAd.rows[0]['nombreArea'],
                nombreCargo: responseDatosAd.rows[0]['nombreCargo']
            },
            estado: 200
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje:'Internal Server error in BD'});
    }
};

export const eliminarEmpleado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);

        const consultaSql = 'DELETE FROM "GEN"."empleados" WHERE "GEN"."empleados"."id"= $1';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return  res.json({mensaje: 'Empleado eliminado con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};