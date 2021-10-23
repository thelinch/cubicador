import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { LoaderService } from "src/app/core/services/loader.service";
import { IngresoLote } from "src/app/models/IngresoLote";
import { LoteDetalleView } from "src/app/models/loteDetalle";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-lotes",
  templateUrl: "./lotes.component.html",
  styleUrls: ["./lotes.component.scss"],
})
export class LotesComponent implements OnInit {
  formularioIngresoLotes: FormGroup;
  isLoadingForms: Observable<boolean>;
  @ViewChild("editAndCreateIngresoLote")
  modalFormularioIngresoLotes: TemplateRef<any>;
  listaDeLotes: Array<IngresoLote>;
  ultimoIngresoLote: Partial<IngresoLote>;
  cargaListaLotes: boolean;
  formularioEdicionFactorProduccion: FormGroup;
  isLoading: Observable<boolean>;
  @ViewChild("editFactorProduccion")
  modalFormularioFactorProduccion: TemplateRef<any>;
  @ViewChild("listaProyLoteDetalle")
  modalListaProyLoteDetalle: TemplateRef<any>;
  @ViewChild("listaProyLoteDetalleConDatosReales")
  modalListaLoteDetalleReales: TemplateRef<any>;
  ingresoLoteSeleccionado: IngresoLote;
  listaLoteDetallePorIngresoLote: Array<LoteDetalleView>;
  mostrarCargaEdicionLoteDetalle: boolean;
  mostrarCargaProyeccion: boolean;
  listaProyLoteFila: Array<any> = [];
  cargaComparativo: boolean;
  cargaExportacionExcelDetalle: boolean;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private loadingService: LoaderService
  ) {
    this.isLoadingForms = loadingService.isLoading;
    this.listaDeLotes = [];
    this.ultimoIngresoLote = { nombreIngreso: "" };
    this.cargaListaLotes = true;
    this.isLoading = loadingService.isLoading;
    this.listaLoteDetallePorIngresoLote = [];
    this.mostrarCargaEdicionLoteDetalle = false;
    this.mostrarCargaProyeccion = false;
    this.cargaListaLotes = true;
    this.cargaComparativo = false;
    this.cargaExportacionExcelDetalle = false;
  }

  ngOnInit(): void {
    this.crearFormularioIngresoLotes();
    this.listarLotes();
    this.crearFormularioFactorProduccion();
    this.listarLotes();
    this.formularioEdicionFactorProduccion
      .get("genero")
      .valueChanges.pipe(filter((f) => f))
      .subscribe(async (genero: string) => {
        this.listaProyLoteFila = await this.http
          .get<Array<any>>(
            environment.apiUrl +
              "/proyLoteDetalle/listarSemanas/ingresoLote/" +
              this.ingresoLoteSeleccionado.idProyIngresoLote +
              "/tipoGenero/" +
              genero
          )
          .toPromise();
      });
    this.formularioEdicionFactorProduccion
      .get("semana")
      .valueChanges.subscribe((loteDetalle) => {
        if (loteDetalle) {
          this.formularioEdicionFactorProduccion.patchValue({
            id: loteDetalle.id,
            porcentajeHi: loteDetalle.porcentajeHi,
            porcentajePostura: loteDetalle.porcentajePostura,
            porcentajeNacimiento: loteDetalle.porcentajeNacimiento,
          });
        }
      });
  }
  async editarLoteDetalle(loteDetalle: any) {
    this.formularioEdicionFactorProduccion.markAllAsTouched();
    if (this.formularioEdicionFactorProduccion.invalid) {
      return;
    }
    await this.http
      .post(
        environment.apiUrl +
          "/proyLoteDetalle/editar/" +
          this.ingresoLoteSeleccionado.idProyIngresoLote,
        loteDetalle
      )
      .toPromise();
    this.modalService.dismissAll();
  }
  crearFormularioIngresoLotes() {
    this.formularioIngresoLotes = this.fb.group({
      idProyIngresoLote: [0],
      fechaIngreso: ["", [Validators.required]],
      poblacionLh: ["", [Validators.required, Validators.min(1)]],
      poblacionLm: ["", [Validators.required, Validators.min(1)]],
      semanasLevante: ["", [Validators.required, Validators.min(1)]],
      semanasProduccion: ["", [Validators.required, Validators.min(1)]],
    });
  }
  async traerUltimoIngresoLote() {
    const { numeroIngreso, fechaIngreso, loteInicial }: IngresoLote =
      await this.http
        .get<IngresoLote>(
          environment.apiUrl + "/proyIngresoLote/ultimoIngresoLote"
        )
        .toPromise();
    const ingresoLoteInicialCalculado =
      loteInicial == 0 ? loteInicial + 1 : loteInicial + 2;
    this.ultimoIngresoLote = {
      numeroIngreso: numeroIngreso + 1,
      loteInicial: ingresoLoteInicialCalculado,
      fechaIngreso: moment(fechaIngreso).add(91, "days").format("YYYY-MM-DD"),
      nombreIngreso: `${
        numeroIngreso + 1
      } ingreso LH-${ingresoLoteInicialCalculado}`,
    };
  }
  async nuevoIngresoLotes() {
    await this.traerUltimoIngresoLote();
    this.formularioIngresoLotes.reset({
      fechaIngreso:
        this.ultimoIngresoLote?.fechaIngreso || moment().format("YYYY-MM-DD"),
    });
    this.modalService
      .open(this.modalFormularioIngresoLotes)
      .dismissed.subscribe(() => {
        this.listarLotes();
      });
  }
  editarLote(lote: IngresoLote) {
    this.ultimoIngresoLote.nombreIngreso = lote.nombreIngreso;
    this.formularioIngresoLotes.patchValue(lote);
    this.modalService
      .open(this.modalFormularioIngresoLotes)
      .dismissed.subscribe(() => {
        this.listarLotes();
      });
  }
  async listarLotes() {
    this.cargaListaLotes = true;
    this.listaDeLotes = await this.http
      .get<Array<IngresoLote>>(environment.apiUrl + "/proyIngresoLote")
      .toPromise();
    this.cargaListaLotes = false;
  }
  async cerrarProyIngresoLote(proyIngresoLoteId: number) {
    await this.http
      .get(
        environment.apiUrl +
          "/proyIngresoLote/actualizar/" +
          proyIngresoLoteId +
          "/estado/1"
      )
      .toPromise();
    this.listarLotes();
  }
  async crearyEditaIngresoLotes(lote: IngresoLote) {
    this.formularioIngresoLotes.markAllAsTouched();
    if (this.formularioIngresoLotes.invalid) {
      return;
    }
    let url = environment.apiUrl + "/proyIngresoLote/";
    if (lote.idProyIngresoLote > 0) {
      url = url.concat("editar");
    }
    const data = await this.http.post(url, lote).toPromise();
    this.modalService.dismissAll();
  }
  get formularioIngresoLotesControles() {
    return this.formularioIngresoLotes.controls;
  }
  openModalFormularioEdicionFactorProduccion(ingresoLote: IngresoLote) {
    this.ingresoLoteSeleccionado = ingresoLote;
    this.formularioEdicionFactorProduccion.reset();
    this.listaProyLoteFila = [];
    this.modalService.open(this.modalFormularioFactorProduccion);
  }
  crearFormularioFactorProduccion() {
    this.formularioEdicionFactorProduccion = this.fb.group({
      id: [0],
      genero: [null, [Validators.required]],
      porcentajePostura: [null, [Validators.required]],
      porcentajeHi: [null, [Validators.required]],
      porcentajeNacimiento: [null, [Validators.required]],
      semana: [null, [Validators.required]],
    });
  }

  get formularioEdicionFactorProduccionControles() {
    return this.formularioEdicionFactorProduccion.controls;
  }
  async listarProyeccionDetalle(ingresoLote: IngresoLote) {
    this.ingresoLoteSeleccionado = ingresoLote;
    this.listaLoteDetallePorIngresoLote = await this.http
      .get<Array<LoteDetalleView>>(
        environment.apiUrl +
          "/proyLoteDetalle/listar/" +
          ingresoLote.idProyIngresoLote
      )
      .toPromise();
    this.modalService.open(this.modalListaProyLoteDetalle, { size: "xl" });
  }

  async generarComparativo(ingresoLote: IngresoLote) {
    this.cargaComparativo = true;
    this.ingresoLoteSeleccionado = ingresoLote;
    this.listaLoteDetallePorIngresoLote = await this.http
      .get<Array<LoteDetalleView>>(
        environment.apiUrl +
          "/proyIngresoLote/comparativo/" +
          ingresoLote.idProyIngresoLote
      )
      .toPromise();
    this.cargaComparativo = false;
    this.modalService.open(this.modalListaLoteDetalleReales, { size: "xl" });
  }
  async proyectar(ingresoLote: IngresoLote) {
    this.ingresoLoteSeleccionado = ingresoLote;
    this.mostrarCargaProyeccion = true;
    await this.http
      .post(environment.apiUrl + "/proyLoteDetalle/proyectar", ingresoLote)
      .toPromise();
    this.mostrarCargaProyeccion = false;
    this.listarLotes();
  }
  async exportarExcelLoteDetalle() {
    this.cargaExportacionExcelDetalle = true;
    const row = await this.http
      .get<any>(
        environment.apiUrl +
          "/proyLoteDetalle/listar/" +
          this.ingresoLoteSeleccionado.idProyIngresoLote +
          "/exportarExcel"
      )
      .toPromise();
    this.cargaExportacionExcelDetalle = false;
    window.open(row.rutaCompletaCM);
  }
  async exportarExcelLoteDetalleReales() {
    this.cargaExportacionExcelDetalle = true;
    const row = await this.http
      .get<any>(
        environment.apiUrl +
          "/proyLoteDetalle/listar/" +
          this.ingresoLoteSeleccionado.idProyIngresoLote +
          "/exportarExcelReal"
      )
      .toPromise();
    this.cargaExportacionExcelDetalle = false;
    window.open(row.rutaCompletaCM);
  }
}
