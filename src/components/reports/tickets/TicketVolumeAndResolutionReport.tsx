"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTicketVolumeAndResolution } from '@/services/reportingService'; // Assuming this service function exists
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // For assignedTo filter
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TicketIcon, CheckCircle2, ClockIcon, ListChecks, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock filter options - in a real app, these might come from constants or a service
const mockPriorities = ['Low', 'Medium', 'High', 'Urgent'];
// Example statuses based on the mock Ticket interface in reportingService
const mockStatuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'Pending Client Response']; 

const TicketVolumeAndResolutionReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
  const [assignedToFilter, setAssignedToFilter] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['ticketVolumeAndResolution', dateRange, selectedPriority, assignedToFilter, selectedStatus],
    () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.reject(new Error("Date range is required"));
      }
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      const filters = {
        priority: selectedPriority,
        assignedTo: assignedToFilter.trim() === '' ? undefined : assignedToFilter.trim(),
        status: selectedStatus,
      };
      return getTicketVolumeAndResolution(startDate, endDate, filters);
    },
    { enabled: queryEnabled && !!dateRange?.from && !!dateRange?.to }
  );

  useEffect(() => {
    if (queryEnabled && dateRange?.from && dateRange?.to) {
      refetch();
    }
  }, [dateRange, selectedPriority, assignedToFilter, selectedStatus, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    if (dateRange?.from && dateRange?.to) {
      setQueryEnabled(true);
    } else {
      console.error("Date range is required to generate the report.");
    }
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

  const byStatusChartData = data?.byStatus.map(item => ({ name: item.status, value: item.count })) || [];
  const byPriorityChartData = data?.byPriority.map(item => ({ name: item.priority, value: item.count })) || [];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reporte de Volumen y Resolución de Tickets</h3>
      
      <div className="flex flex-wrap gap-2 items-center p-4 border rounded-md">
        <DateRangePicker 
          initialDateRange={dateRange} 
          onDateChange={setDateRange} 
        />
        <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Prioridades</SelectItem>
            {mockPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input 
          placeholder="ID Usuario Asignado" 
          className="w-[180px]" 
          value={assignedToFilter} 
          onChange={(e) => setAssignedToFilter(e.target.value)}
        />
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            {mockStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateReport} disabled={isLoading || !dateRange?.from || !dateRange?.to}>
          {isLoading && queryEnabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generar Reporte
        </Button>
      </div>

      {queryEnabled && isLoading && (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg">Cargando reporte de tickets...</p>
        </div>
      )}

      {queryEnabled && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el reporte de tickets. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Tickets Creados" value={data.createdCount} icon={<TicketIcon className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Tickets Resueltos" value={data.resolvedCount} icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Tiempo Prom. Resolución" value={data.averageResolutionTime !== undefined ? `${data.averageResolutionTime.toFixed(2)} días` : 'N/A'} icon={<ClockIcon className="h-5 w-5 text-muted-foreground" />} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                {byStatusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={byStatusChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No hay datos de tickets por estado para los filtros aplicados.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                {byPriorityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={byPriorityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No hay datos de tickets por prioridad para los filtros aplicados.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-6 text-center text-gray-500 border rounded-lg">
          <ListChecks className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          Seleccione el rango de fechas y filtros (opcional), luego haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default TicketVolumeAndResolutionReport;
