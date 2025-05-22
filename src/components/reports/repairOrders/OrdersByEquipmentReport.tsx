"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByEquipment } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type GroupByType = 'equipment_type' | 'equipment_brand';

const OrdersByEquipmentReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<GroupByType>('equipment_type');
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['ordersByEquipment', dateRange, groupBy],
    () => {
      const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
      return getOrdersByEquipment(startDate, endDate, groupBy);
    },
    { enabled: queryEnabled }
  );

  useEffect(() => {
    if (queryEnabled) {
      refetch();
    }
  }, [dateRange, groupBy, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    setQueryEnabled(true);
  };
  
  const chartData = data?.map(item => ({ name: item.groupName, value: item.count })) || [];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reporte de Órdenes por Equipo</h3>
      <div className="flex flex-wrap gap-2 items-center">
        <DateRangePicker onDateChange={setDateRange} />
        <Select value={groupBy} onValueChange={(value: GroupByType) => setGroupBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equipment_type">Tipo de Equipo</SelectItem>
            <SelectItem value="equipment_brand">Marca de Equipo</SelectItem>
          </SelectContent>
        </Select>
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
            No se pudo cargar el reporte de órdenes por equipo. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Órdenes por {groupBy === 'equipment_type' ? 'Tipo' : 'Marca'}</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" name="Cantidad de Órdenes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No hay datos de órdenes para los filtros seleccionados.</p>
              )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Resumen de Órdenes por {groupBy === 'equipment_type' ? 'Tipo' : 'Marca'}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{groupBy === 'equipment_type' ? 'Tipo de Equipo' : 'Marca de Equipo'}</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.groupName}>
                        <TableCell>{item.groupName}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No hay datos de órdenes para los filtros seleccionados.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione filtros (opcional) y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default OrdersByEquipmentReport;
