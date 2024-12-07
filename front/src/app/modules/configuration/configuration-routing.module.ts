import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';
import { TiposUsuariosComponent } from './components/tipos-usuarios/tipos-usuarios.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

const routes: Routes = [
    {
        path: 'configuracion', component: LayoutComponent,
        children: [
            { 
                path: 'tiposUsuarios', component: TiposUsuariosComponent, data: { titulo: 'Tipos De Usuarios' } 
            },
            { 
                path: 'usuarios', component: UsuariosComponent, data: { titulo: 'Usuarios' } 
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
