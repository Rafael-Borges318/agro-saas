import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { onboardingService } from '../../services/onboarding.service';
import { ROUTES } from '../../utils/constants';
import {
  ESTADOS_BR,
  TIPO_PRODUCAO,
  PRODUCAO_VEGETAL,
  PRODUCAO_ANIMAL,
  OBJETIVOS_PRODUTOR,
  type TipoProducao,
} from '@shared/constants';

/* ─── Progress bar ─── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1">
          <div
            className={[
              'h-1.5 rounded-full transition-all duration-300',
              i < step
                ? 'bg-primary-500'
                : i === step
                ? 'bg-primary-300'
                : 'bg-gray-100',
            ].join(' ')}
          />
        </div>
      ))}
      <span className="text-xs font-semibold text-gray-400 shrink-0">{step + 1}/{total}</span>
    </div>
  );
}

/* ─── Phone mask ─── */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/* ─── Reusable UI primitives ─── */
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
    />
  );
}

/* ─── Segmented control for production type ─── */
function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-150',
            value === opt
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Multi-select chip grid ─── */
function ChipGrid({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt],
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={[
            'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150',
            selected.includes(opt)
              ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Summary row ─── */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

/* ─── Error banner ─── */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600 font-medium">
      {message}
    </div>
  );
}

/* ─── Form state ─── */
interface FormState {
  // Step 1
  telefone: string;
  estado: string;
  cidade: string;
  // Step 2 — property
  nomePropriedade: string;
  municipio: string;
  areaHectares: string;
  // Step 2 — production profile
  tipoProducao: TipoProducao | '';
  producoesVegetais: string[];
  producoesAnimais: string[];
  objetivoPrincipal: string;
}

const INITIAL_FORM: FormState = {
  telefone: '',
  estado: '',
  cidade: '',
  nomePropriedade: '',
  municipio: '',
  areaHectares: '',
  tipoProducao: '',
  producoesVegetais: [],
  producoesAnimais: [],
  objetivoPrincipal: '',
};

const STEP_TITLES = ['Suas informações', 'Perfil produtivo', 'Resumo'];
const STEP_SUBS = [
  'Como podemos te localizar e contatar?',
  'Conta sobre sua propriedade e atividade',
  'Confirme seus dados antes de continuar',
];

/* ─── Main component ─── */
export function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const { setAuth, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get('plano') ?? 'gratuito';

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showVegetal = form.tipoProducao === 'Vegetal' || form.tipoProducao === 'Misto';
  const showAnimal = form.tipoProducao === 'Animal' || form.tipoProducao === 'Misto';

  /* ── Step handlers ── */
  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!form.estado || !form.cidade) {
      setError('Preencha estado e cidade.');
      return;
    }
    setError('');
    setStep(1);
  };

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nomePropriedade || !form.municipio || !form.areaHectares) {
      setError('Preencha o nome da propriedade, município e área.');
      return;
    }
    if (!form.tipoProducao) {
      setError('Selecione o tipo de produção principal.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await onboardingService.complete({
        telefone: form.telefone || undefined,
        estado: form.estado,
        cidade: form.cidade,
        nomePropriedade: form.nomePropriedade,
        municipio: form.municipio,
        areaHectares: parseFloat(form.areaHectares),
        tipoProducao: form.tipoProducao || undefined,
        producoesVegetais: form.producoesVegetais as never,
        producoesAnimais: form.producoesAnimais as never,
        objetivoPrincipal: (form.objetivoPrincipal || undefined) as never,
      });
      if (user && token) setAuth({ ...user, ...data.data }, token);
      navigate(`${ROUTES.PLANOS}?plano=${planSlug}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao salvar dados. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const back = (toStep: number) => { setError(''); setStep(toStep); };

  /* ── Summary content ── */
  const summaryLines: { label: string; value: string }[] = [
    { label: 'Localização', value: `${form.cidade} — ${form.estado}` },
    ...(form.telefone ? [{ label: 'WhatsApp', value: form.telefone }] : []),
    { label: 'Propriedade', value: form.nomePropriedade },
    { label: 'Área', value: `${form.areaHectares} ha · ${form.municipio}` },
    ...(form.tipoProducao ? [{ label: 'Tipo de produção', value: form.tipoProducao }] : []),
    ...(form.producoesVegetais.length > 0
      ? [{ label: 'Produção vegetal', value: form.producoesVegetais.join(', ') }]
      : []),
    ...(form.producoesAnimais.length > 0
      ? [{ label: 'Produção animal', value: form.producoesAnimais.join(', ') }]
      : []),
    ...(form.objetivoPrincipal ? [{ label: 'Objetivo', value: form.objetivoPrincipal }] : []),
  ];

  return (
    <div className="min-h-dvh bg-hero-gradient flex flex-col items-center justify-center px-4 py-10">
      {/* Background orbs */}
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <span className="font-bold text-gray-900 text-base">Agro Controle</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8">
          <ProgressBar step={step} total={3} />

          {/* Step header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-1">
              Passo {step + 1} de 3
            </p>
            <h1 className="text-xl font-bold text-gray-900">{STEP_TITLES[step]}</h1>
            <p className="text-sm text-gray-500 mt-1">{STEP_SUBS[step]}</p>
          </div>

          {/* ──────────── STEP 1 — Contact & location ──────────── */}
          {step === 0 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <Field label="WhatsApp" hint="Opcional — para alertas importantes">
                <TextInput
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => update('telefone', maskPhone(e.target.value))}
                  placeholder="(65) 99999-9999"
                  maxLength={15}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Estado *">
                  <SelectInput
                    value={form.estado}
                    onChange={(e) => update('estado', e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Cidade *">
                  <TextInput
                    value={form.cidade}
                    onChange={(e) => update('cidade', e.target.value)}
                    placeholder="Ex: Cuiabá"
                    required
                  />
                </Field>
              </div>

              {error && <ErrorBanner message={error} />}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 shadow-sm transition-all duration-200 active:scale-[0.97] mt-2"
              >
                Próximo →
              </button>
            </form>
          )}

          {/* ──────────── STEP 2 — Productive profile ──────────── */}
          {step === 1 && (
            <form onSubmit={handleStep2} className="space-y-5">
              {/* Property */}
              <Field label="Nome da propriedade *">
                <TextInput
                  value={form.nomePropriedade}
                  onChange={(e) => update('nomePropriedade', e.target.value)}
                  placeholder="Ex: Fazenda Boa Esperança"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Município *">
                  <TextInput
                    value={form.municipio}
                    onChange={(e) => update('municipio', e.target.value)}
                    placeholder="Ex: Cuiabá"
                    required
                  />
                </Field>
                <Field label="Área total *" hint="em hectares">
                  <TextInput
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.areaHectares}
                    onChange={(e) => update('areaHectares', e.target.value)}
                    placeholder="Ex: 500"
                    required
                  />
                </Field>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Atividade produtiva
                </p>

                {/* Production type */}
                <Field label="Tipo de produção principal *">
                  <div className="mt-1">
                    <SegmentedControl
                      options={TIPO_PRODUCAO}
                      value={form.tipoProducao}
                      onChange={(v) => update('tipoProducao', v as TipoProducao)}
                    />
                  </div>
                </Field>
              </div>

              {/* Vegetal productions */}
              {showVegetal && (
                <Field
                  label="Produções vegetais"
                  hint="Selecione as culturas que você produz"
                >
                  <div className="mt-1">
                    <ChipGrid
                      options={PRODUCAO_VEGETAL}
                      selected={form.producoesVegetais}
                      onChange={(v) => update('producoesVegetais', v)}
                    />
                  </div>
                </Field>
              )}

              {/* Animal productions */}
              {showAnimal && (
                <Field
                  label="Produções animais"
                  hint="Selecione as atividades pecuárias"
                >
                  <div className="mt-1">
                    <ChipGrid
                      options={PRODUCAO_ANIMAL}
                      selected={form.producoesAnimais}
                      onChange={(v) => update('producoesAnimais', v)}
                    />
                  </div>
                </Field>
              )}

              {/* Main objective */}
              <Field label="Objetivo principal" hint="Opcional">
                <SelectInput
                  value={form.objetivoPrincipal}
                  onChange={(e) => update('objetivoPrincipal', e.target.value)}
                >
                  <option value="">Selecione um objetivo</option>
                  {OBJETIVOS_PRODUTOR.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </SelectInput>
              </Field>

              {error && <ErrorBanner message={error} />}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => back(0)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all duration-200"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 shadow-sm transition-all duration-200 active:scale-[0.97]"
                >
                  Próximo →
                </button>
              </div>
            </form>
          )}

          {/* ──────────── STEP 3 — Summary & finish ──────────── */}
          {step === 2 && (
            <div>
              {/* Success icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary-500">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Tudo certo!</h2>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-xs mx-auto">
                Confirme seus dados antes de continuar para a escolha do plano.
              </p>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-5 space-y-3">
                {summaryLines.map(({ label, value }) => (
                  <SummaryRow key={label} label={label} value={value} />
                ))}
              </div>

              {error && <ErrorBanner message={error} />}

              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-base hover:bg-primary-600 shadow-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Salvando...' : 'Escolher meu plano →'}
              </button>

              <button
                type="button"
                onClick={() => back(1)}
                className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                ← Editar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
