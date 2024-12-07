import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/modules/configuration/services/usuarios.service';
import { funciones } from 'src/app/utils/funciones';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    formularioLogin!: FormGroup;
    funcionesGenerales = new funciones();

    constructor(
        private creadorFormulario: FormBuilder,
		private servicioUsuarios : UsuariosService,
        private router: Router
    ) {
        this.inicializarLogin();
    }

    ngOnInit(): void {
    }

    /**
     * Se inicializa el formulario de el login
     * @author DLD
     */
    inicializarLogin(): void {
        try {
            this.formularioLogin = this.creadorFormulario.group({
                usuario: [null, [Validators.required]]
            })
        } catch (error) {
            this.funcionesGenerales.userExcepcion('Error al inicializar el formulario del login!', error, `${this.inicializarLogin.name}`);
        }
    }

    /**
     * Se ingresa a la app de control de equipos con el usuario
     * @author DLD
     */
    ingresar(): Promise<void> {
		return new Promise(async (resolve, reject) => {
            try {
                if (this.formularioLogin.valid) {
                    const servicioObtener = await this.servicioUsuarios.obtenerPorNombre(this.formularioLogin.controls['usuario'].value).subscribe(
                        async (responseObtener) => {
                            debugger;
                            if (this.funcionesGenerales.isDefinedAndNotEmpty(responseObtener.datos[0])) {
                                // Se ingresa a la app
                                sessionStorage.setItem('datosUsuario', JSON.stringify(responseObtener.datos[0]));
                                this.router.navigateByUrl('/dashboard');
                            } else {
                                servicioObtener.unsubscribe();
                                this.funcionesGenerales.mensajeAdvertencia('El usuario con el que se está intentando ingresar no existe');
                            }
                            resolve()
                        }, error => {
                            this.funcionesGenerales.userExcepcion('Error al iniciar sesión', error, `${this.ingresar.name}`);
                            servicioObtener.unsubscribe();
                            reject();
                        }
                    );
                }   
            } catch (error) {
                this.funcionesGenerales.userExcepcion('Error al iniciar sesión!', error, `${this.ingresar.name}`);
            }
        });
    }

}
