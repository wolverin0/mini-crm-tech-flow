"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceAging } from '@/services/reportingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvoiceAgingReport: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(new Date());
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['invoiceAging', asOfDate],
    () => {
      if (!asOfDate) {
        return Promise.reject(new Error("As of Date is required"));
      }
      return getInvoiceAging(format(asOfDate, 'yyyy-MM-dd'));
    },
    { enabled: queryEnabled && !!asOfDate }
  );

  useEffect(() => {
    if (queryEnabled && asOfDate) {
      refetch();
    }
  }, [asOfDate, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    if (asOfDate) {
      setQueryEnabled(true);
    } else {
      console.error("As of Date is required to generate the report.");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Antigüedad de Saldos de Facturas</h3>
      <div className="flex space-x-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !asOfDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {asOfDate ? format(asOfDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={asOfDate}
              onSelect={setAsOfDate}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleGenerateReport} disabled={isLoading || !asOfDate}>
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
            No se pudo cargar el reporte de antigüedad de saldos. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Antigüedad al {asOfDate ? format(asOfDate, "PPP", { locale: es }) : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rango de Antigüedad</TableHead>
                    <TableHead className="text-right">Monto Total</TableHead>
                    <TableHead className="text-right">Nº de Facturas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((agingBucket) => (
                    <TableRow key={agingBucket.ageBucket}>
                      <TableCell>{agingBucket.ageBucket}</TableCell>
                      <TableCell className="text-right">${agingBucket.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agingBucket.numberOfInvoices}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No hay datos de antigüedad para la fecha seleccionada.</p>
            )}
          </CardContent>
        </Card>
      )}
       {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione la fecha "Hasta" y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default InvoiceAgingReport;
