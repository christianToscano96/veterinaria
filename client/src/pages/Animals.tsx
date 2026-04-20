import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { animalsApi, vaccinationsApi } from "../lib/api";
import {
  Loader2,
  Dog,
  Cat,
  Bird,
  Filter,
  Smile,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Check,
  X,
  Bell,
} from "lucide-react";
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

type SortField = "name" | "ownerName" | "lastVisit" | "status";
type SortOrder = "asc" | "desc";

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  lastVisit: string;
  status: "healthy" | "checking-in" | "urgent";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// Skeleton component
function SkeletonRow() {
  return (
    <tr>
      <td style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: theme.surfaceContainerHighest,
              animation: "pulse 1.5s infinite",
            }}
          />
          <div>
            <div
              style={{
                width: "120px",
                height: "16px",
                borderRadius: "4px",
                background: theme.surfaceContainerHighest,
                animation: "pulse 1.5s infinite",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "12px",
                borderRadius: "4px",
                background: theme.surfaceContainerHighest,
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>
        </div>
      </td>
      <td style={{ padding: "20px 24px" }}>
        <div
          style={{
            width: "100px",
            height: "14px",
            borderRadius: "4px",
            background: theme.surfaceContainerHighest,
            animation: "pulse 1.5s infinite",
          }}
        />
      </td>
      <td style={{ padding: "20px 24px" }}>
        <div
          style={{
            width: "80px",
            height: "14px",
            borderRadius: "4px",
            background: theme.surfaceContainerHighest,
            animation: "pulse 1.5s infinite",
          }}
        />
      </td>
      <td style={{ padding: "20px 24px" }}>
        <div
          style={{
            width: "70px",
            height: "24px",
            borderRadius: "20px",
            background: theme.surfaceContainerHighest,
            animation: "pulse 1.5s infinite",
          }}
        />
      </td>
      <td style={{ padding: "20px 24px" }}>
        <div
          style={{
            width: "80px",
            height: "32px",
            borderRadius: "8px",
            background: theme.surfaceContainerHighest,
            animation: "pulse 1.5s infinite",
          }}
        />
      </td>
    </tr>
  );
}

export function AnimalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSpecies, setFilterSpecies] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Sort
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  // Stats
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [filterSpecies]);

  async function loadData() {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterSpecies) params.species = filterSpecies;

      const [animalsData, vaccinationsData] = await Promise.all([
        animalsApi.list(Object.keys(params).length > 0 ? params : undefined),
        vaccinationsApi.overdue(),
      ]);

      setAnimals((animalsData.animals as Animal[]) || []);
      setOverdueCount((vaccinationsData as any).vaccinations?.length || 0);
    } catch (error) {
      console.error("Failed to load animals:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter & sort data
  const filteredData = useMemo(() => {
    let data = [...animals];

    // Search
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.breed?.toLowerCase().includes(s) ||
          a.ownerName.toLowerCase().includes(s),
      );
    }

    // Sort
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "lastVisit") {
        aVal = new Date(a.lastVisit).getTime();
        bVal = new Date(b.lastVisit).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [animals, search, sortField, sortOrder]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Species counts
  const speciesCounts = useMemo(() => {
    const counts: Record<string, number> = { "": animals.length };
    animals.forEach((a) => {
      counts[a.species] = (counts[a.species] || 0) + 1;
    });
    return counts;
  }, [animals]);

  // Handlers
  function handleView(animalId: string) {
    navigate(`/animals/${animalId}`);
  }

  function handleEdit(animalId: string) {
    navigate(`/animals/edit/${animalId}`);
  }

  async function handleDelete(animalId: string) {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;
    try {
      await animalsApi.delete(animalId);
      showToast("Paciente eliminado", "success");
      loadData();
    } catch (error) {
      showToast("Error al eliminar", "error");
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`¿Eliminar ${selectedIds.size} pacientes?`)) return;
    try {
      for (const id of selectedIds) {
        await animalsApi.delete(id);
      }
      showToast(`${selectedIds.size} pacientes eliminados`, "success");
      setSelectedIds(new Set());
      setShowBulkActions(false);
      loadData();
    } catch (error) {
      showToast("Error al eliminar", "error");
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function toggleSelectAll() {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((a) => a.id)));
    }
  }

  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function exportCSV() {
    const headers = [
      "Nombre",
      "Raza",
      "Dueño",
      "Teléfono",
      "Última Visita",
      "Estado",
    ];
    const rows = filteredData.map((a) => [
      a.name,
      a.breed || a.species,
      a.ownerName,
      a.ownerPhone || "",
      a.lastVisit,
      a.status,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacientes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast("Exportado exitosamente", "success");
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ id: Date.now().toString(), message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const speciesFilters = [
    {
      key: "",
      label: "Todas las especies",
      icon: Filter,
      count: speciesCounts[""],
    },
    {
      key: "dog",
      label: "Caninos",
      icon: Dog,
      count: speciesCounts["dog"] || 0,
    },
    {
      key: "cat",
      label: "Felinos",
      icon: Cat,
      count: speciesCounts["cat"] || 0,
    },
    {
      key: "bird",
      label: "Aves",
      icon: Bird,
      count: speciesCounts["bird"] || 0,
    },
  ];

  const speciesData = [
    {
      label: "Caninos",
      percentage: speciesCounts["dog"]
        ? Math.round((speciesCounts["dog"] / animals.length) * 100)
        : 0,
      color: theme.primary,
    },
    {
      label: "Felinos",
      percentage: speciesCounts["cat"]
        ? Math.round((speciesCounts["cat"] / animals.length) * 100)
        : 0,
      color: theme.secondary,
    },
    {
      label: "Otros",
      percentage:
        100 -
        ((speciesCounts["dog"] || 0) / animals.length) * 100 -
        ((speciesCounts["cat"] || 0) / animals.length) * 100,
      color: theme.tertiary,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background:
              toast.type === "success"
                ? theme.secondaryContainer
                : theme.errorContainer,
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Filters & Stats */}
      <div style={styles.filtersRow}>
        <div style={styles.leftSection}>
          <h3 style={styles.title}>Gestión de Pacientes</h3>

          {/* Search */}
          <div style={styles.searchBox}>
            <Search size={18} style={{ color: theme.onSurfaceVariant }} />
            <input
              type="text"
              placeholder="Buscar por nombre, raza o dueño..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.searchClear}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={styles.filters}>
            {speciesFilters.map((f) => (
              <FilterButton
                key={f.key}
                icon={f.icon}
                label={`${f.label} (${f.count})`}
                isActive={filterSpecies === f.key}
                onClick={() => setFilterSpecies(f.key)}
              />
            ))}
          </div>
        </div>

        <div style={styles.rightSection}>
          <button
            onClick={() => navigate("/animals/new")}
            style={styles.addButton}
          >
            <Plus size={18} />
            Nuevo Paciente
          </button>
          <div style={styles.stats}>
            <StatCard
              label="Activos"
              value={animals.length}
              color={theme.secondary}
            />
            <StatCard
              label="Vencidos"
              value={overdueCount}
              color={theme.tertiary}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedIds.size > 0 && (
        <div style={styles.bulkBar}>
          <span style={styles.bulkCount}>{selectedIds.size} seleccionados</span>
          <button onClick={handleBulkDelete} style={styles.bulkDelete}>
            <Trash2 size={16} />
            Eliminar
          </button>
          <button
            onClick={() => {
              setSelectedIds(new Set());
              setShowBulkActions(false);
            }}
            style={styles.bulkCancel}
          >
            <X size={16} />
            Cancelar
          </button>
        </div>
      )}

      {/* Table */}
      <section style={styles.tableSection}>
        {/* Table Header */}
        <div style={styles.tableHeader}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={
                selectedIds.size === paginatedData.length &&
                paginatedData.length > 0
              }
              onChange={toggleSelectAll}
            />
          </label>
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            style={styles.bulkToggle}
          >
            <Checkbox size={16} />
          </button>
          <button onClick={exportCSV} style={styles.exportBtn}>
            <Download size={16} />
            Exportar
          </button>
        </div>

        {/* Mobile Cards Wrapper */}
        <div className="desktop-only">
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "40px" }}></th>
                  <th style={styles.th}>
                    <button
                      onClick={() => handleSort("name")}
                      style={styles.thButton}
                    >
                      Nombre y Raza
                      {sortField === "name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button
                      onClick={() => handleSort("ownerName")}
                      style={styles.thButton}
                    >
                      Dueño Principal
                      {sortField === "ownerName" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button
                      onClick={() => handleSort("lastVisit")}
                      style={styles.thButton}
                    >
                      Última Visita
                      {sortField === "lastVisit" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button
                      onClick={() => handleSort("status")}
                      style={styles.thButton}
                    >
                      Estado
                      {sortField === "status" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                  <th
                    style={{ ...styles.th, textAlign: "right", width: "120px" }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyState}>
                      <Search size={32} style={{ opacity: 0.3 }} />
                      <p>No se encontraron pacientes</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((animal) => (
                    <PatientTableRow
                      key={animal.id}
                      animal={animal}
                      isExpanded={expandedId === animal.id}
                      isSelected={selectedIds.has(animal.id)}
                      onView={() => handleView(animal.id)}
                      onEdit={() => handleEdit(animal.id)}
                      onDelete={() => handleDelete(animal.id)}
                      onToggleExpand={() =>
                        setExpandedId(
                          expandedId === animal.id ? null : animal.id,
                        )
                      }
                      onToggleSelect={() => toggleSelect(animal.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-only" style={styles.mobileCards}>
          {paginatedData.map((animal) => (
            <div
              key={animal.id}
              style={styles.mobileCard}
              onClick={() => handleView(animal.id)}
            >
              <div style={styles.mobileCardHeader}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(animal.id)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={styles.mobileCardAvatar}>
                  {animal.name.charAt(0)}
                </div>
                <div>
                  <p style={styles.mobileCardName}>{animal.name}</p>
                  <p style={styles.mobileCardBreed}>
                    {animal.breed || animal.species}
                  </p>
                </div>
              </div>
              <div style={styles.mobileCardInfo}>
                <span>Dueño: {animal.ownerName}</span>
                <span>Última visita: {animal.lastVisit}</span>
              </div>
              <ChevronDown
                size={16}
                style={{ color: theme.onSurfaceVariant }}
              />
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsShown={paginatedData.length}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Bento Grid */}
      <div style={styles.bentoGrid}>
        <VaccinationDrive
          patientCount={overdueCount}
          onNotify={() => navigate("/vaccinations/overdue")}
        />
        <SpeciesMix data={speciesData} />
        <Satisfaction
          score="98.2%"
          reviews={animals.length.toString()}
          icon={Smile}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .filtersRow { flex-direction: column; align-items: flex-start; }
          .leftSection, .rightSection { width: 100%; }
          .searchBox { width: 100%; }
          .stats { width: 100%; justify-content: space-between; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// Checkbox icon component
function Checkbox({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    padding: "24px",
  },
  toast: {
    position: "fixed",
    top: "80px",
    right: "24px",
    padding: "12px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    zIndex: 1000,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    animation: "slideIn 0.3s ease",
  },
  filtersRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap" as const,
    gap: "24px",
  },
  leftSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: theme.onSurface,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: theme.surfaceContainerLowest,
    borderRadius: "12px",
    border: `1px solid ${theme.surfaceContainer}`,
    width: "300px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: "14px",
    color: theme.onSurface,
    outline: "none",
  },
  searchClear: {
    padding: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: theme.onSurfaceVariant,
  },
  filters: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    background: theme.primary,
    color: theme.onPrimary,
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    gap: "16px",
  },
  bulkBar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 20px",
    background: theme.primaryContainer,
    borderRadius: "12px",
  },
  bulkCount: {
    fontSize: "14px",
    fontWeight: "700",
    color: theme.onPrimaryContainer,
  },
  bulkDelete: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: theme.error,
    color: theme.onError,
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  bulkCancel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "transparent",
    color: theme.onPrimaryContainer,
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  bulkToggle: {
    padding: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: theme.onSurfaceVariant,
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: theme.surfaceContainerHighest,
    color: theme.onSurface,
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableSection: {
    background: theme.surfaceContainerLow,
    borderRadius: "16px",
    padding: "24px",
    border: `1px solid ${theme.surfaceContainer}`,
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "separate" as const,
    borderSpacing: "0 12px",
  },
  th: {
    padding: "8px 16px",
    textAlign: "left" as const,
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.outline,
  },
  thButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: theme.outline,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "48px",
    color: theme.onSurfaceVariant,
  },
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  mobileCards: {
    display: "none",
    flexDirection: "column" as const,
    gap: "12px",
  },
  mobileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: theme.surfaceContainerLowest,
    borderRadius: "12px",
    cursor: "pointer",
  },
  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  mobileCardAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: theme.primaryContainer,
    color: theme.onPrimaryContainer,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  mobileCardName: {
    fontSize: "14px",
    fontWeight: "700",
    color: theme.onSurface,
  },
  mobileCardBreed: {
    fontSize: "12px",
    color: theme.onSurfaceVariant,
  },
  mobileCardInfo: {
    display: "flex",
    flexDirection: "column" as const,
    fontSize: "12px",
    color: theme.onSurfaceVariant,
  },
};

export default AnimalsPage;
