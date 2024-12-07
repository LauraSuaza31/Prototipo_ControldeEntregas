import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';
import { AreasComponent } from './components/areas/areas.component';
import { AsignacionEquiposComponent } from './components/asignacion-equipos/asignacion-equipos.component';
import { CargosComponent } from './components/cargos/cargos.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { EquiposComponent } from './components/equipos/equipos.component';

const routes: Routes = [
    {
        path: 'general',  component: LayoutComponent,
        children: [
            { 
                path: 'areas',  component: AreasComponent, data: { titulo: 'Areas' } 
            },
            { 
                path: 'cargos', component: CargosComponent, data: { titulo: 'Cargos' } 
            },
            { 
                path: 'equipos', component: EquiposComponent, data: { titulo: 'Equipos' } 
            },
            { 
                path: 'empleados', component: EmpleadosComponent, data: { titulo: 'Empleados' } 
            },
            { 
                path: 'asigEquipos',component: AsignacionEquiposComponent, data: { titulo: 'Asignación De Equipos' } 
            },
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class GeneralRoutingModule { }
