"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientActivitySummary } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const ClientActivitySummaryReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['clientActivitySummary', dateRange],
    () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.reject(new Error("Date range is required"));
      }
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      return getClientActivitySummary(startDate, endDate);
    },
    { enabled: queryEnabled && !!dateRange?.from && !!dateRange?.to }
  );

  useEffect(() => {
    if (queryEnabled && dateRange?.from && dateRange?.to) {
      refetch();
    }
  }, [dateRange, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    if (dateRange?.from && dateRange?.to) {
      setQueryEnabled(true);
    } else {
      console.error("Date range is required to generate the report.");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Resumen de Actividad de Clientes</h3>
      <div className="flex space-x-2 items-center">
        <DateRangePicker 
          initialDateRange={dateRange} 
          onDateChange={setDateRange} 
        />
        <Button onClick={handleGenerateReport} disabled={isLoading || !dateRange?.from || !dateRange?.to}>
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
            No se pudo cargar el resumen de actividad de clientes. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Cliente</TableHead>
                    <TableHead>Nombre Cliente</TableHead>
                    <TableHead className="text-right">Nº de Órdenes</TableHead>
                    <TableHead className="text-right">Monto Total Facturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((client) => (
                    <TableRow key={client.clientId}>
                      <TableCell>{client.clientId}</TableCell>
                      <TableCell>{client.clientName}</TableCell>
                      <TableCell className="text-right">{client.numberOfOrders}</TableCell>
                      <TableCell className="text-right">${client.totalInvoicedAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No hay datos de actividad de clientes para el período seleccionado.</p>
            )}
          </CardContent>
        </Card>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione el rango de fechas y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default ClientActivitySummaryReport;
