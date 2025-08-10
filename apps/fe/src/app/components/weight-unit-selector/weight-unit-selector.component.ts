import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService } from '../../services/preferences/preferences.service';
import { WeightUnit } from '@strength-tracker/util';

@Component({
  selector: 'app-weight-unit-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center space-x-2">
      <label for="weightUnit" class="text-sm font-medium text-gray-700">Weight Unit:</label>
      <select
        id="weightUnit"
        [(ngModel)]="selectedUnit"
        (change)="updateWeightUnit()"
        class="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
      >
        <option [value]="WeightUnit.KG">kg</option>
        <option [value]="WeightUnit.LBS">lbs</option>
      </select>
    </div>
  `,
})
export class WeightUnitSelectorComponent implements OnInit {
  private preferencesService = inject(PreferencesService);

  // Expose enum to template
  WeightUnit = WeightUnit;

  selectedUnit: WeightUnit = WeightUnit.KG;

  ngOnInit(): void {
    // Initialize with current preference
    this.selectedUnit = this.preferencesService.getWeightUnit();

    // Subscribe to preference changes
    this.preferencesService.preferences$.subscribe(prefs => {
      this.selectedUnit = prefs.weightUnit;
    });
  }

  updateWeightUnit(): void {
    this.preferencesService.updatePreferences({
      weightUnit: this.selectedUnit
    }).subscribe({
      error: (err) => console.error('Error updating weight unit preference', err)
    });
  }
}
