"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const Port = 3000;
app.get('/user', (_req, res) => {
    console.log('puerto ' + Port);
    res.send('user');
});
app.listen(Port, () => {
    console.log('Corre en puerto ' + Port);
});
