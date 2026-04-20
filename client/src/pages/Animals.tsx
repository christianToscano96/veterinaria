import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { animalsApi } from "../lib/api";
import { Loader2, Dog, Cat, Bird, Filter, Smile } from "lucide-react";
import { theme } from "../lib/theme";

// Components
import { PatientTableRow } from "../components/ui/PatientTableRow";
import { StatCard } from "../components/ui/StatCard";
import { FilterButton } from "../components/ui/FilterButton";
import { Pagination } from "../components/ui/Pagination";
import {
  VaccinationDrive,
  SpeciesMix,
  Satisfaction,
} from "../components/ui/BentoGrid";

export function AnimalsPage() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSpecies, setFilterSpecies] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAnimals();
  }, [filterSpecies]);

  async function loadAnimals() {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterSpecies) params.species = filterSpecies;
      const data = await animalsApi.list(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setAnimals(data.animals || []);
    } catch (error) {
      console.error("Failed to load animals:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Simulated data
  const tableData =
    animals.length > 0
      ? animals
      : [
          {
            id: "1",
            name: "Luna",
            species: "dog",
            breed: "Golden Retriever",
            ownerName: "Eleanor Rigby",
            ownerEmail: "erigby@example.com",
            lastVisit: "Oct 12, 2023",
            status: "healthy",
            age: "4y 2m",
          },
          {
            id: "2",
            name: "Oliver",
            species: "cat",
            breed: "Scottish Fold",
            ownerName: "Julian Blackwood",
            ownerPhone: "+1 (555) 234-9812",
            lastVisit: "Nov 04, 2023",
            status: "checking-in",
            age: "2y 8m",
          },
          {
            id: "3",
            name: "Pip",
            species: "bird",
            breed: "Budgerigar",
            ownerName: "Martha Stewart",
            ownerEmail: "martha.s@web.com",
            lastVisit: "Sep 20, 2023",
            status: "urgent",
            age: "1y 0m",
          },
        ];

  const speciesFilters = [
    { key: "", label: "Todas las especies", icon: Filter },
    { key: "dog", label: "Caninos", icon: Dog },
    { key: "cat", label: "Felinos", icon: Cat },
    { key: "bird", label: "Aves", icon: Bird },
  ];

  const speciesData = [
    { label: "Caninos", percentage: 62, color: theme.primary },
    { label: "Felinos", percentage: 28, color: theme.secondary },
    { label: "Otros", percentage: 10, color: theme.tertiary },
  ];

  if (isLoading)
    return (
      <div style={styles.loading}>
        <Loader2
          size={32}
          color={theme.primary}
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Filters & Stats */}
      <div style={styles.filtersRow}>
        <div>
          <h3 style={styles.title}>Gestión de Pacientes</h3>
          <div style={styles.filters}>
            {speciesFilters.map((f) => (
              <FilterButton
                key={f.key}
                icon={f.icon}
                label={f.label}
                isActive={filterSpecies === f.key}
                onClick={() => setFilterSpecies(f.key)}
              />
            ))}
          </div>
        </div>
        <div style={styles.stats}>
          <StatCard
            label="Activos"
            value={tableData.length}
            color={theme.secondary}
          />
          <StatCard label="Vencidos" value={3} color={theme.tertiary} />
        </div>
      </div>

      {/* Table */}
      <section style={styles.tableSection}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre y Raza</th>
                <th style={styles.th}>Dueño Principal</th>
                <th style={styles.th}>Última Visita</th>
                <th style={styles.th}>Estado de Salud</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((animal) => (
                <PatientTableRow
                  key={animal.id}
                  animal={animal}
                  onClick={() => {}}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={2}
          totalItems={1240}
          itemsShown={tableData.length}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Bento Grid */}
      <div style={styles.bentoGrid}>
        <VaccinationDrive
          patientCount={48}
          onNotify={() => console.log("notify")}
        />
        <SpeciesMix data={speciesData} />
        <Satisfaction score="98.2%" reviews="2.4k" icon={Smile} />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column" as const, gap: "32px" },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  filtersRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap" as const,
    gap: "24px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: theme.onSurface,
    marginBottom: "16px",
  },
  filters: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  stats: { display: "flex", gap: "16px" },
  tableSection: {
    background: theme.surfaceContainerLow,
    borderRadius: "16px",
    padding: "24px",
    border: `1px solid ${theme.surfaceContainer}`,
  },
  tableWrapper: { overflowX: "auto" as const },
  table: {
    width: "100%",
    borderCollapse: "separate" as const,
    borderSpacing: "0 16px",
  },
  th: {
    padding: "8px 24px",
    textAlign: "left" as const,
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.outline,
  },
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
};

export default AnimalsPage;
