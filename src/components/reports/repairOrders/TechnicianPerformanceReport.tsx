"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTechnicianPerformance } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const TechnicianPerformanceReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['technicianPerformance', dateRange],
    () => {
      const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
      return getTechnicianPerformance(startDate, endDate);
    },
    { enabled: queryEnabled }
  );

  useEffect(() => {
    if (queryEnabled) {
      refetch();
    }
  }, [dateRange, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    setQueryEnabled(true);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reporte de Rendimiento de Técnicos</h3>
      <div className="flex space-x-2 items-center">
        <DateRangePicker onDateChange={setDateRange} />
        <Button onClick={handleGenerateReport} disabled={isLoading && queryEnabled}>
          {isLoading && queryEnabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generar Reporte
        </Button>
      </div>

      {queryEnabled && isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando reporte...</p>
        </div>
      )}

      {queryEnabled && error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el reporte de rendimiento de técnicos. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Técnico (ID)</TableHead>
                    <TableHead className="text-right">Órdenes Completadas</TableHead>
                    <TableHead className="text-right">Tiempo Promedio Reparación (días)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((tech) => (
                    // technicianId from the service is now in tech.technicianName due to the service change
                    // and tech.technicianId is the direct ID.
                    // Since the service now populates tech.technicianName with the ID, we use that.
                    // The key should still be tech.technicianId as it's the unique identifier.
                    <TableRow key={tech.technicianId || 'unknown'}>
                      <TableCell>{tech.technicianName || tech.technicianId || 'N/A'}</TableCell> 
                      <TableCell className="text-right">{tech.ordersCompleted}</TableCell>
                      <TableCell className="text-right">{tech.averageRepairTime.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No hay datos de rendimiento para el período seleccionado.</p>
            )}
          </CardContent>
        </Card>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione un rango de fechas (opcional) y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default TechnicianPerformanceReport;
