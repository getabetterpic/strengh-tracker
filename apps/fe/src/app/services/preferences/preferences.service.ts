import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WeightUnit } from '@strength-tracker/util';

export interface UserPreferences {
  weightUnit: WeightUnit;
}

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users/preferences';

  // Default to kg as that's what the app currently uses
  private preferencesSubject = new BehaviorSubject<UserPreferences>({
    weightUnit: WeightUnit.KG,
  });

  preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    // Try to load preferences from localStorage on init
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        this.preferencesSubject.next(preferences);
      } catch (e) {
        console.error('Error parsing saved preferences', e);
      }
    }
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(this.apiUrl, preferences).pipe(
      tap((updatedPreferences) => {
        // Merge with existing preferences
        const newPreferences = {
          ...this.preferencesSubject.value,
          ...updatedPreferences,
        };

        // Update the subject
        this.preferencesSubject.next(newPreferences);

        // Save to localStorage for persistence
        localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      })
    );
  }

  // Convenience method to get current preferences synchronously
  getCurrentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  // Convenience method to get current weight unit
  getWeightUnit(): WeightUnit {
    return this.preferencesSubject.value.weightUnit;
  }

  // Utility methods for weight conversion
  convertWeight(weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
    if (fromUnit === toUnit) {
      return weight;
    }

    if (fromUnit === WeightUnit.KG && toUnit === WeightUnit.LBS) {
      return weight * 2.20462; // kg to lbs
    } else {
      return weight / 2.20462; // lbs to kg
    }
  }

  // Format weight with the appropriate unit
  formatWeight(weight: number, unit?: WeightUnit): string {
    const displayUnit = unit || this.getWeightUnit();
    return `${weight.toFixed(1)} ${displayUnit}`;
  }
}
