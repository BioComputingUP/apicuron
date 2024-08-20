import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { User } from 'src/app/models/User.model';
import { BaseCuratorStatistics } from 'src/app/models/statistics.model';

@Component({
  standalone: true,
  selector: 'table-last-date',
  template: `
  <th class="tw-px-2 tw-py-1 tw-text-center tw-font-bold tw-text-gray-700">{{ header }}</th>
  <td class="tw-text-center tw-font-bold tw-text-gray-700">{{ userStat.stat.last_contribution }}</td>
  `,
  imports: [CommonModule, MatTableModule]
})
export class TableLastDateComponent {
  @Input() header: string;
  @Input() userStat: { user: User; stat: BaseCuratorStatistics };
}