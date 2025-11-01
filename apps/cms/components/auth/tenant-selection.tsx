"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui";
import { completeTenantRegistration } from "@/server/auth/actions";

interface TenantOption {
  id: number;
  name: string;
}

interface TenantSelectionProps {
  tenants: Array<TenantOption>;
  userEmail: string;
}

function TenantSelection({ tenants, userEmail }: TenantSelectionProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [authString, setAuthString] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const TENANTS_PER_PAGE = 3;

  // Extract year from tenant name if present (looks for any 4-digit number)
  const extractYear = (name: string): number | null => {
    const match = name.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  };

  // Sort tenants: first by year (most recent first) if available, then alphabetically by name
  const { sortedTenants, totalPages, currentPageTenants, currentPageYears } =
    useMemo(() => {
      const sorted = [...tenants].sort((a, b) => {
        const yearA = extractYear(a.name);
        const yearB = extractYear(b.name);

        // If both have years, sort by year descending
        if (yearA !== null && yearB !== null) {
          if (yearA !== yearB) return yearB - yearA;
        }
        // If only one has a year, prioritize it
        if (yearA !== null && yearB === null) return -1;
        if (yearA === null && yearB !== null) return 1;

        // Otherwise sort alphabetically
        return a.name.localeCompare(b.name);
      });
      const total = Math.ceil(sorted.length / TENANTS_PER_PAGE);
      const startIndex = currentPage * TENANTS_PER_PAGE;
      const paginated = sorted.slice(startIndex, startIndex + TENANTS_PER_PAGE);

      // Get unique years for current page (only those that have years)
      const years = [
        ...new Set(
          paginated
            .map((tenant) => extractYear(tenant.name))
            .filter((y): y is number => y !== null),
        ),
      ].sort((a, b) => b - a);

      return {
        sortedTenants: sorted,
        totalPages: total,
        currentPageTenants: paginated,
        currentPageYears: years,
      };
    }, [tenants, currentPage]);

  const handlePageChange = (newPage: number) => {
    // Clamp within bounds to avoid empty pages
    setCurrentPage((prev) => {
      const next = Math.max(0, Math.min(newPage, totalPages - 1));
      return next;
    });
  };

  // If tenants change or pages shrink, keep currentPage within bounds
  useEffect(() => {
    setCurrentPage((prev) => {
      const maxIndex = Math.max(0, totalPages - 1);
      return Math.min(prev, maxIndex);
    });
  }, [totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!selectedTenantId) {
      toast.error("Please select a tenant to continue");
      return;
    }

    if (!authString) {
      setAuthError("Voer de autorisatiesleutel in");
      toast.error("Voer de autorisatiesleutel in");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await completeTenantRegistration(
        selectedTenantId,
        authString,
      );

      if (result.error) {
        // Show inline error for invalid auth key; toast for other errors
        if (result.error.toLowerCase().includes("autorisatiesleutel")) {
          setAuthError(result.error);
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Registration completed successfully!");
        if (result.deepLink) {
          window.location.href = result.deepLink;
          return;
        }
        router.push("/");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
          Selecteer jouw klas
        </h1>
        <p className="text-neutral-600 text-[15px]">
          Selecteer jouw klas in het jaar dat je de opleiding begonnen bent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pagination controls at top */}
        <div className="flex justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex-1 cursor-pointer"
          >
            ← Vorige
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="flex-1 cursor-pointer"
          >
            Volgende →
          </Button>
        </div>

        {/* Tenant list */}
        <div className="space-y-2">
          {currentPageTenants.map((tenant) => (
            <label
              key={tenant.id}
              className={`block cursor-pointer rounded-md border-2 p-3.5 transition-all ${
                selectedTenantId === tenant.id
                  ? "border-accent bg-accent/5"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
              }`}
            >
              <input
                type="radio"
                name="tenant"
                value={tenant.id}
                checked={selectedTenantId === tenant.id}
                onChange={() => setSelectedTenantId(tenant.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900">
                  {tenant.name}
                </span>
                <div
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    selectedTenantId === tenant.id
                      ? "border-accent bg-accent"
                      : "border-neutral-300"
                  }`}
                >
                  {selectedTenantId === tenant.id && (
                    <div className="h-full w-full rounded-full bg-white p-0.5">
                      <div className="h-full w-full rounded-full bg-accent" />
                    </div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Fullwidth confirm button */}
        <div className="space-y-2">
          <input
            type="password"
            value={authString}
            onChange={(e) => {
              setAuthError(null);
              setAuthString(e.target.value);
            }}
            placeholder="Autorisatiesleutel"
            className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-1 outline-none transition-colors ${authError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-neutral-300 focus:ring-accent/20"}`}
            aria-invalid={authError ? "true" : "false"}
            autoComplete="off"
          />
          {authError ? (
            <p className="text-sm text-red-600">{authError}</p>
          ) : null}
          <Button
            type="submit"
            className="w-full cursor-pointer h-10"
            isLoading={isSubmitting}
            disabled={!selectedTenantId}
          >
            {isSubmitting ? "Bezig..." : "Bevestigen"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TenantSelection;
