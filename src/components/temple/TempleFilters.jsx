import { useState } from "react";
import { FiSearch, FiRefreshCw, FiX } from "react-icons/fi";
import Select from "../common/Select";
import {
  templeStates, districtsOfState, templeTypes, deityFamilies, SORT_OPTIONS,
} from "../../data/store";
import "../../styles/temple/templeFilters.css";

/**
 * Fully controlled filter panel.
 * `filters` is the single source of truth (lives in the URL on the page),
 * so the desktop sidebar and the mobile drawer can never drift apart.
 */
export default function TempleFilters({ filters, onChange, onClear, activeCount = 0 }) {
  const [showAllDeities, setShowAllDeities] = useState(false);

  const stateOptions    = ["All States", ...templeStates];
  const districtOptions = ["All Districts", ...districtsOfState(filters.state)];
  const typeOptions     = [{ value: "", label: "All Types" }, ...templeTypes.map((t) => ({ value: t, label: t }))];

  const visibleDeities = showAllDeities ? deityFamilies : deityFamilies.slice(0, 5);

  const toggleDeity = (name) => {
    const next = filters.deities.includes(name)
      ? filters.deities.filter((d) => d !== name)
      : [...filters.deities, name];
    onChange({ deities: next });
  };

  return (
    <aside className="tfilter">
      <div className="tfilter__head">
        <h3 className="tfilter__title">Filters</h3>
        {activeCount > 0 && <span className="tfilter__badge">{activeCount} active</span>}
      </div>

      {/* ── Search ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">Search Temples</p>
        <div className="tfilter__search">
          <FiSearch size={15} className="tfilter__search-icon" />
          <input
            type="text"
            placeholder="Name, deity, place…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value }, { replace: true })}
            className="tfilter__search-input"
          />
          {filters.search && (
            <button type="button" className="tfilter__search-clear" onClick={() => onChange({ search: "" })} aria-label="Clear search">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Deity ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">Deity</p>
        <div className="tfilter__deity-list">
          {visibleDeities.map((deity) => {
            const checked = filters.deities.includes(deity.name);
            return (
              <label key={deity.name} className={`tfilter__check-row ${checked ? "is-checked" : ""} ${deity.count === 0 ? "is-empty" : ""}`}>
                <input
                  type="checkbox"
                  className="tfilter__checkbox"
                  checked={checked}
                  onChange={() => toggleDeity(deity.name)}
                />
                <span className="tfilter__check-name">{deity.name}</span>
                <span className="tfilter__check-count">{deity.count}</span>
              </label>
            );
          })}
        </div>
        {deityFamilies.length > 5 && (
          <button type="button" className="tfilter__more-btn" onClick={() => setShowAllDeities((v) => !v)}>
            {showAllDeities ? "Show less ▲" : `Show ${deityFamilies.length - 5} more ▼`}
          </button>
        )}
      </div>

      {/* ── State ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">State</p>
        <Select
          value={filters.state}
          options={stateOptions}
          ariaLabel="State"
          onChange={(state) => onChange({ state, district: "All Districts" })}
        />
      </div>

      {/* ── District ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">District</p>
        <Select
          value={filters.district}
          options={districtOptions}
          ariaLabel="District"
          onChange={(district) => onChange({ district })}
        />
      </div>

      {/* ── Temple type ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">Temple Type</p>
        <Select
          value={filters.type}
          options={typeOptions}
          ariaLabel="Temple type"
          onChange={(type) => onChange({ type })}
        />
      </div>

      {/* ── Sort By ── */}
      <div className="tfilter__section">
        <p className="tfilter__label">Sort By</p>
        <Select
          value={filters.sort}
          options={SORT_OPTIONS}
          ariaLabel="Sort by"
          onChange={(sort) => onChange({ sort })}
        />
      </div>

      <button type="button" className="tfilter__clear" onClick={onClear} disabled={activeCount === 0}>
        <FiRefreshCw size={14} />
        Clear Filters
      </button>
    </aside>
  );
}
