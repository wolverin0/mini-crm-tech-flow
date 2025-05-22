"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesByClient } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesByClientReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['salesByClient', dateRange],
    () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.reject(new Error("Date range is required"));
      }
      // Ensure dates are sent in 'yyyy-MM-dd' format or as ISO strings
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      return getSalesByClient(startDate, endDate);
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
      // Handle error or prompt user to select a date range
      console.error("Date range is required to generate the report.");
    }
  };

  const topNClients = data ? [...data].sort((a, b) => b.totalInvoiced - a.totalInvoiced).slice(0, 10) : [];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Ventas por Cliente</h3>
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
            No se pudo cargar el reporte de ventas por cliente. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Totales por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Cliente</TableHead>
                      <TableHead>Nombre Cliente</TableHead>
                      <TableHead className="text-right">Total Facturado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((clientSale) => (
                      <TableRow key={clientSale.clientId}>
                        <TableCell>{clientSale.clientId}</TableCell>
                        <TableCell>{clientSale.clientName}</TableCell>
                        <TableCell className="text-right">${clientSale.totalInvoiced.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No hay datos de ventas para el período seleccionado.</p>
              )}
            </CardContent>
          </Card>

          {topNClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Clientes por Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topNClients} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clientName" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="totalInvoiced" fill="#8884d8" name="Total Facturado" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione el rango de fechas y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default SalesByClientReport;
