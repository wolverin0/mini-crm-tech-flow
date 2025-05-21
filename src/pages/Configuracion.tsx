
import { useState, useEffect } from "react";
import { getSystemConfig, setSystemConfig } from "@/services/configService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Cog, Mail, Save } from "lucide-react";
import { SmtpConfig } from "@/types";
import PageHeader from "@/components/layout/PageHeader"; // Import PageHeader

const Configuracion = () => {
  const [overdueThreshold, setOverdueThreshold] = useState("");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    from_email: "",
    from_name: ""
  });

  useEffect(() => {
    const loadConfig = async () => {
      const threshold = await getSystemConfig("overdue_days_threshold");
      setOverdueThreshold(threshold || "7");
      
      const smtpConfigStr = await getSystemConfig("smtp_config");
      if (smtpConfigStr) {
        try {
          const config = JSON.parse(smtpConfigStr);
          setSmtpConfig(config);
        } catch (error) {
          console.error("Error parsing SMTP config:", error);
        }
      }
    };

    loadConfig();
  }, []);

  const handleSaveThreshold = async () => {
    setIsSavingGeneral(true);
    try {
      await setSystemConfig("overdue_days_threshold", overdueThreshold);
      toast.success("Umbral de días actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el umbral de días:", error);
      toast.error("No se pudo actualizar el umbral de días. Inténtalo de nuevo.");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveSmtpConfig = async () => {
    setIsSavingSmtp(true);
    try {
      if (!smtpConfig.host) {
        toast.error("El host SMTP es requerido");
        return;
      }
      if (!smtpConfig.port) {
        toast.error("El puerto SMTP es requerido");
        return;
      }
      if (!smtpConfig.username) {
        toast.error("El usuario SMTP es requerido");
        return;
      }
      if (!smtpConfig.from_email) {
        toast.error("El email de origen es requerido");
        return;
      }

      await setSystemConfig("smtp_config", JSON.stringify(smtpConfig));
      toast.success("Configuración SMTP actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar la configuración SMTP:", error);
      toast.error("No se pudo actualizar la configuración SMTP. Inténtalo de nuevo.");
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSmtpChange = (key: keyof SmtpConfig, value: string | number | boolean) => {
    setSmtpConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <PageHeader title="Configuración" description="Ajustes generales y configuración del sistema." />
      <Tabs defaultValue="general" className="w-full max-w-3xl">
        <TabsList>
          <TabsTrigger value="general">
            <Cog className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajusta la configuración general del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="overdue_days_threshold">
                  Umbral de días para órdenes atrasadas
                </Label>
                <Input
                  id="overdue_days_threshold"
                  value={overdueThreshold}
                  onChange={(e) => setOverdueThreshold(e.target.value)}
                  type="number"
                  placeholder="Número de días"
                />
              </div>
              <Button onClick={handleSaveThreshold} disabled={isSavingGeneral}>
                {isSavingGeneral ? (
                  <>
                    <div className="animate-spin mr-2 rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Email (SMTP)</CardTitle>
              <CardDescription>
                Configura los ajustes del servidor SMTP para enviar correos electrónicos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={smtpConfig.host}
                    onChange={(e) => handleSmtpChange("host", e.target.value)}
                    placeholder="smtp.tudominio.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp_port">Puerto</Label>
                  <Input
                    id="smtp_port"
                    value={smtpConfig.port}
                    onChange={(e) => handleSmtpChange("port", parseInt(e.target.value) || 587)}
                    type="number"
                    placeholder="587"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp_username">Usuario</Label>
                  <Input
                    id="smtp_username"
                    value={smtpConfig.username}
                    onChange={(e) => handleSmtpChange("username", e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp_password">Contraseña</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => handleSmtpChange("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="from_email">Email de origen</Label>
                  <Input
                    id="from_email"
                    value={smtpConfig.from_email}
                    onChange={(e) => handleSmtpChange("from_email", e.target.value)}
                    placeholder="soporte@tuempresa.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="from_name">Nombre de origen</Label>
                  <Input
                    id="from_name"
                    value={smtpConfig.from_name}
                    onChange={(e) => handleSmtpChange("from_name", e.target.value)}
                    placeholder="Soporte Técnico"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="smtp_secure" 
                  checked={smtpConfig.secure}
                  onCheckedChange={(checked) => handleSmtpChange("secure", checked)}
                />
                <Label htmlFor="smtp_secure">Usar conexión segura (SSL/TLS)</Label>
              </div>

              <Button onClick={handleSaveSmtpConfig} disabled={isSavingSmtp}>
                {isSavingSmtp ? (
                  <>
                    <div className="animate-spin mr-2 rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar configuración SMTP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracion;
