import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const consultaSql = 'SELECT "GEN"."USUARIOS"."ID" AS "id", "GEN"."USUARIOS"."NOMBRE" AS "nombre" FROM "GEN"."USUARIOS"';
        const response: QueryResult = await
        pool.query(consultaSql);
        return res.status(200).json(response.rows);
    } catch (e) {
        console.log(e);
        return res.status(500).json('Internal Server error in BD');
    }
};



