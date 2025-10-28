import { Grid, GridItem, SimpleGrid } from '@chakra-ui/react';
import MetricCard from '../components/MetricCard';
import RealtimeChart from '../components/RealtimeChart';
import AlertsTable from '../components/AlertsTable';
import { useEffect, useState } from 'react';
import { dataService, type Metrics } from '../services/dataService';
import type { Point } from '../components/RealtimeChart';
import type { Alert } from '../components/AlertsTable';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    dataService.start();
    const u1 = dataService.subscribeMetrics(setMetrics);
    const u2 = dataService.subscribeSeries(setSeries);
    const u3 = dataService.subscribeAlerts(setAlerts);
    return () => {
      u1(); u2(); u3();
      dataService.stop();
    };
  }, []);

  return (
    <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={6}>
      <GridItem>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={4}>
          <MetricCard label="CPU" value={metrics?.cpu ?? 0} unit="%" delta={metrics?.deltas.cpu} />
          <MetricCard label="Memória" value={metrics?.memory ?? 0} unit="%" delta={metrics?.deltas.memory} />
          <MetricCard label="Req/s" value={metrics?.requestsPerSec ?? 0} delta={metrics?.deltas.rps} />
          <MetricCard label="Erros/min" value={metrics?.errorsPerMin ?? 0} delta={metrics?.deltas.epm} />
        </SimpleGrid>
        <RealtimeChart data={series} />
      </GridItem>
      <GridItem>
        <AlertsTable alerts={alerts} />
      </GridItem>
    </Grid>
  );
}
