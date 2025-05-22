"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNewClientCount } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NewClientAcquisitionReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90), // Default to last 90 days for better monthly view
    to: new Date(),
  });
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['newClientCount', dateRange],
    () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.reject(new Error("Date range is required"));
      }
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      return getNewClientCount(startDate, endDate);
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
  
  const chartData = data?.map(item => ({ name: item.period, value: item.newClientCount })) || [];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reporte de Adquisición de Nuevos Clientes</h3>
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
            No se pudo cargar el reporte de adquisición de clientes. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nuevos Clientes por Período (Mes)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Nuevos Clientes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <p>No hay datos de adquisición de clientes para el período seleccionado.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Adquisición</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período (Mes)</TableHead>
                      <TableHead className="text-right">Cantidad de Nuevos Clientes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.period}>
                        <TableCell>{item.period}</TableCell>
                        <TableCell className="text-right">{item.newClientCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No hay datos de adquisición de clientes para el período seleccionado.</p>
              )}
            </CardContent>
          </Card>
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

export default NewClientAcquisitionReport;
