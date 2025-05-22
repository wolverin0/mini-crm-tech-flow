"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonthlySalesSummary } from '@/services/reportingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));

const MonthlySalesSummaryReport: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['monthlySalesSummary', selectedMonth, selectedYear],
    () => getMonthlySalesSummary(selectedMonth, selectedYear),
    { enabled: queryEnabled } // Only run query when enabled
  );

  useEffect(() => {
    // Automatically fetch when component mounts with default month/year
    // or when selectedMonth/Year changes IF the user has already clicked "Generar Reporte"
    if (queryEnabled) {
      refetch();
    }
  }, [selectedMonth, selectedYear, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    setQueryEnabled(true); // Enable the query and refetch will be called by useEffect
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
      <h3 className="text-lg font-semibold">Resumen Mensual de Ventas</h3>
      <div className="flex space-x-2 items-center">
        <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map(month => (
              <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateReport} disabled={isLoading}>
          {isLoading && queryEnabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generar Reporte
        </Button>
      </div>

      {queryEnabled && isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando resumen...</p>
        </div>
      )}

      {queryEnabled && error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el resumen de ventas mensual. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Facturado" value={`$${data.totalInvoiced.toLocaleString()}`} />
          <StatCard title="Total Cobrado" value={`$${data.totalCollected.toLocaleString()}`} />
          <StatCard title="Número de Facturas" value={data.numberOfInvoices} />
        </div>
      )}
       {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione el mes y año, luego haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default MonthlySalesSummaryReport;
