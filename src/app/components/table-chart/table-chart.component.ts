import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { User } from 'src/app/models/User.model';
import { WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { WeeklyBarChartComponent } from '../weekly-bar-chart/weekly-bar-chart.component';

@Component({
  standalone: true,
  selector: 'table-chart',
  template: `
  <th class="tw-px-2 tw-py-1 tw-text-center tw-font-bold tw-text-gray-700">{{ header }}</th>
  <td class="tw-text-center tw-font-bold tw-text-gray-700">{{ userStat.stat.daysOfWeek }}</td>
  `,
  imports: [CommonModule, MatTableModule, WeeklyBarChartComponent]
})
export class TableChartComponent {
  @Input() header: string;
  @Input() userStat: { user: User; stat: WeeklyCuratorStatistics };
}