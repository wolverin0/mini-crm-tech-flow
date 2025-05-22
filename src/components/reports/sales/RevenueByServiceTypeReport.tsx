"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRevenueByServiceType } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF5733', '#C70039'];

const RevenueByServiceTypeReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['revenueByServiceType', dateRange],
    () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.reject(new Error("Date range is required"));
      }
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      return getRevenueByServiceType(startDate, endDate);
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
  
  const chartData = data?.map(item => ({ name: item.equipmentType, value: item.totalRevenue })) || [];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Ingresos por Tipo de Servicio</h3>
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
            No se pudo cargar el reporte de ingresos por tipo de servicio. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Detallados por Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Servicio</TableHead>
                      <TableHead className="text-right">Ingresos Totales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((serviceRevenue) => (
                      <TableRow key={serviceRevenue.equipmentType}>
                        <TableCell>{serviceRevenue.equipmentType}</TableCell>
                        <TableCell className="text-right">${serviceRevenue.totalRevenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No hay datos de ingresos para el período seleccionado.</p>
              )}
            </CardContent>
          </Card>

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ingresos por Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}/>
                    <Legend />
                  </PieChart>
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

export default RevenueByServiceTypeReport;
