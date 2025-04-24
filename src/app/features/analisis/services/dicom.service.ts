import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DicomPreviewData {
  preview_base64?: string;
  video_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DicomService {
  private serverUrl = 'http://192.168.18.127:5000';

  constructor(private http: HttpClient) {}

  getDicomPreview(
    studyUID: string,
    seriesUID: string
  ): Observable<DicomPreviewData> {
    const formattedStudyUID = studyUID.replace(/\./g, '_');
    const formattedSeriesUID = seriesUID.replace(/\./g, '_');

    return this.http.get<DicomPreviewData>(
      `${this.serverUrl}/api/dicoms-cloud/${formattedStudyUID}/${formattedSeriesUID}/preview`
    );
  }

  getFullDicomUrl(studyUID: string): string {
    return `${this.serverUrl}/acceso-estudio/${studyUID}`;
  }
}
