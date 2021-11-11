import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MarcaService } from './datos-auto/marca.service';

import { anioInterfaz, anios } from './model/anios-modelos';
import { formularioCotizar, marcas, modelos } from './model/formulario-cotizar';
import { CotizaOfertaService } from './services/cotiza-oferta.service';
import { ModeloService } from './services/modelo.service';
import { PersonasService } from './services/personas.service';
import { TokenService } from './services/token.service';
import { finalize } from 'rxjs/operators';
import { config } from './config';
import { Persona } from './model/Persona';

@Component({
  selector: 'app-cotizar',
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css', '../../../styles.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CotizarComponent implements OnInit {
  // variables
  loader:boolean          = false;
  maskPatente = "AAAA 00";

  formCotizar: formularioCotizar={
    patente:              null,
    vehiculoNuevo:        false,
    marca:                null,
    modelo:               null,
    anio:                 null,
    edadConductor:        "no",
    usoVehiculo:          "no",
    propietarioVehiculo:  "no",
    kilomentrosMes:       "1",
    semana:               "1",
    deducible:            "1"
  }

  // datos - selectores - arreglos de datos ------------------>
  aniosList:anioInterfaz[] = anios;
  marcas:marcas[]           = [];
  modelos:modelos[]         = [];

  // persona datos posts -------------------------------------->
  name:string           = "John Doe";
  phone:string          = "+56 9 1234 5678";
  mail:string           = "cotizante@mail.com";
  rut:string            = "17853395"; //"74387235";
  dv:string             = "9"; //"5";

  constructor(
    private tokenService: TokenService,
    private marcasService: MarcaService,
    private modeloService:  ModeloService,
    private cotizaOferta: CotizaOfertaService,
    private personaService: PersonasService,
    private router:Router
  ){}

  ngOnInit(): void {
    this.loader = true;
    this.aniosList = this.aniosList;
    // consulta inicial de marcas.
    this.marcasService.getMarcas()
    .subscribe(
      data=>{
        this.marcas = data
        this.loader = false;
      },
      error=>{
        console.log("se produjo error");
        this.loader = false;
      }
    );
  }


  onChangeMarca(){
    this.loader = true;
    this.modeloService.getModelos(this.formCotizar.marca)
    .pipe(finalize(()=>{this.loader = false}))
    .subscribe(
      data=>{
        this.modelos = data;
      },
      error=> {
        console.log(error)
      }
    )
  }

  showData(){
    let body = {
      "DatosTransaccion": {
        "Contrasena": "2",
        "Usuario": "990170002@JooycarMensual.cl"
      },
      "CotizacionOferta": {
        "DatosBase": {
          "Asegurado": {
            "Rut":                      "17853395-9",
            "Nombres":                  "Gustavo Beltran",
            "ApellidoPaterno":          "string",
            "ApellidoMaterno":          "string",
            "FechaNacimiento":          "1991-09-30",
            "TipoPersona":              "Natural",
            "RazonSocial":              "Sin Razon social",
            "CodigoComuna":             305
          },
          "DeclaraConductorMenor30Anios":   (this.formCotizar.edadConductor === 'si') ? true:false,
          "FormaPago":                      "OneClick",
          "RecargoDescuento":               "NoAplicar",
          "ValorRecargoDescuento":          "0,00"
        },
        "DatosBien": {
          "CodigoMarca":                this.formCotizar.marca,
          "CodigoModelo":               this.formCotizar.modelo,
          "Anio":                       this.formCotizar.anio,
          "UsoBien": "Particular",
          "Patente":                    this.formCotizar.patente,
          "Nuevo":                      this.formCotizar.vehiculoNuevo
        },
        "Opcionales": {
          "AutoReemplazo":              "CincoDias",
          "Taller":                     "SinOpcional",
          "RCExceso":                   "SinOpcional",
          "Asistencias":                "SinOpcional"
        }
      }
    };
    console.log(body);
    console.log(this.formCotizar);
  }

  onSubmit(){
    this.loader = true;
    let seguro = this.getSeguroByOptions();
    
    // consulto token
    let token:string;
    this.tokenService.setHeader("Content-Type", "application/json");

    // this.tokenService.getToken('Alma',"FhP+U3P88m75kUKIRYWv25qnMoVe6+nA3YeKQkIOPMc=")
    this.tokenService.getToken()
    .subscribe(
      responseToken =>{
        token = responseToken.data;
        
        // consulto persona - ASEGURADO
        // console.log(this.rut,this.dv);
        this.personaService.getPersona(this.rut,this.dv)
        .subscribe(
          responsePersona=>{
            // console.log(responsePersona);
            // envio formulario de cotizacion.
            this.cotizaOferta.setHeader("Ocp-Apim-Subscription-Key","a98a6b9e16614ae899e3d0d11088f661");
            this.cotizaOferta.setHeader("Authorization",token);
            this.cotizaOferta.setHeader("Content-Type","application/json");

            
            this.cotizaOferta.getInfoBySeguro(seguro,responsePersona,this.formCotizar)
            .pipe(finalize( ()=> this.loader = false ))
            .subscribe(
            // console.log(JSON.stringify(body));
            // this.cotizaOferta.postCotizar(url,body)
              response=>{
                let dataCotiza = {
                  'persona': responsePersona,
                  'ofertas': response.ReturnData.Ofertas,
                  'formCotizar' : this.formCotizar
                }
                // seteo data en localStorage
                localStorage.setItem("dataCotiza",JSON.stringify(dataCotiza));

                this.router.navigate(['/comparar']);
              },
              error=>{
                console.log(error)
              }
            );
          },
          error=>{
            console.log(error);
          }
        )
      },
      error =>{
        console.log(error)
      }
    );
  }

  obtenerToken(){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Ocp-Apim-Subscription-Key", "a98a6b9e16614ae899e3d0d11088f661");

    var raw = JSON.stringify({
      "nombreUsuario": "Alma",
      "clave": "FhP+U3P88m75kUKIRYWv25qnMoVe6+nA3YeKQkIOPMc="
    });

    fetch("https://apim-segurossura-dev.azure-api.net/tokensura/ObtenerToken",{
    // fetch("https://apim-segurossura-dev.azure-api.net/tokensura/ObtenerToken",{
    // fetch("https://test.segurossura.cl/TokenSura/api/ObtenerToken", {

      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
    .then(response => response.json())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  }

  solicitarCotizacion(){
    var myHeaders = new Headers();
    myHeaders.append("Ocp-Apim-Subscription-Key", "0d89d8b994da46e391af84031a36d9d2");
    myHeaders.append("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFsbWEiLCJuYmYiOjE2MzQyNzYzNzAsImV4cCI6MTYzNDI3ODE3MCwiaWF0IjoxNjM0Mjc2MzcwLCJpc3MiOiJodHRwczovL3Rlc3Quc2VndXJvc3N1cmEuY2wiLCJhdWQiOiJodHRwczovL3Rlc3Quc2VndXJvc3N1cmEuY2wifQ.53_qRDNFLjiU2Afw-Op-eWxZ_ituEl6zqn3gxOlDiLQ");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "DatosTransaccion": {
        "Contrasena": "2",
        "Usuario": "990170002@JooycarMensual.cl"
      },
      "CotizacionOferta": {
        "DatosBase": {
          "Asegurado": {
            "Rut": "17853395-9",
            "Nombres": "Gustavo Beltran",
            "ApellidoPaterno": "string",
            "ApellidoMaterno": "string",
            "FechaNacimiento": "1991-09-30",
            "TipoPersona": "Natural",
            "RazonSocial": "Sin Razon social",
            "CodigoComuna": 305
          },
          "DeclaraConductorMenor30Anios": false,
          "FormaPago": "OneClick",
          "RecargoDescuento": "NoAplicar",
          "ValorRecargoDescuento": "0,00"
        },
        "DatosBien": {
          "CodigoMarca": 10,
          "CodigoModelo": 396,
          "Anio": 2013,
          "UsoBien": "Particular",
          "Patente": "FBLP16",
          "Nuevo": false
        },
        "Opcionales": {
          "AutoReemplazo": "CincoDias",
          "Taller": "SinOpcional",
          "RCExceso": "SinOpcional",
          "Asistencias": "SinOpcional"
        }
      }
    });

    fetch("https://apim-segurossura-dev.azure-api.net/autoclick-km/api/CotizaOferta", {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
      .then(response => response.json())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  getSeguroByOptions(){
    // AutoFlexible
    if(this.formCotizar.kilomentrosMes == "1" && this.formCotizar.semana == "1"){
      return "AutoFlexible";
    }

    if(this.formCotizar.kilomentrosMes == "1" && this.formCotizar.semana == "2"){
      return "AutoFlexible";
    }

    if(this.formCotizar.kilomentrosMes == "1" && this.formCotizar.semana == "3"){
      return "Seguro x KM";
    }

    if(this.formCotizar.kilomentrosMes == "1" && this.formCotizar.semana == "4"){
      return "Seguro x KM";
    }

    if(this.formCotizar.kilomentrosMes == "2" && this.formCotizar.semana == "1"){
      return "Conductor Pro";
    }

    if(this.formCotizar.kilomentrosMes == "2" && this.formCotizar.semana == "2"){
      return "Conductor Pro";
    }

    if(this.formCotizar.kilomentrosMes == "2" && this.formCotizar.semana == "3"){
      return "AutoFlexible";
    }

    if(this.formCotizar.kilomentrosMes == "2" && this.formCotizar.semana == "4"){
      return "AutoFlexible";
    }

    if(this.formCotizar.kilomentrosMes == "3" && this.formCotizar.semana == "1"){
      return "Conductor Pro";
    }

    if(this.formCotizar.kilomentrosMes == "3" && this.formCotizar.semana == "2"){
      return "Conductor Pro";
    }

    if(this.formCotizar.kilomentrosMes == "3" && this.formCotizar.semana == "3"){
      return "AutoFlexible";
    }

    if(this.formCotizar.kilomentrosMes == "3" && this.formCotizar.semana == "4"){
      return "AutoFlexible";
    }
    return "";
  }


}
