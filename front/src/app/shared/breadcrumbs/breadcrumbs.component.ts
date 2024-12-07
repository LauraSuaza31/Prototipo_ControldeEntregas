import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

    titulo?: string;
    tituloSubs$: Subscription;

    constructor(
        private router: Router
    ) {
        this.tituloSubs$ = this.getArgumentos().subscribe(({ titulo }) => {
            this.titulo = titulo;
            document.title = `${titulo}`;
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.tituloSubs$.unsubscribe();
    }

    getArgumentos() {
        return this.router.events.pipe(
            filter((evento: any) => evento instanceof ActivationEnd),
            filter((evento: ActivationEnd) => evento.snapshot.firstChild === null),
            map((evento: ActivationEnd) => evento.snapshot.data)
        );
    }
}
