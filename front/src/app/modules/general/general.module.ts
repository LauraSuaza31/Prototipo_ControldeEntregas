import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { DxDataGridModule, DxLookupModule } from 'devextreme-angular';
import { AreasComponent } from './components/areas/areas.component';
import { CargosComponent } from './components/cargos/cargos.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { EquiposComponent } from './components/equipos/equipos.component';
import { AsignacionEquiposComponent } from './components/asignacion-equipos/asignacion-equipos.component';
import { CapturaAreaComponent } from './components/areas/captura-area/captura-area.component';
import { CapturaAsignacionComponent } from './components/asignacion-equipos/captura-asignacion/captura-asignacion.component';
import { CapturaCargoComponent } from './components/cargos/captura-cargo/captura-cargo.component';
import { CapturaEmpleadoComponent } from './components/empleados/captura-empleado/captura-empleado.component';
import { CapturaEquipoComponent } from './components/equipos/captura-equipo/captura-equipo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        AreasComponent,
        CargosComponent,
        EmpleadosComponent,
        EquiposComponent,
        AsignacionEquiposComponent,
        CapturaAreaComponent,
        CapturaAsignacionComponent,
        CapturaCargoComponent,
        CapturaEmpleadoComponent,
        CapturaEquipoComponent
    ],
    imports: [
        CommonModule,
        GeneralRoutingModule,
        HttpClientModule,
        DxDataGridModule,
        NgbModule,
		ReactiveFormsModule,
        DxLookupModule
    ]
})
export class GeneralModule { }
