import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const obtenerUsuarios = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = ' SELECT ' +
                                ' "CONF"."usuarios"."id" AS "id", ' +
                                ' "CONF"."usuarios"."id_empleado" AS "idEmpleado", ' +
                                ' "CONF"."usuarios"."id_tipo_usuario" AS "idTipoUsuario", ' +
                                ' "CONF"."usuarios"."nombre" AS "nombre", ' +
                                ' "CONF"."usuarios"."estado" AS "estado", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombreTipoUsuario", ' +
                                ' "GEN"."empleados"."nombre" AS "nombreEmpleado" ' +
                            ' FROM "CONF"."usuarios" ' +
                            ' LEFT JOIN "GEN".empleados ON "GEN".empleados.id =  "CONF".usuarios.id_empleado ' +
                            ' LEFT JOIN "CONF".tipo_usuarios ON "CONF".tipo_usuarios."id" = "CONF".usuarios.id_tipo_usuario ';
                                    
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'+ e});
    }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const consultaSql = ' SELECT ' +
                                ' "CONF"."usuarios"."id" AS "id", ' +
                                ' "CONF"."usuarios"."id_empleado" AS "idEmpleado", ' +
                                ' "CONF"."usuarios"."id_tipo_usuario" AS "idTipoUsuario", ' +
                                ' "CONF"."usuarios"."nombre" AS "nombre", ' +
                                ' "CONF"."usuarios"."estado" AS "estado", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombreTipoUsuario", ' +
                                ' "GEN"."empleados"."nombre" AS "nombreEmpleado" ' +
                            ' FROM "CONF"."usuarios" ' +
                            ' LEFT JOIN "GEN".empleados ON "GEN".empleados.id =  "CONF".usuarios.id_empleado ' +
                            ' LEFT JOIN "CONF".tipo_usuarios ON "CONF".tipo_usuarios."id" = "CONF".usuarios.id_tipo_usuario ' +
                            ' WHERE "CONF"."usuarios"."id" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [id]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD' + e});
    }
};

export const obtenerUsuarioPorNombre = async (req: Request, res: Response): Promise<Response> => {
    try {
        const nombre = req.params.nombre.toString();
        const consultaSql = ' SELECT ' +
                                ' "CONF"."usuarios"."id" AS "id", ' +
                                ' "CONF"."usuarios"."id_empleado" AS "idEmpleado", ' +
                                ' "CONF"."usuarios"."id_tipo_usuario" AS "idTipoUsuario", ' +
                                ' "CONF"."usuarios"."nombre" AS "nombre", ' +
                                ' "CONF"."usuarios"."estado" AS "estado", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombreTipoUsuario", ' +
                                ' "GEN"."empleados"."nombre" AS "nombreEmpleado" ' +
                            ' FROM "CONF"."usuarios" ' +
                            ' LEFT JOIN "GEN".empleados ON "GEN".empleados.id =  "CONF".usuarios.id_empleado ' +
                            ' LEFT JOIN "CONF".tipo_usuarios ON "CONF".tipo_usuarios."id" = "CONF".usuarios.id_tipo_usuario ' +
                            ' WHERE "CONF"."usuarios"."nombre" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [nombre]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD' + e});
    }
};

export const obtenerUsuarioPorEmpleado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const empleado = req.params.id;
        const consultaSql = ' SELECT ' +
                                ' "CONF"."usuarios"."id" AS "id", ' +
                                ' "CONF"."usuarios"."id_empleado" AS "idEmpleado", ' +
                                ' "CONF"."usuarios"."id_tipo_usuario" AS "idTipoUsuario", ' +
                                ' "CONF"."usuarios"."nombre" AS "nombre", ' +
                                ' "CONF"."usuarios"."estado" AS "estado", ' +
                                ' "CONF"."tipo_usuarios"."nombre" AS "nombreTipoUsuario", ' +
                                ' "GEN"."empleados"."nombre" AS "nombreEmpleado" ' +
                            ' FROM "CONF"."usuarios" ' +
                            ' LEFT JOIN "GEN".empleados ON "GEN".empleados.id =  "CONF".usuarios.id_empleado ' +
                            ' LEFT JOIN "CONF".tipo_usuarios ON "CONF".tipo_usuarios."id" = "CONF".usuarios.id_tipo_usuario ' +
                            ' WHERE "CONF"."usuarios"."id_empleado" = $1 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [empleado]);
        return res.status(200).json({datos: response.rows});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD' + e});
    }
};

export const crearUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {idEmpleado, idTipoUsuario, nombre, estado, fechaCreacion, usuarioCreacion} = req.body;
        // Se inserta una usuarios
        const consultaSql = ' INSERT INTO "CONF"."usuarios" ' +
                            ' (id_empleado, id_tipo_usuario, nombre, estado, fecha_creacion, usuario_creacion) VALUES ' +
                            ' ($1, $2, $3, $4, $5, $6) ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [idEmpleado, idTipoUsuario, nombre, estado, fechaCreacion, usuarioCreacion]);

        // Se obtiene el id maximo, para devolverlo en la respuesta de el registro creado
        const obtenerUltimoId = ' SELECT MAX(id) FROM "CONF"."usuarios" ';
        const responseId: QueryResult = await
        pool.query(obtenerUltimoId);

        const sqlObtenerInfoAdicional = ' SELECT ' + 
                                            ' "GEN"."empleados"."nombre" AS "nombreEmpleado",' +
                                            ' "CONF"."tipo_usuarios"."nombre"  AS "nombreTipoUsuario" ' +
                                        ' FROM "CONF"."usuarios" ' +
                                        ' LEFT JOIN "GEN"."empleados" ON "GEN"."empleados"."id" =  "CONF"."usuarios"."id_empleado" ' +
                                        ' LEFT JOIN "CONF"."tipo_usuarios" ON "CONF"."tipo_usuarios"."id" = "CONF"."usuarios"."id_tipo_usuario"' +
                                        ' WHERE "CONF"."usuarios"."id" = ' + responseId.rows[0].max;

        const responseDatosAd: QueryResult = await
        pool.query(sqlObtenerInfoAdicional);

        return res.json({
            mensaje: 'Usuario creado con exito!',
            datos: {
                id: responseId.rows[0].max,
                idEmpleado: idEmpleado,
                idTipoUsuario: idTipoUsuario,
                nombre: nombre,
                estado: estado,
                nombreEmpleado: responseDatosAd.rows[0]['nombreEmpleado'],
                nombreTipoUsuario: responseDatosAd.rows[0]['nombreTipoUsuario'],
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

export const modificarUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const {idEmpleado, idTipoUsuario, nombre, estado, fechaModificacion, usuarioModificacion} = req.body;

        const consultaSql = ' UPDATE "CONF"."usuarios" SET ' +
                                ' "id_tipo_usuario" = $1, ' +
                                ' "estado" = $2, ' +
                                ' "fecha_modificacion" = $3, ' +
                                ' "usuario_modificacion" = $4 ' +
                            ' WHERE "id" = $5 ';
        
        const response: QueryResult = await
        pool.query(consultaSql, [idTipoUsuario, estado, fechaModificacion, usuarioModificacion, id]);

        const sqlObtenerInfoAdicional = ' SELECT ' + 
                                            ' "GEN"."empleados"."nombre" AS "nombreEmpleado",' +
                                            ' "CONF"."tipo_usuarios"."nombre"  AS "nombreTipoUsuario" ' +
                                        ' FROM "CONF"."usuarios" ' +
                                        ' LEFT JOIN "GEN"."empleados" ON "GEN"."empleados"."id" =  "CONF"."usuarios"."id_empleado" ' +
                                        ' LEFT JOIN "CONF"."tipo_usuarios" ON "CONF"."tipo_usuarios"."id" = "CONF"."usuarios"."id_tipo_usuario"' +
                                        ' WHERE "CONF"."usuarios"."id" = ' + id;

        const responseDatosAd: QueryResult = await
        pool.query(sqlObtenerInfoAdicional);

        return res.json({
            mensaje: 'Usuario modificado con exito!',
            datos: {
                id,
                idEmpleado: idEmpleado,
                idTipoUsuario: idTipoUsuario,
                nombre: nombre,
                estado: estado,
                nombreEmpleado: responseDatosAd.rows[0]['nombreEmpleado'],
                nombreTipoUsuario: responseDatosAd.rows[0]['nombreTipoUsuario'],
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

export const eliminarUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        pool.query('DELETE FROM "CONF"."usuarios" WHERE "CONF"."usuarios"."id"= $1', [id]);
        return  res.json({mensaje: 'Usuario eliminado con exito!'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({mensaje: 'Internal Server error in BD'});
    }
};