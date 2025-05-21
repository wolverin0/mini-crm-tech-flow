import PageHeader from "@/components/layout/PageHeader";

const Reportes = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reportes"
        description="Generación y visualización de reportes."
      />
      <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          Página de reportes en construcción. Próximamente podrá generar reportes detallados aquí.
        </p>
      </div>
    </div>
  );
};

export default Reportes;
