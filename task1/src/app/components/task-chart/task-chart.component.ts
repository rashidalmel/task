import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Task } from '../../models/task.model';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-task-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './task-chart.component.html'
})
export class TaskChartComponent implements OnInit, OnChanges {
  @Input() tasks: Task[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  statusChartOptions: Highcharts.Options = {};
  priorityChartOptions: Highcharts.Options = {};

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.updateCharts();
    
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe((theme: string) => {
      this.updateChartTheme(theme === 'dark');
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks']) {
      this.updateCharts();
    }
  }

  private updateCharts() {
    this.updateStatusChart();
    this.updatePriorityChart();
  }

  private updateStatusChart() {
    const stats = this.calculateTaskStats();
    const isDark = this.themeService.getCurrentTheme() === 'dark';
    
    this.statusChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: undefined,
        height: null,
        spacing: [10, 10, 10, 10]
      },
      credits:{
        enabled: false
      },
      title: {
        text: 'Task Statistics',
        style: {
          color: isDark ? '#e2e8f0' : '#333333',
          fontSize: '18px',
          fontWeight: '600'
        }
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b><br/>Count: <b>{point.y}</b>',
        backgroundColor: isDark ? '#4a5568' : '#ffffff',
        borderColor: isDark ? '#718096' : '#e1e5e9'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          },
          showInLegend: true
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
          color: isDark ? '#e2e8f0' : '#333333'
        }
      },
      series: [{
        name: 'Tasks',
        type: 'pie',
        data: [
          {
            name: 'Completed',
            y: stats.completed,
            color: '#28a745'
          },
          {
            name: 'Pending',
            y: stats.pending,
            color: '#667eea'
          },
          {
            name: 'Overdue',
            y: stats.overdue,
            color: '#dc3545'
          },
          {
            name: 'Archived',
            y: stats.archived,
            color: '#6c757d'
          }
        ].filter(item => item.y > 0) // Only show categories with tasks
      }]
    };
  }

  private updatePriorityChart() {
    const stats = this.calculatePriorityStats();
    const isDark = this.themeService.getCurrentTheme() === 'dark';
    
    this.priorityChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: undefined,
        height: null,
        spacing: [10, 10, 10, 10]
      },
      credits:{
        enabled: false
      },
      title: {
        text: 'Priority Distribution',
        style: {
          color: isDark ? '#e2e8f0' : '#333333',
          fontSize: '18px',
          fontWeight: '600'
        }
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b><br/>Count: <b>{point.y}</b>',
        backgroundColor: isDark ? '#4a5568' : '#ffffff',
        borderColor: isDark ? '#718096' : '#e1e5e9'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          },
          showInLegend: true,
          innerSize: '40%'
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
          color: isDark ? '#e2e8f0' : '#333333'
        }
      },
      series: [{
        name: 'Priority',
        type: 'pie',
        data: [
          {
            name: 'High',
            y: stats.high,
            color: '#dc3545'
          },
          {
            name: 'Medium',
            y: stats.medium,
            color: '#ffc107'
          },
          {
            name: 'Low',
            y: stats.low,
            color: '#28a745'
          }
        ].filter(item => item.y > 0)
      }]
    };
  }

  private updateChartTheme(isDark: boolean) {
    // Rebuild the entire chart options to avoid type issues
    this.updateCharts();
  }

  private calculateTaskStats() {
    const stats = {
      completed: 0,
      pending: 0,
      overdue: 0,
      archived: 0
    };

    this.tasks.forEach(task => {
      if (task.archived) {
        stats.archived++;
      } else if (task.completed) {
        stats.completed++;
      } else if (this.isOverdue(task)) {
        stats.overdue++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  }

  private calculatePriorityStats() {
    const stats = {
      high: 0,
      medium: 0,
      low: 0
    };

    // Only count non-archived tasks for priority stats
    this.tasks.forEach(task => {
      if (!task.archived) {
        const priority = task.priority || 'Medium';
        switch (priority) {
          case 'High':
            stats.high++;
            break;
          case 'Medium':
            stats.medium++;
            break;
          case 'Low':
            stats.low++;
            break;
        }
      }
    });

    return stats;
  }

  private isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
}
