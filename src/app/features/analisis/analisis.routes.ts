import { Routes } from '@angular/router';
import { DicomPageComponent } from './dicom-page/dicom-page.component';

export const ANALISIS_ROUTES: Routes = [
  // ... otras rutas existentes ...
  {
    path: 'dicom/:studyUID/:seriesUID',
    component: DicomPageComponent,
  },
  {
    path: 'dicom',
    component: DicomPageComponent,
  },
];
