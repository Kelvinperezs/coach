import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CotizarComponent } from './cotizar.component';
import { DatosAutoModule } from './datos-auto/datos-auto.module';
import { VariablesAutoModule } from './variables-auto/variables-auto.module';
import { EnviaDatosModule } from './envia-datos/envia-datos.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { NgSelectModule } from '@ng-select/ng-select';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    CotizarComponent
  ],
  imports: [
    CommonModule,
    DatosAutoModule,
    VariablesAutoModule,
    EnviaDatosModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgSelectModule
  ],
  exports: [CotizarComponent]
})
export class CotizarModule { }
