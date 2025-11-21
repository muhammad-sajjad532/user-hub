import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeeRecord {
  id: number;
  studentId: number;
  studentName: string;
  class: string;
  rollNumber: string;
  monthlyFee: number;
  totalPaid: number;
  totalPending: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  status: 'paid' | 'pending' | 'partial';
  dueDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  private apiUrl = 'http://localhost:3000/fees';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FeeRecord[]> {
    return this.http.get<FeeRecord[]>(this.apiUrl);
  }

  getById(id: number): Observable<FeeRecord> {
    return this.http.get<FeeRecord>(`${this.apiUrl}/${id}`);
  }

  create(record: Omit<FeeRecord, 'id'>): Observable<FeeRecord> {
    return this.http.post<FeeRecord>(this.apiUrl, record);
  }

  update(id: number, record: FeeRecord): Observable<FeeRecord> {
    return this.http.put<FeeRecord>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
