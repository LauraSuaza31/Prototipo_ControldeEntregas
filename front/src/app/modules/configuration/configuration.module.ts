import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { TiposUsuariosComponent } from './components/tipos-usuarios/tipos-usuarios.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { CapturaTipoUsuarioComponent } from './components/tipos-usuarios/captura-tipo-usuario/captura-tipo-usuario.component';
import { CapturaUsuariosComponent } from './components/usuarios/captura-usuarios/captura-usuarios.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DevExtremeModule } from 'devextreme-angular';

@NgModule({
    declarations: [
        TiposUsuariosComponent,
        UsuariosComponent,
        CapturaTipoUsuarioComponent,
        CapturaUsuariosComponent
    ],
    imports: [
        CommonModule,
        ConfigurationRoutingModule,
        ReactiveFormsModule,
        DevExtremeModule
    ]
})
export class ConfigurationModule { }
