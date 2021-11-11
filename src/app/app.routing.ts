// Módulos de Router de Angular
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes pÃ¡ginas exclusivas
import { CotizarComponent } from './components/cotizar/cotizar.component';
import { ComparacionComponent } from './components/comparacion/comparacion.component';
import { RedirectComponent } from './components/redirect/redirect.component';

//Array de Rutas
const appRoutes: Routes = [
    {path: '', component: CotizarComponent},
    {path: 'cotizar', component: CotizarComponent},
    {path: 'comparar', component: ComparacionComponent},
    {path: 'redirect', component: RedirectComponent}
];

//Exportación de modelo de rutas
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes, {
    initialNavigation: 'enabled'
});
