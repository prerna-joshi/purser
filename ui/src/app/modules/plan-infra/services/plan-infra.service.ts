import { Injectable } from '@angular/core';
import { BACKEND_URL } from '../../../app.component'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PlanInfraService {


  fileUploadUrl = "/api/clouds/infrastructurePlanning";

  constructor(private http: HttpClient) {}
  
   postFile(fileToUpload: File): Observable<any> {
    const endpoint = this.fileUploadUrl;
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    return this.http.post(endpoint, formData);
}
}