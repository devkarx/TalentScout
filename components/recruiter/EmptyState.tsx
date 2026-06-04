import { SearchX } from "lucide-react";

interface EmptyStateProps {
  hasCandidates: boolean;
  onClearFilters: () => void;
  onBroadenLocation: () => void;
}

export default function EmptyState({ hasCandidates, onClearFilters, onBroadenLocation }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8 text-text-subtle" />
      </div>
      <h3 className="font-display font-medium text-xl text-text-primary mb-2">
        {hasCandidates ? "No exact matches" : "No candidates yet"}
      </h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">
        {hasCandidates
          ? "Try broadening your search or removing some filters."
          : "Upload the first resume to start building your talent pool."}
      </p>
      <div className="flex gap-3">
        {!hasCandidates ? (
          <a href="/upload" className="btn-primary px-6 py-2.5 text-sm">
            Upload First Resume
          </a>
        ) : (
          <>
            <button onClick={onClearFilters} className="btn-primary px-6 py-2.5 text-sm">
              Clear Filters
            </button>
            <button onClick={onBroadenLocation} className="btn-secondary px-6 py-2.5 text-sm">
              Broaden Location
            </button>
          </>
        )}
      </div>
    </div>
  );
}
