import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  Building2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  LayoutDashboard,
  ChevronRight,
  Globe2,
  Hash,
  CalendarRange,
  Loader2,
  Sparkles,
  Search,
} from 'lucide-react';

const countryDefaultCurrency = (c) => (c === 'USA' ? 'USD' : c === 'EU' ? 'EUR' : 'INR');

const taxHint = (country) => {
  if (country === 'USA') {
    return 'Employer Identification Number (EIN), typically 9 digits.';
  }
  if (country === 'EU') {
    return 'VAT registration number for your entity in the relevant member state.';
  }
  return 'GSTIN or other tax registration identifier used for your India entity.';
};

function formatError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.details) return String(err.details);
  return 'Could not save. Check your connection and permissions.';
}

function maskTaxId(raw) {
  const s = String(raw || '').replace(/\s+/g, '');
  if (!s.length) return '—';
  if (s.length <= 4) return '••••';
  const tail = s.slice(-4);
  return `${'•'.repeat(Math.min(6, s.length - 4))}${tail}`;
}

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-border/60">
    {Icon && (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} strokeWidth={2} />
      </span>
    )}
    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{children}</span>
  </div>
);

const BusinessSetup = () => {
  const navigate = useNavigate();
  const { businesses, addBusiness, activeBusiness, setActiveBusinessId } = useApp();
  const formTopRef = useRef(null);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('USA');
  const [currency, setCurrency] = useState('USD');
  const [taxId, setTaxId] = useState('');
  const [finYear, setFinYear] = useState('Jan-Dec');

  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const [formMessage, setFormMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [orgSearch, setOrgSearch] = useState('');

  const expectedCurrency = useMemo(() => countryDefaultCurrency(country), [country]);
  const currencyDiffersFromRegionDefault = currency !== expectedCurrency;

  const taxLabel = currency === 'USD' ? 'EIN' : currency === 'EUR' ? 'VAT number' : 'GSTIN / tax ID';

  const clearSuccessOnEdit = () => {
    if (formStatus === 'success') {
      setFormStatus(null);
      setFormMessage('');
    }
  };

  const validate = () => {
    const next = {};
    const trimmedName = name.trim();
    const trimmedTax = taxId.trim();

    if (trimmedName.length < 2) {
      next.name = 'Enter a legal name (at least 2 characters).';
    }

    if (trimmedTax.length < 3) {
      next.taxId = 'Enter a valid tax identifier.';
    }

    const dup = businesses.some(
      (b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (trimmedName.length >= 2 && dup) {
      next.name = 'An organization with this name already exists.';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    setFormMessage('');

    if (!validate()) {
      setFormStatus('validation');
      setFormMessage('Fix the highlighted fields and try again.');
      return;
    }

    setLoading(true);

    const result = await addBusiness({
      name: name.trim(),
      country,
      currency,
      tax_id: taxId.trim(),
      financial_year: finYear,
    });

    setLoading(false);

    if (result?.success) {
      setFormStatus('success');
      setFormMessage('Organization created. It is now your active workspace.');
      setFieldErrors({});
      setName('');
      setTaxId('');
      setFinYear('Jan-Dec');
      setCountry('USA');
      setCurrency('USD');
      return;
    }

    setFormStatus('error');
    setFormMessage(formatError(result?.error));
  };

  const scrollToForm = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('business-legal-name')?.focus();
  };

  const sortedFilteredBusinesses = useMemo(() => {
    const q = orgSearch.trim().toLowerCase();
    const list = [...businesses].sort((a, b) => {
      const aActive = activeBusiness?.id === a.id;
      const bActive = activeBusiness?.id === b.id;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    if (!q) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        String(b.country || '')
          .toLowerCase()
          .includes(q) ||
        String(b.currency || '')
          .toLowerCase()
          .includes(q) ||
        String(b.financial_year || '')
          .toLowerCase()
          .includes(q)
    );
  }, [businesses, orgSearch, activeBusiness?.id]);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-16">
      {/* ambient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-40 dark:opacity-25"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute right-1/4 top-24 h-56 w-56 rounded-full bg-blue-400/15 blur-[90px]" />
      </div>

      <div ref={formTopRef} className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 pt-2 pb-8 text-sm" aria-label="Breadcrumb">
          <Link
            to="/dashboard"
            className="font-medium text-text-secondary transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <ChevronRight size={14} className="text-text-secondary/60 shrink-0" aria-hidden />
          <span className="font-semibold text-text">Organizations</span>
        </nav>

        {/* Hero */}
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10">
              <Building2 size={28} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm backdrop-blur-sm">
                <Sparkles size={12} className="text-primary" aria-hidden />
                Workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Organizations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                Legal entities you keep on the ledger. Owners can add organizations; tax and fiscal
                settings drive statement labels and defaults.
              </p>
            </div>
          </div>

          {businesses.length > 0 && (
            <div className="flex flex-wrap items-stretch gap-3 lg:justify-end">
              <div className="rounded-2xl border border-border bg-surface/90 px-5 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-2xl font-bold tabular-nums text-text">{businesses.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Organizations
                </p>
              </div>
              {activeBusiness && (
                <div className="max-w-[14rem] rounded-2xl border border-primary/25 bg-primary/10 px-5 py-3 shadow-sm backdrop-blur-sm">
                  <p className="truncate text-sm font-bold text-text" title={activeBusiness.name}>
                    {activeBusiness.name}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                    Active workspace
                  </p>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Form column */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/90 shadow-2xl shadow-slate-900/10 ring-1 ring-border/50 backdrop-blur-md dark:bg-surface/95 dark:shadow-black/40">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="border-b border-border/80 bg-gradient-to-b from-bg/50 to-transparent px-6 py-5 sm:px-8 sm:py-6">
                <h2 className="text-lg font-bold text-text sm:text-xl">Add organization</h2>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  Required fields are marked with <span className="font-semibold text-error">*</span>
                </p>
              </div>

              <div className="p-6 sm:p-8">
                {formStatus && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mb-8 rounded-2xl border p-4 text-sm font-medium shadow-sm sm:p-5 ${
                      formStatus === 'success'
                        ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
                        : formStatus === 'validation'
                          ? 'border-amber-200/80 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50'
                          : 'border-red-200/80 bg-red-50/90 text-red-950 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {formStatus === 'success' ? (
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={20} />
                      ) : (
                        <AlertCircle className="mt-0.5 shrink-0" size={20} />
                      )}
                      <div className="min-w-0 space-y-4">
                        <p>{formMessage}</p>
                        {formStatus === 'success' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard/accounts')}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover hover:shadow-lg"
                            >
                              Chart of accounts <ArrowRight size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard')}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 bg-white/80 px-4 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-white dark:border-emerald-400/20 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-950/70"
                            >
                              <LayoutDashboard size={14} /> Dashboard
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-10" noValidate>
                  <div className="rounded-2xl border border-border/80 bg-bg/40 p-5 sm:p-6 dark:bg-slate-950/30">
                    <SectionLabel icon={Building2}>Organization profile</SectionLabel>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="business-legal-name" className="input-label">
                          Legal name <span className="text-error">*</span>
                        </label>
                        <input
                          id="business-legal-name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearSuccessOnEdit();
                            if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: undefined }));
                          }}
                          className={`input-field transition-shadow ${fieldErrors.name ? 'border-error ring-2 ring-error/25' : 'hover:border-text-secondary/30'}`}
                          placeholder="e.g. Acme Holdings LLC"
                          autoComplete="organization"
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby="hint-legal-name"
                        />
                        <p id="hint-legal-name" className="text-xs leading-relaxed text-text-secondary">
                          As it should appear on financial statements and exports.
                        </p>
                        {fieldErrors.name && (
                          <p className="text-xs font-semibold text-error" role="alert">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="business-country" className="input-label">
                            Country &amp; framework <span className="text-error">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="business-country"
                              value={country}
                              onChange={(e) => {
                                const next = e.target.value;
                                setCountry(next);
                                setCurrency(countryDefaultCurrency(next));
                                clearSuccessOnEdit();
                              }}
                              className="input-field min-h-[3rem] cursor-pointer appearance-none pr-10 text-sm hover:border-text-secondary/30 sm:text-[0.9375rem]"
                              title="Country and reporting framework"
                            >
                              <option value="USA">United States (GAAP)</option>
                              <option value="EU">European Union (IFRS)</option>
                              <option value="India">India (IND-AS)</option>
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                              size={18}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="business-currency" className="input-label">
                            Base currency <span className="text-error">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="business-currency"
                              value={currency}
                              onChange={(e) => {
                                setCurrency(e.target.value);
                                clearSuccessOnEdit();
                              }}
                              className="input-field min-h-[3rem] cursor-pointer appearance-none pr-10 text-sm hover:border-text-secondary/30 sm:text-[0.9375rem]"
                            >
                              <option value="USD">USD — US Dollar ($)</option>
                              <option value="EUR">EUR — Euro (€)</option>
                              <option value="INR">INR — Indian Rupee (₹)</option>
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                              size={18}
                            />
                          </div>
                          {currencyDiffersFromRegionDefault && (
                            <p className="flex gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-relaxed text-text-secondary">
                              <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                              Base currency differs from the usual default for this region. Use this
                              only if books are intentionally kept in another currency.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-bg/40 p-5 sm:p-6 dark:bg-slate-950/30">
                    <SectionLabel icon={Hash}>Registration &amp; fiscal calendar</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="business-tax-id" className="input-label">
                          {taxLabel} <span className="text-error">*</span>
                        </label>
                        <input
                          id="business-tax-id"
                          type="text"
                          value={taxId}
                          onChange={(e) => {
                            setTaxId(e.target.value);
                            clearSuccessOnEdit();
                            if (fieldErrors.taxId) setFieldErrors((f) => ({ ...f, taxId: undefined }));
                          }}
                          className={`input-field uppercase transition-shadow ${fieldErrors.taxId ? 'border-error ring-2 ring-error/25' : 'hover:border-text-secondary/30'}`}
                          placeholder={country === 'USA' ? '12-3456789' : 'Tax registration'}
                          autoComplete="off"
                          aria-invalid={Boolean(fieldErrors.taxId)}
                          aria-describedby="hint-tax-id"
                        />
                        <p id="hint-tax-id" className="text-xs leading-relaxed text-text-secondary">
                          {taxHint(country)}
                        </p>
                        {fieldErrors.taxId && (
                          <p className="text-xs font-semibold text-error" role="alert">
                            {fieldErrors.taxId}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="business-fin-year" className="input-label">
                          Fiscal year <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="business-fin-year"
                            value={finYear}
                            onChange={(e) => {
                              setFinYear(e.target.value);
                              clearSuccessOnEdit();
                            }}
                            className="input-field min-h-[3rem] cursor-pointer appearance-none pr-10 text-sm hover:border-text-secondary/30 sm:text-[0.9375rem]"
                          >
                            <option value="Jan-Dec">January – December</option>
                            <option value="Apr-Mar">April – March</option>
                            <option value="Jul-Jun">July – June</option>
                            <option value="Oct-Sep">October – September</option>
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                            size={18}
                          />
                        </div>
                        <p className="flex gap-2 text-xs leading-relaxed text-text-secondary">
                          <CalendarRange size={14} className="mt-0.5 shrink-0 text-primary/80" />
                          Drives default reporting periods and year-end labels in exports.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary group relative w-full overflow-hidden py-4 text-sm font-bold shadow-xl shadow-primary/25 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Creating…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Create organization
                        <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Organizations column — bounded height + scroll for many orgs (e.g. 20+) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 z-10 flex max-h-[min(72vh,calc(100vh-6.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface/90 shadow-xl shadow-slate-900/10 ring-1 ring-border/50 backdrop-blur-md dark:bg-surface/95 dark:shadow-black/40">
              <div className="shrink-0 border-b border-border/80 bg-gradient-to-b from-bg/40 to-transparent px-6 py-5 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-text sm:text-xl">Your organizations</h2>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
                      The selected organization is used across accounts, transactions, and reports.
                      Tax identifiers are partially hidden on this screen.
                    </p>
                  </div>
                  {businesses.length > 0 && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                      {businesses.length}
                    </span>
                  )}
                </div>

                {businesses.length >= 6 && (
                  <div className="relative mt-4">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      size={16}
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder="Search by name, region, or currency…"
                      className="input-field w-full py-2.5 pl-10 pr-3 text-sm"
                      aria-label="Filter organizations"
                    />
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-5 sm:px-8 sm:py-6">
                {businesses.length === 0 ? (
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border/90 bg-gradient-to-b from-bg/60 to-transparent p-10 text-center dark:from-slate-900/40">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                      <Globe2 size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-base font-bold text-text">No organizations yet</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-text-secondary">
                      Add your first legal entity to unlock accounts, journal entries, and
                      reporting for that workspace.
                    </p>
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="btn-primary mt-8 px-8 py-3 text-sm font-bold"
                    >
                      Get started
                    </button>
                  </div>
                ) : sortedFilteredBusinesses.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-bg/50 px-4 py-8 text-center text-sm text-text-secondary dark:bg-slate-950/25">
                    No organizations match <span className="font-semibold text-text">“{orgSearch.trim()}”</span>.
                    <button
                      type="button"
                      onClick={() => setOrgSearch('')}
                      className="mt-3 block w-full text-xs font-bold text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <ul className="m-0 list-none space-y-3 p-0 sm:space-y-4">
                    {sortedFilteredBusinesses.map((b) => {
                      const isActive = activeBusiness?.id === b.id;
                      return (
                        <li key={b.id}>
                          <div
                            className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
                              isActive
                                ? 'border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md ring-1 ring-primary/20'
                                : 'border-border bg-bg/50 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg dark:bg-slate-950/25'
                            }`}
                          >
                            {isActive && (
                              <div
                                className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-primary/20 blur-2xl"
                                aria-hidden
                              />
                            )}
                            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:mb-2">
                                  <h3 className="truncate text-sm font-bold text-text sm:text-base">
                                    {b.name}
                                  </h3>
                                  {isActive && (
                                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                      Active
                                    </span>
                                  )}
                                  <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                                    {b.country}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-text-secondary">
                                  <span className="tabular-nums">{b.currency}</span>
                                  <span className="text-border">·</span>
                                  <span>FY {b.financial_year}</span>
                                </div>
                                <div className="mt-2 font-mono text-[11px] tracking-wide text-text-secondary sm:mt-3 sm:text-xs">
                                  Tax ID{' '}
                                  <span className="font-semibold text-text">{maskTaxId(b.tax_id)}</span>
                                </div>
                              </div>
                              {!isActive && (
                                <button
                                  type="button"
                                  onClick={() => setActiveBusinessId(b.id)}
                                  className="shrink-0 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text shadow-sm transition hover:border-primary hover:bg-primary/5 hover:text-primary sm:py-2.5"
                                >
                                  Set as active
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {businesses.length > 1 && (
                <div className="shrink-0 border-t border-border/80 bg-bg/30 px-6 py-2.5 text-center text-[10px] font-medium text-text-secondary dark:bg-slate-950/40">
                  Showing {sortedFilteredBusinesses.length} of {businesses.length}
                  {orgSearch.trim() ? ' (filtered)' : ''}
                  {' · '}
                  Active workspace pinned to top
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
