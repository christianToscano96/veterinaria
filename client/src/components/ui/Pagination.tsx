import { ChevronRight, ChevronLeft } from "lucide-react";
import { theme } from "../../lib/theme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsShown: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsShown, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      <p style={styles.text}>Mostrando {itemsShown} de {totalItems} pacientes</p>
      <div style={styles.buttons}>
        <button style={styles.pageButton} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...styles.pageButton,
              ...(page === currentPage ? styles.pageButtonActive : {}),
              ...(page !== currentPage ? styles.pageButtonInactive : {}),
            }}
          >
            {page}
          </button>
        ))}
        <button style={styles.pageButton} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "0 24px 8px",
  },
  text: {
    fontSize: "12px",
    color: theme.onSurfaceVariant,
  },
  buttons: {
    display: "flex",
    gap: "8px",
  },
  pageButton: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: `1px solid ${theme.surfaceContainer}`,
    background: theme.surfaceContainerLowest,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageButtonActive: {
    background: theme.primary,
    color: theme.onPrimary,
    fontWeight: "700",
  },
  pageButtonInactive: {
    color: theme.onSurfaceVariant,
    fontWeight: "700",
  },
};

export default Pagination;