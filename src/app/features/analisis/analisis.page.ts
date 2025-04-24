import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  ActionSheetController,
  ToastController,
  NavController,
} from '@ionic/angular/standalone';
import { CommonModule, DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  shareOutline,
  downloadOutline,
  documentOutline,
  imageOutline,
  filmOutline,
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { jsPDF } from 'jspdf';

import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-analisis',
  templateUrl: 'analisis.page.html',
  styleUrls: ['analisis.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
  ],
})
export class AnalisisPage {
  imagenUrl: string = './assets/00001.jpg'; // Ruta actualizada a la imagen
  nombrePaciente: string = 'Juan Pérez García'; // Nombre del paciente (ejemplo)
  tipoEstudio: string = 'Radiografía de Tórax'; // Tipo de estudio (ejemplo)
  fechaEstudio: Date = new Date(); // Fecha del estudio (actual por defecto)

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {
    addIcons({
      arrowBack,
      shareOutline,
      downloadOutline,
      documentOutline,
      imageOutline,
      filmOutline,
    });
  }

  async compartir() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Compartir como',
      buttons: [
        {
          text: 'JPG',
          icon: 'image-outline',
          handler: () => {
            this.compartirFormato('jpg');
          },
        },
        {
          text: 'PDF',
          icon: 'document-outline',
          handler: () => {
            this.compartirFormato('pdf');
          },
        },
        {
          text: 'DICOM',
          icon: 'document-outline',
          handler: () => {
            this.compartirFormato('dicom');
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async compartirFormato(formato: string) {
    try {
      // Primero generamos el archivo según el formato
      let archivoBase64 = '';
      let nombreArchivo = '';
      let tipoArchivo = '';

      switch (formato) {
        case 'jpg':
          // Convertir la imagen a base64
          archivoBase64 = await this.convertirImagenABase64(this.imagenUrl);
          nombreArchivo = 'imagen_medica.jpg';
          tipoArchivo = 'image/jpeg';
          break;
        case 'pdf':
          // Generar PDF y compartir
          archivoBase64 = await this.generarPDF();
          nombreArchivo = 'imagen_medica.pdf';
          tipoArchivo = 'application/pdf';
          break;
        case 'dicom':
          // En un caso real, aquí convertiríamos a DICOM
          // Por ahora, mostraremos un mensaje
          this.mostrarMensaje('Formato DICOM en desarrollo');
          return;
      }

      // Guardar el archivo temporalmente
      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: archivoBase64.split(',')[1], // Eliminar el prefijo data:application/...;base64,
        directory: Directory.Cache,
        recursive: true,
      });

      // Compartir el archivo guardado
      await Share.share({
        title: 'Imagen Médica',
        text: 'Compartiendo imagen médica en formato ' + formato.toUpperCase(),
        files: [resultado.uri], // Usar el URI del archivo guardado
        dialogTitle: 'Compartir con',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      this.mostrarMensaje('Error al compartir: ' + error);
    }
  }

  async convertirImagenABase64(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Importante para imágenes de otros dominios

      img.onload = () => {
        // Crear un canvas para dibujar la imagen
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibujar la imagen en el canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Convertir a base64
          const dataURL = canvas.toDataURL('image/jpeg', 0.95);
          resolve(dataURL);
        } else {
          reject('No se pudo crear el contexto del canvas');
        }
      };

      img.onerror = (error) => {
        reject('Error al cargar la imagen: ' + error);
      };

      // Si la URL es relativa, convertirla a absoluta
      if (url.startsWith('assets/')) {
        img.src = window.location.origin + '/' + url;
      } else {
        img.src = url;
      }
    });
  }

  async descargar() {
    try {
      // Generar PDF
      const pdfBase64 = await this.generarPDF();

      // Nombre del archivo con timestamp para evitar sobrescrituras
      const timestamp = new Date().getTime();
      const nombreArchivo = `imagen_medica_${timestamp}.pdf`;

      // En Android, guardar en la carpeta de descargas pública
      let resultado: { uri: string };

      if (Capacitor.getPlatform() === 'android') {
        // En Android, intentamos guardar directamente en la carpeta de descargas
        resultado = await Filesystem.writeFile({
          path: `Download/${nombreArchivo}`,
          data: pdfBase64.split(',')[1],
          directory: Directory.ExternalStorage,
          recursive: true,
        });
      } else {
        // En otros sistemas, usamos el directorio de documentos
        resultado = await Filesystem.writeFile({
          path: nombreArchivo,
          data: pdfBase64.split(',')[1],
          directory: Directory.Documents,
          recursive: true,
        });
      }

      // Mostrar mensaje con más información
      this.mostrarMensajeConAccion(
        `PDF guardado en Descargas/${nombreArchivo}`,
        'Ver archivo',
        async () => {
          // Intentar abrir el archivo
          try {
            await FileOpener.open({
              filePath: resultado.uri,
              contentType: 'application/pdf',
            });
          } catch (e) {
            console.error('Error al abrir el archivo:', e);
            this.mostrarMensaje(
              'No se pudo abrir el archivo. Búscalo en tus descargas.'
            );
          }
        }
      );
    } catch (error) {
      console.error('Error al descargar:', error);
      this.mostrarMensaje('Error al descargar: ' + error);
    }
  }

  // Nuevo método para mostrar un mensaje con acción
  async mostrarMensajeConAccion(
    mensaje: string,
    textoBoton: string,
    accion: () => void
  ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 5000,
      position: 'bottom',
      buttons: [
        {
          text: textoBoton,
          role: 'info',
          handler: () => {
            accion();
          },
        },
      ],
    });
    await toast.present();
  }

  async generarPDF(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF();

      // Cargar la imagen
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Importante para imágenes de otros dominios
      img.onload = () => {
        // Añadir información del paciente
        pdf.setFontSize(16);
        pdf.setTextColor(56, 128, 255); // Color azul similar al de Ionic
        pdf.text('Informe Médico', 10, 10);

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0); // Color negro para el texto normal
        pdf.text(`Paciente: ${this.nombrePaciente}`, 10, 20);
        pdf.text(`Estudio: ${this.tipoEstudio}`, 10, 30);
        pdf.text(`Fecha: ${this.fechaEstudio.toLocaleDateString()}`, 10, 40);

        // Calcular dimensiones para ajustar la imagen al PDF
        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const imgHeight = (img.height * imgWidth) / img.width;

        // Añadir la imagen al PDF (ajustando la posición Y para dejar espacio al encabezado)
        pdf.addImage(img, 'JPEG', 10, 50, imgWidth, imgHeight);

        // Convertir a base64
        const pdfBase64 = pdf.output('datauristring');
        resolve(pdfBase64);
      };

      img.onerror = (error) => {
        reject('Error al cargar la imagen: ' + error);
      };

      // Si la URL es relativa, convertirla a absoluta
      if (this.imagenUrl.startsWith('assets/')) {
        img.src = window.location.origin + '/' + this.imagenUrl;
      } else {
        img.src = this.imagenUrl;
      }
    });
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
