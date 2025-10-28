// Simple mock data service that simulates realtime updates via subscriptions.
// Consumers can subscribe to metrics, timeseries, and alerts streams.

export type Metrics = {
  cpu: number; // %
  memory: number; // %
  requestsPerSec: number; // rps
  errorsPerMin: number; // epm
  deltas: { cpu: number; memory: number; rps: number; epm: number };
};

export type Point = { t: number; v: number };
export type Alert = { id: string; timestamp: number; severity: 'low' | 'medium' | 'high'; message: string };

export type Unsubscribe = () => void;

type Listener<T> = (value: T) => void;

class DataService {
  private metricListeners = new Set<Listener<Metrics>>();
  private seriesListeners = new Set<Listener<Point[]>>();
  private alertListeners = new Set<Listener<Alert[]>>();

  private series: Point[] = [];
  private alerts: Alert[] = [];
  private metrics: Metrics = {
    cpu: 10,
    memory: 30,
    requestsPerSec: 50,
    errorsPerMin: 1,
    deltas: { cpu: 0, memory: 0, rps: 0, epm: 0 },
  };

  private timer?: number;

  start() {
    if (this.timer) return;
    // Produce a new data point every second
    this.timer = window.setInterval(() => {
      const now = Date.now();

      // Random walk for metrics
      const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

      const prev = { ...this.metrics };
      this.metrics.cpu = clamp(this.metrics.cpu + (Math.random() * 10 - 5), 0, 100);
      this.metrics.memory = clamp(this.metrics.memory + (Math.random() * 6 - 3), 0, 100);
      this.metrics.requestsPerSec = clamp(this.metrics.requestsPerSec + (Math.random() * 20 - 10), 0, 200);
      this.metrics.errorsPerMin = clamp(this.metrics.errorsPerMin + (Math.random() * 2 - 1), 0, 20);

      this.metrics.deltas = {
        cpu: ((this.metrics.cpu - prev.cpu) / (prev.cpu || 1)) * 100,
        memory: ((this.metrics.memory - prev.memory) / (prev.memory || 1)) * 100,
        rps: ((this.metrics.requestsPerSec - prev.requestsPerSec) / (prev.requestsPerSec || 1)) * 100,
        epm: ((this.metrics.errorsPerMin - prev.errorsPerMin) / (prev.errorsPerMin || 1)) * 100,
      };

      // Update series (value based on cpu with noise)
      const v = clamp(this.metrics.cpu + Math.random() * 10 - 5, 0, 100);
      this.series = [...this.series.slice(-59), { t: now, v }]; // keep last 60s

      // Random alert (10% chance)
      if (Math.random() < 0.1) {
        const sev = Math.random() < 0.1 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low';
        this.alerts = [
          { id: Math.random().toString(36).slice(2), timestamp: now, severity: sev as Alert['severity'], message: 'Evento detectado' },
          ...this.alerts,
        ].slice(0, 20);
      }

      this.emit();
    }, 1000);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  subscribeMetrics(listener: Listener<Metrics>): Unsubscribe {
    this.metricListeners.add(listener);
    listener(this.metrics);
    return () => this.metricListeners.delete(listener);
  }

  subscribeSeries(listener: Listener<Point[]>): Unsubscribe {
    this.seriesListeners.add(listener);
    listener(this.series);
    return () => this.seriesListeners.delete(listener);
  }

  subscribeAlerts(listener: Listener<Alert[]>): Unsubscribe {
    this.alertListeners.add(listener);
    listener(this.alerts);
    return () => this.alertListeners.delete(listener);
  }

  private emit() {
    this.metricListeners.forEach((l) => l(this.metrics));
    this.seriesListeners.forEach((l) => l(this.series));
    this.alertListeners.forEach((l) => l(this.alerts));
  }
}

export const dataService = new DataService();
