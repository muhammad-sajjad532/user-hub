import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceRecord {
  id: number;
  date: string;
  studentId: number;
  studentName: string;
  class: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  remarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/attendance';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(this.apiUrl);
  }

  getById(id: number): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.apiUrl}/${id}`);
  }

  create(record: Omit<AttendanceRecord, 'id'>): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(this.apiUrl, record);
  }

  update(id: number, record: AttendanceRecord): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
