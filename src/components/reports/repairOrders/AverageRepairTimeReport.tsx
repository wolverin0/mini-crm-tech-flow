"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAverageRepairTime } from '@/services/reportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const AverageRepairTimeReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [groupByEquipment, setGroupByEquipment] = useState<boolean>(false);
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['averageRepairTime', dateRange, groupByEquipment],
    () => {
      const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
      return getAverageRepairTime(startDate, endDate, groupByEquipment);
    },
    { enabled: queryEnabled }
  );

  useEffect(() => {
    if (queryEnabled) {
      refetch();
    }
  }, [dateRange, groupByEquipment, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    setQueryEnabled(true);
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Tiempo Promedio de Reparación</h3>
      <div className="flex flex-wrap gap-2 items-center">
        <DateRangePicker onDateChange={setDateRange} />
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="groupByEquipment" 
            checked={groupByEquipment}
            onCheckedChange={(checked) => setGroupByEquipment(checked as boolean)}
          />
          <Label htmlFor="groupByEquipment" className="text-sm font-medium">Agrupar por tipo de equipo</Label>
        </div>
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
            No se pudo cargar el reporte de tiempo promedio de reparación. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="space-y-6">
          <StatCard 
            title="Tiempo Promedio General de Reparación" 
            value={`${data.overallAverageTime.toFixed(2)} días`} 
            icon={<Clock className="h-4 w-4 text-muted-foreground" />} 
          />

          {groupByEquipment && data.byEquipmentType && data.byEquipmentType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tiempo Promedio por Tipo de Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Equipo</TableHead>
                      <TableHead className="text-right">Tiempo Promedio (días)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byEquipmentType.map((item) => (
                      <TableRow key={item.equipmentType}>
                        <TableCell>{item.equipmentType}</TableCell>
                        <TableCell className="text-right">{item.averageTime.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
           {groupByEquipment && (!data.byEquipmentType || data.byEquipmentType.length === 0) && (
             <p>No hay datos de tiempo promedio por tipo de equipo para el período seleccionado.</p>
           )}
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

export default AverageRepairTimeReport;
