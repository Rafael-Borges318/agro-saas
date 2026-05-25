import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useAnimaisStore } from '../../store/animais.store';
import { propriedadesService } from '../../services/propriedades.service';
import { vacinasService } from '../../services/vacinas.service';
import { pesagensService } from '../../services/pesagens.service';
import { reproducaoService } from '../../services/reproducao.service';
import type {
  Animal,
  AnimalEspecie,
  AnimalEventoTipo,
  AnimalSexo,
  AnimalStatus,
  CreateAnimalData,
  CreateEventoData,
  CreatePesagemData,
  CreateReproducaoData,
  CreateVacinaData,
  Pesagem,
  Propriedade,
  Reproducao,
  ReproducaoStatus,
  ReproducaoUpcoming,
  UpdateReproducaoData,
  UpdateVacinaData,
  Vacina,
  VacinaUpcoming,
} from '../../types';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ESPECIES: Record<AnimalEspecie, string> = {
  BOVINO:  'Bovino',
  SUINO:   'Suíno',
  AVICOLA: 'Avícola',
  OVINO:   'Ovino',
  CAPRINO: 'Caprino',
  EQUINO:  'Equino',
  OUTRO:   'Outro',
};

const SEXOS: Record<AnimalSexo, string> = {
  MACHO: 'Macho',
  FEMEA: 'Fêmea',
};

const STATUSES: Record<AnimalStatus, string> = {
  ATIVO:       'Ativo',
  VENDIDO:     'Vendido',
  MORTO:       'Morto',
  TRANSFERIDO: 'Transferido',
};

const EVENTO_TIPOS: Record<AnimalEventoTipo, string> = {
  PESAGEM:    'Pesagem',
  VACINACAO:  'Vacinação',
  VENDA:      'Venda',
  DOENCA:     'Doença',
  REPRODUCAO: 'Reprodução',
  OBSERVACAO: 'Observação',
};

const ESPECIE_EMOJI: Record<AnimalEspecie, string> = {
  BOVINO:  '🐄',
  SUINO:   '🐷',
  AVICOLA: '🐔',
  OVINO:   '🐑',
  CAPRINO: '🐐',
  EQUINO:  '🐴',
  OUTRO:   '🐾',
};

const STATUS_COLORS: Record<AnimalStatus, string> = {
  ATIVO:       'bg-green-100 text-green-800',
  VENDIDO:     'bg-blue-100 text-blue-800',
  MORTO:       'bg-gray-100 text-gray-600',
  TRANSFERIDO: 'bg-yellow-100 text-yellow-800',
};

const EVENTO_COLORS: Record<AnimalEventoTipo, string> = {
  PESAGEM:    'bg-blue-100 text-blue-700',
  VACINACAO:  'bg-green-100 text-green-700',
  VENDA:      'bg-purple-100 text-purple-700',
  DOENCA:     'bg-red-100 text-red-700',
  REPRODUCAO: 'bg-pink-100 text-pink-700',
  OBSERVACAO: 'bg-gray-100 text-gray-700',
};

const REPRO_STATUS_LABELS: Record<ReproducaoStatus, string> = {
  PRENHA:           'Prenha',
  PARTO_REALIZADO:  'Parto Realizado',
  VAZIA:            'Vazia',
};

const REPRO_STATUS_COLORS: Record<ReproducaoStatus, string> = {
  PRENHA:           'bg-pink-100 text-pink-700',
  PARTO_REALIZADO:  'bg-green-100 text-green-700',
  VAZIA:            'bg-gray-100 text-gray-600',
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function fmtWeight(kg: number | null | undefined) {
  if (kg == null) return '—';
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
}

function calcIdade(dataNascimento: string | null | undefined) {
  if (!dataNascimento) return null;
  const born = new Date(dataNascimento);
  const now = new Date();
  const months =
    (now.getFullYear() - born.getFullYear()) * 12 +
    (now.getMonth() - born.getMonth());
  if (months < 12) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}a ${rem}m` : `${years}a`;
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    }).response;
    if (r?.data?.errors) {
      const first = Object.values(r.data.errors).flat().find(Boolean);
      if (first) return first;
    }
    if (r?.data?.message) return r.data.message;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

function animalLabel(a: { nome?: string | null; numeroIdentificacao?: string | null; id: string }) {
  return a.nome || (a.numeroIdentificacao ? `#${a.numeroIdentificacao}` : a.id.slice(0, 8));
}

/* ─── Small reusable components ──────────────────────────────────────────── */

function NumInput({
  value,
  onChange,
  placeholder,
  step = '0.01',
  min = '0',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    />
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      {msg}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-xs text-gray-400 text-center py-6">{text}</p>;
}

/* ─── Weight chart ───────────────────────────────────────────────────────── */

function WeightChart({ pesagens }: { pesagens: Pesagem[] }) {
  const data = [...pesagens].reverse().slice(-12);
  if (data.length < 2) return <EmptyState text="Registre ao menos 2 pesagens para ver a evolução." />;

  const values = data.map((p) => p.pesoKg);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const W = 300;
  const H = 80;
  const PAD = 10;

  const pts = data.map((p, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (p.pesoKg - minV) / range) * (H - PAD * 2),
    v: p.pesoKg,
    d: p.dataPesagem,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ height: 100 }}>
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
          <text x={p.x} y={H + 16} textAnchor="middle" fontSize={8} fill="#9ca3af">
            {fmtDate(p.d).slice(0, 5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Geral Tab ──────────────────────────────────────────────────────────── */

function GeralTab({ animal, onAddEvento }: { animal: Animal; onAddEvento: () => void }) {
  const loadEventos = useAnimaisStore((s) => s.loadEventos);
  const loadingEventos = useAnimaisStore((s) => s.loading.eventos);

  useEffect(() => {
    if (!animal.eventos) loadEventos(animal.id);
  }, [animal.id, animal.eventos, loadEventos]);

  const idade = calcIdade(animal.dataNascimento);

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ['Espécie', `${ESPECIE_EMOJI[animal.especie]} ${ESPECIES[animal.especie]}`],
          ['Sexo', SEXOS[animal.sexo]],
          ['Status', STATUSES[animal.status]],
          ['Raça', animal.raca || '—'],
          ['Idade', idade || '—'],
          ['Peso atual', fmtWeight(animal.pesoKg)],
          ['Nascimento', animal.dataNascimento ? fmtDate(animal.dataNascimento) : '—'],
          ['Identificação', animal.numeroIdentificacao || '—'],
        ].map(([label, val]) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-800 mt-0.5 text-sm">{val}</p>
          </div>
        ))}
      </div>

      {animal.observacoes && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-gray-500 mb-1">Observações</p>
          <p className="text-gray-700">{animal.observacoes}</p>
        </div>
      )}

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Histórico de Eventos</p>
          <button type="button" onClick={onAddEvento} className="btn btn-outline text-xs py-1 px-3">
            + Evento
          </button>
        </div>

        {loadingEventos === animal.id ? (
          <EmptyState text="Carregando..." />
        ) : (animal.eventos ?? []).length === 0 ? (
          <EmptyState text="Nenhum evento registrado." />
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(animal.eventos ?? []).map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${EVENTO_COLORS[ev.tipo]}`}>
                  {EVENTO_TIPOS[ev.tipo]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{ev.descricao}</p>
                  <p className="text-gray-400">
                    {fmtDate(ev.data)}
                    {ev.valor != null && (
                      <span className="ml-2 font-medium text-gray-600">
                        {ev.tipo === 'PESAGEM' ? fmtWeight(ev.valor) : fmt(ev.valor)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Vacinação Tab ──────────────────────────────────────────────────────── */

function VacinacaoTab({ animalId }: { animalId: string }) {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editVacina, setEditVacina] = useState<Vacina | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [nomeVacina, setNomeVacina] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().slice(0, 10));
  const [proximaDose, setProximaDose] = useState('');
  const [observacoes, setObs] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    vacinasService.list(animalId)
      .then(setVacinas)
      .catch(() => setError('Erro ao carregar vacinas.'))
      .finally(() => setLoading(false));
  }, [animalId]);

  function openForm(v?: Vacina) {
    if (v) {
      setEditVacina(v);
      setNomeVacina(v.nomeVacina);
      setDataAplicacao(v.dataAplicacao.split('T')[0]);
      setProximaDose(v.proximaDose ? v.proximaDose.split('T')[0] : '');
      setObs(v.observacoes ?? '');
    } else {
      setEditVacina(null);
      setNomeVacina('');
      setDataAplicacao(new Date().toISOString().slice(0, 10));
      setProximaDose('');
      setObs('');
    }
    setFormError('');
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditVacina(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nomeVacina.trim()) { setFormError('Nome da vacina é obrigatório.'); return; }
    setFormError('');
    setSubmitting(true);
    const data: CreateVacinaData = {
      nomeVacina: nomeVacina.trim(),
      dataAplicacao,
      ...(proximaDose           ? { proximaDose }                         : {}),
      ...(observacoes.trim()    ? { observacoes: observacoes.trim() }     : {}),
    };
    try {
      if (editVacina) {
        const updated = await vacinasService.update(animalId, editVacina.id, data as UpdateVacinaData);
        setVacinas((prev) => prev.map((v) => (v.id === editVacina.id ? updated : v)));
      } else {
        const created = await vacinasService.create(animalId, data);
        setVacinas((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(v: Vacina) {
    if (!confirm(`Remover vacina "${v.nomeVacina}"?`)) return;
    setDeleting(v.id);
    try {
      await vacinasService.remove(animalId, v.id);
      setVacinas((prev) => prev.filter((x) => x.id !== v.id));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <EmptyState text="Carregando..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner msg={error} />}

      <div className="flex justify-end">
        <button type="button" onClick={() => openForm()} className="btn btn-primary text-sm py-1.5 px-4">
          + Registrar Vacina
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          <p className="text-sm font-semibold text-blue-800">
            {editVacina ? 'Editar Vacina' : 'Nova Vacina'}
          </p>
          {formError && <ErrorBanner msg={formError} />}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Nome da Vacina *</label>
                <input className="input" placeholder="Ex: Febre Aftosa" value={nomeVacina}
                  onChange={(e) => setNomeVacina(e.target.value)} />
              </div>
              <div>
                <label className="label">Data Aplicação *</label>
                <input type="date" className="input" value={dataAplicacao}
                  onChange={(e) => setDataAplicacao(e.target.value)} />
              </div>
              <div>
                <label className="label">Próxima Dose</label>
                <input type="date" className="input" value={proximaDose}
                  onChange={(e) => setProximaDose(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea className="input resize-none" rows={2} value={observacoes}
                  onChange={(e) => setObs(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={closeForm} className="btn btn-outline flex-1 text-sm py-1.5">
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary flex-1 text-sm py-1.5">
                {submitting ? 'Salvando...' : editVacina ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {vacinas.length === 0 ? (
        <EmptyState text="Nenhuma vacina registrada." />
      ) : (
        <div className="space-y-2">
          {vacinas.map((v) => (
            <div key={v.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-3 bg-white">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-900">{v.nomeVacina}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Aplicada: {fmtDate(v.dataAplicacao)}
                  {v.proximaDose && <span className="ml-2 text-yellow-700">Próx.: {fmtDate(v.proximaDose)}</span>}
                </p>
                {v.observacoes && <p className="text-xs text-gray-400 mt-0.5 truncate">{v.observacoes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button type="button" onClick={() => openForm(v)}
                  className="text-xs text-blue-600 hover:underline px-1">Editar</button>
                <button type="button" disabled={deleting === v.id} onClick={() => handleRemove(v)}
                  className="text-xs text-red-500 hover:underline px-1">
                  {deleting === v.id ? '...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Peso Tab ───────────────────────────────────────────────────────────── */

function PesoTab({ animalId }: { animalId: string }) {
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [peso, setPeso] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState('');
  const [atualizarPeso, setAtualizarPeso] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadPesagens = useCallback(() => {
    setLoading(true);
    pesagensService.list(animalId)
      .then(setPesagens)
      .catch(() => setError('Erro ao carregar pesagens.'))
      .finally(() => setLoading(false));
  }, [animalId]);

  useEffect(() => { loadPesagens(); }, [loadPesagens]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const kg = parseFloat(peso);
    if (isNaN(kg) || kg <= 0) { setFormError('Informe um peso válido.'); return; }
    setFormError('');
    setSubmitting(true);
    const payload: CreatePesagemData = {
      pesoKg: kg,
      dataPesagem: data,
      atualizarPeso,
      ...(obs.trim() ? { observacoes: obs.trim() } : {}),
    };
    try {
      const created = await pesagensService.create(animalId, payload);
      setPesagens((prev) => [created, ...prev]);
      setPeso('');
      setObs('');
      setShowForm(false);
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(p: Pesagem) {
    if (!confirm(`Remover pesagem de ${fmtWeight(p.pesoKg)}?`)) return;
    setDeleting(p.id);
    try {
      await pesagensService.remove(animalId, p.id);
      setPesagens((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <EmptyState text="Carregando..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner msg={error} />}

      {/* Chart */}
      {pesagens.length >= 2 && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Evolução de Peso</p>
          <WeightChart pesagens={pesagens} />
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={() => setShowForm((v) => !v)} className="btn btn-primary text-sm py-1.5 px-4">
          {showForm ? '✕ Fechar' : '+ Registrar Pesagem'}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          {formError && <ErrorBanner msg={formError} />}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Peso (kg) *</label>
                <NumInput value={peso} onChange={setPeso} placeholder="Ex: 450.75" />
              </div>
              <div>
                <label className="label">Data *</label>
                <input type="date" className="input" value={data}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <input className="input" placeholder="Ex: Pesagem mensal" value={obs}
                  onChange={(e) => setObs(e.target.value)} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="atualizar" checked={atualizarPeso}
                  onChange={(e) => setAtualizarPeso(e.target.checked)}
                  className="w-4 h-4 rounded" />
                <label htmlFor="atualizar" className="text-sm text-gray-700 cursor-pointer">
                  Atualizar peso atual do animal
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline flex-1 text-sm py-1.5">
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary flex-1 text-sm py-1.5">
                {submitting ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {pesagens.length === 0 ? (
        <EmptyState text="Nenhuma pesagem registrada." />
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {pesagens.map((p) => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 bg-white">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{fmtWeight(p.pesoKg)}</p>
                <p className="text-xs text-gray-500">
                  {fmtDate(p.dataPesagem)}
                  {p.observacoes && <span className="ml-2">{p.observacoes}</span>}
                </p>
              </div>
              <button type="button" disabled={deleting === p.id} onClick={() => handleRemove(p)}
                className="text-xs text-red-500 hover:underline px-1 shrink-0">
                {deleting === p.id ? '...' : 'Excluir'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Reprodução Tab ─────────────────────────────────────────────────────── */

function ReproducaoTab({ animalId }: { animalId: string }) {
  const [reproducoes, setRepros] = useState<Reproducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editRepro, setEditRepro] = useState<Reproducao | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [dataCobertura, setDataCobertura] = useState(new Date().toISOString().slice(0, 10));
  const [dataPrevistaParto, setDataPrev] = useState('');
  const [dataPartoReal, setDataReal] = useState('');
  const [status, setStatus] = useState<ReproducaoStatus>('PRENHA');
  const [qtFilhos, setQtFilhos] = useState('');
  const [obs, setObs] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    reproducaoService.list(animalId)
      .then(setRepros)
      .catch(() => setError('Erro ao carregar reprodução.'))
      .finally(() => setLoading(false));
  }, [animalId]);

  function openForm(r?: Reproducao) {
    if (r) {
      setEditRepro(r);
      setDataCobertura(r.dataCobertura.split('T')[0]);
      setDataPrev(r.dataPrevistaParto ? r.dataPrevistaParto.split('T')[0] : '');
      setDataReal(r.dataPartoReal ? r.dataPartoReal.split('T')[0] : '');
      setStatus(r.status);
      setQtFilhos(r.quantidadeFilhos != null ? String(r.quantidadeFilhos) : '');
      setObs(r.observacoes ?? '');
    } else {
      setEditRepro(null);
      setDataCobertura(new Date().toISOString().slice(0, 10));
      setDataPrev('');
      setDataReal('');
      setStatus('PRENHA');
      setQtFilhos('');
      setObs('');
    }
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    const payload: CreateReproducaoData = {
      dataCobertura,
      status,
      ...(dataPrevistaParto ? { dataPrevistaParto } : {}),
      ...(dataPartoReal     ? { dataPartoReal }     : {}),
      ...(qtFilhos !== ''   ? { quantidadeFilhos: parseInt(qtFilhos, 10) } : {}),
      ...(obs.trim()        ? { observacoes: obs.trim() } : {}),
    };
    try {
      if (editRepro) {
        const updated = await reproducaoService.update(animalId, editRepro.id, payload as UpdateReproducaoData);
        setRepros((prev) => prev.map((r) => (r.id === editRepro.id ? updated : r)));
      } else {
        const created = await reproducaoService.create(animalId, payload);
        setRepros((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditRepro(null);
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(r: Reproducao) {
    if (!confirm('Remover este registro de reprodução?')) return;
    setDeleting(r.id);
    try {
      await reproducaoService.remove(animalId, r.id);
      setRepros((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <EmptyState text="Carregando..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner msg={error} />}

      <div className="flex justify-end">
        <button type="button" onClick={() => openForm()} className="btn btn-primary text-sm py-1.5 px-4">
          + Registrar
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border border-pink-200 rounded-xl p-4 bg-pink-50 space-y-3">
          <p className="text-sm font-semibold text-pink-800">
            {editRepro ? 'Editar Registro' : 'Novo Registro de Reprodução'}
          </p>
          {formError && <ErrorBanner msg={formError} />}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Data da Cobertura *</label>
                <input type="date" className="input" value={dataCobertura}
                  onChange={(e) => setDataCobertura(e.target.value)} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={status}
                  onChange={(e) => setStatus(e.target.value as ReproducaoStatus)}>
                  <option value="PRENHA">Prenha</option>
                  <option value="PARTO_REALIZADO">Parto Realizado</option>
                  <option value="VAZIA">Vazia</option>
                </select>
              </div>
              <div>
                <label className="label">Prev. Parto</label>
                <input type="date" className="input" value={dataPrevistaParto}
                  onChange={(e) => setDataPrev(e.target.value)} />
              </div>
              <div>
                <label className="label">Data Parto Real</label>
                <input type="date" className="input" value={dataPartoReal}
                  onChange={(e) => setDataReal(e.target.value)} />
              </div>
              <div>
                <label className="label">Qtd. Filhos</label>
                <NumInput value={qtFilhos} onChange={setQtFilhos} placeholder="0" step="1" />
              </div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea className="input resize-none" rows={2} value={obs}
                  onChange={(e) => setObs(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowForm(false); setEditRepro(null); }}
                className="btn btn-outline flex-1 text-sm py-1.5">Cancelar</button>
              <button type="submit" disabled={submitting} className="btn btn-primary flex-1 text-sm py-1.5">
                {submitting ? 'Salvando...' : editRepro ? 'Atualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {reproducoes.length === 0 ? (
        <EmptyState text="Nenhum registro de reprodução." />
      ) : (
        <div className="space-y-2">
          {reproducoes.map((r) => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-3 bg-white">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REPRO_STATUS_COLORS[r.status]}`}>
                      {REPRO_STATUS_LABELS[r.status]}
                    </span>
                    <span className="text-xs text-gray-500">Cobertura: {fmtDate(r.dataCobertura)}</span>
                    {r.dataPrevistaParto && (
                      <span className="text-xs text-yellow-700">Prev. parto: {fmtDate(r.dataPrevistaParto)}</span>
                    )}
                    {r.dataPartoReal && (
                      <span className="text-xs text-green-700">Parto: {fmtDate(r.dataPartoReal)}</span>
                    )}
                    {r.quantidadeFilhos != null && (
                      <span className="text-xs text-gray-600">{r.quantidadeFilhos} filhos</span>
                    )}
                  </div>
                  {r.parceiro && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Parceiro: {animalLabel(r.parceiro)} ({ESPECIES[r.parceiro.especie as AnimalEspecie] ?? r.parceiro.especie})
                    </p>
                  )}
                  {r.observacoes && <p className="text-xs text-gray-400 mt-0.5 truncate">{r.observacoes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => openForm(r)}
                    className="text-xs text-blue-600 hover:underline px-1">Editar</button>
                  <button type="button" disabled={deleting === r.id} onClick={() => handleRemove(r)}
                    className="text-xs text-red-500 hover:underline px-1">
                    {deleting === r.id ? '...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Animal Detail Modal ────────────────────────────────────────────────── */

type DetailTab = 'geral' | 'vacinas' | 'peso' | 'reproducao';

function AnimalDetailModal({
  animal,
  onClose,
  onEdit,
  onEvento,
}: {
  animal: Animal;
  onClose: () => void;
  onEdit: () => void;
  onEvento: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>('geral');
  const removeAnimal = useAnimaisStore((s) => s.removeAnimal);
  const deleting = useAnimaisStore((s) => s.loading.deleting);

  const displayName = animalLabel(animal);

  const tabs: { id: DetailTab; label: string; hide?: boolean }[] = [
    { id: 'geral',     label: 'Geral' },
    { id: 'vacinas',   label: 'Vacinação' },
    { id: 'peso',      label: 'Peso' },
    { id: 'reproducao', label: 'Reprodução', hide: animal.sexo !== 'FEMEA' },
  ];

  async function handleRemove() {
    if (!confirm(`Remover ${displayName}? Esta ação não pode ser desfeita.`)) return;
    await removeAnimal(animal.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b flex items-start gap-3">
          <span className="text-3xl select-none">{ESPECIE_EMOJI[animal.especie]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[animal.status]}`}>
                {STATUSES[animal.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {ESPECIES[animal.especie]}{animal.raca ? ` · ${animal.raca}` : ''} · {SEXOS[animal.sexo]}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={onEdit} className="btn btn-outline text-xs py-1 px-3">Editar</button>
            <button
              type="button"
              disabled={deleting === animal.id}
              onClick={handleRemove}
              className="btn btn-outline text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50"
            >
              {deleting === animal.id ? '...' : 'Excluir'}
            </button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-1">✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b px-5 gap-1 overflow-x-auto">
          {tabs.filter((t) => !t.hide).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'geral'      && <GeralTab animal={animal} onAddEvento={onEvento} />}
          {tab === 'vacinas'    && <VacinacaoTab animalId={animal.id} />}
          {tab === 'peso'       && <PesoTab animalId={animal.id} />}
          {tab === 'reproducao' && animal.sexo === 'FEMEA' && <ReproducaoTab animalId={animal.id} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Animal Form Modal ──────────────────────────────────────────────────── */

interface AnimalFormState {
  propriedadeId: string;
  nome: string;
  numeroIdentificacao: string;
  especie: AnimalEspecie;
  raca: string;
  sexo: AnimalSexo;
  dataNascimento: string;
  pesoKg: string;
  status: AnimalStatus;
  observacoes: string;
}

const EMPTY_FORM: AnimalFormState = {
  propriedadeId: '',
  nome: '',
  numeroIdentificacao: '',
  especie: 'BOVINO',
  raca: '',
  sexo: 'MACHO',
  dataNascimento: '',
  pesoKg: '',
  status: 'ATIVO',
  observacoes: '',
};

function fromAnimal(a: Animal): AnimalFormState {
  return {
    propriedadeId: a.propriedadeId,
    nome: a.nome ?? '',
    numeroIdentificacao: a.numeroIdentificacao ?? '',
    especie: a.especie,
    raca: a.raca ?? '',
    sexo: a.sexo,
    dataNascimento: a.dataNascimento ? a.dataNascimento.split('T')[0] : '',
    pesoKg: a.pesoKg != null ? String(a.pesoKg) : '',
    status: a.status,
    observacoes: a.observacoes ?? '',
  };
}

function AnimalModal({ animal, onClose }: { animal: Animal | null; onClose: () => void }) {
  const [form, setForm] = useState<AnimalFormState>(animal ? fromAnimal(animal) : EMPTY_FORM);
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [formError, setFormError] = useState('');

  const submitting = useAnimaisStore((s) => s.loading.submitting);
  const storeError = useAnimaisStore((s) => s.error);
  const createAnimal = useAnimaisStore((s) => s.createAnimal);
  const updateAnimal = useAnimaisStore((s) => s.updateAnimal);

  useEffect(() => {
    propriedadesService.list()
      .then((list) => {
        setPropriedades(list);
        if (!animal && list.length === 1) {
          setForm((f) => ({ ...f, propriedadeId: list[0].id }));
        }
      })
      .catch(() => {/* non-critical */})
      .finally(() => setLoadingProps(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function field<K extends keyof AnimalFormState>(key: K, value: AnimalFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormError('');
  }

  function validate(): string {
    if (!form.propriedadeId) return 'Selecione uma propriedade.';
    if (!form.especie)       return 'Selecione a espécie.';
    if (!form.sexo)          return 'Selecione o sexo.';
    const peso = parseFloat(form.pesoKg);
    if (form.pesoKg && (isNaN(peso) || peso <= 0)) return 'Peso deve ser um número positivo.';
    return '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    const pesoNum = parseFloat(form.pesoKg);
    const data: CreateAnimalData = {
      propriedadeId:       form.propriedadeId,
      especie:             form.especie,
      sexo:                form.sexo,
      status:              form.status,
      ...(form.nome               ? { nome: form.nome }                               : {}),
      ...(form.numeroIdentificacao ? { numeroIdentificacao: form.numeroIdentificacao } : {}),
      ...(form.raca               ? { raca: form.raca }                               : {}),
      ...(form.dataNascimento     ? { dataNascimento: form.dataNascimento }            : {}),
      ...(!isNaN(pesoNum) && pesoNum > 0 ? { pesoKg: pesoNum }                        : {}),
      ...(form.observacoes        ? { observacoes: form.observacoes }                 : {}),
    };

    const ok = animal ? await updateAnimal(animal.id, data) : await createAnimal(data);
    if (ok) onClose();
  }

  const noProp = !loadingProps && propriedades.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {animal ? 'Editar Animal' : 'Cadastrar Animal'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {(formError || storeError) && <ErrorBanner msg={formError || storeError!} />}

          {noProp && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
              Você não possui propriedades cadastradas. Cadastre uma propriedade antes de adicionar animais.
            </div>
          )}

          {/* Propriedade selector */}
          <div>
            <label className="label">Propriedade *</label>
            {loadingProps ? (
              <div className="input text-gray-400 animate-pulse">Carregando...</div>
            ) : propriedades.length === 1 ? (
              <div className="input bg-gray-50 text-gray-700 cursor-default">
                {propriedades[0].nome} — {propriedades[0].municipio}/{propriedades[0].estado}
              </div>
            ) : (
              <select className="input" required value={form.propriedadeId}
                onChange={(e) => field('propriedadeId', e.target.value)}>
                <option value="">Selecione uma propriedade</option>
                {propriedades.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} — {p.municipio}/{p.estado}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Espécie *</label>
              <select className="input" value={form.especie}
                onChange={(e) => field('especie', e.target.value as AnimalEspecie)}>
                <option value="BOVINO">Bovino</option>
                <option value="SUINO">Suíno</option>
                <option value="AVICOLA">Avícola</option>
                <option value="OVINO">Ovino</option>
                <option value="CAPRINO">Caprino</option>
                <option value="EQUINO">Equino</option>
                <option value="OUTRO">Outro (Piscicultura, Apicultura…)</option>
              </select>
            </div>
            <div>
              <label className="label">Sexo *</label>
              <select className="input" value={form.sexo}
                onChange={(e) => field('sexo', e.target.value as AnimalSexo)}>
                <option value="MACHO">Macho</option>
                <option value="FEMEA">Fêmea</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" placeholder="Ex: Mimosa" value={form.nome}
                onChange={(e) => field('nome', e.target.value)} />
            </div>
            <div>
              <label className="label">Nº Identificação</label>
              <input className="input" placeholder="Ex: 0042" value={form.numeroIdentificacao}
                onChange={(e) => field('numeroIdentificacao', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Raça</label>
              <input className="input" placeholder="Ex: Nelore" value={form.raca}
                onChange={(e) => field('raca', e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => field('status', e.target.value as AnimalStatus)}>
                <option value="ATIVO">Ativo</option>
                <option value="VENDIDO">Vendido</option>
                <option value="MORTO">Morto</option>
                <option value="TRANSFERIDO">Transferido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data de Nascimento</label>
              <input type="date" className="input" value={form.dataNascimento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => field('dataNascimento', e.target.value)} />
            </div>
            <div>
              <label className="label">Peso (kg)</label>
              <NumInput value={form.pesoKg} onChange={(v) => field('pesoKg', v)} placeholder="Ex: 450.75" />
            </div>
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea className="input resize-none" rows={3} placeholder="Observações gerais..."
              value={form.observacoes} onChange={(e) => field('observacoes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancelar</button>
            <button type="submit" disabled={submitting || noProp} className="btn btn-primary flex-1">
              {submitting ? 'Salvando...' : animal ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Evento Form Modal ──────────────────────────────────────────────────── */

function EventoForm({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const [tipo, setTipo] = useState<AnimalEventoTipo>('OBSERVACAO');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState('');
  const [formError, setFormError] = useState('');

  const addingEvento = useAnimaisStore((s) => s.loading.addingEvento);
  const storeError   = useAnimaisStore((s) => s.error);
  const addEvento    = useAnimaisStore((s) => s.addEvento);

  const needsValor = tipo === 'PESAGEM' || tipo === 'VENDA';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!descricao.trim()) { setFormError('Descrição é obrigatória.'); return; }
    const valorNum = parseFloat(valor);
    if (needsValor && valor && (isNaN(valorNum) || valorNum <= 0)) {
      setFormError(`${tipo === 'PESAGEM' ? 'Peso' : 'Valor'} deve ser positivo.`);
      return;
    }
    setFormError('');
    const payload: CreateEventoData = {
      tipo,
      descricao: descricao.trim(),
      data,
      ...(!isNaN(valorNum) && valorNum > 0 ? { valor: valorNum } : {}),
    };
    const ok = await addEvento(animal.id, payload);
    if (ok) onClose();
  }

  const displayName = animalLabel(animal);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Registrar Evento — {displayName}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(formError || storeError) && <ErrorBanner msg={formError || storeError!} />}

          <div>
            <label className="label">Tipo *</label>
            <select className="input" value={tipo}
              onChange={(e) => { setTipo(e.target.value as AnimalEventoTipo); setValor(''); }}>
              {(Object.keys(EVENTO_TIPOS) as AnimalEventoTipo[]).map((k) => (
                <option key={k} value={k}>{EVENTO_TIPOS[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data *</label>
            <input type="date" className="input" required value={data}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setData(e.target.value)} />
          </div>

          <div>
            <label className="label">Descrição *</label>
            <textarea className="input resize-none" rows={3} required
              placeholder={
                tipo === 'PESAGEM'   ? 'Ex: Pesagem mensal de rotina'  :
                tipo === 'VACINACAO' ? 'Ex: Vacina contra febre aftosa' :
                tipo === 'VENDA'     ? 'Ex: Venda para frigorífico XYZ' :
                'Descreva o evento...'
              }
              value={descricao}
              onChange={(e) => { setDescricao(e.target.value); setFormError(''); }} />
          </div>

          {needsValor && (
            <div>
              <label className="label">{tipo === 'PESAGEM' ? 'Peso (kg)' : 'Valor (R$)'}</label>
              <NumInput value={valor} onChange={(v) => { setValor(v); setFormError(''); }}
                placeholder={tipo === 'PESAGEM' ? 'Ex: 450.75' : 'Ex: 1500.00'} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancelar</button>
            <button type="submit" disabled={!!addingEvento} className="btn btn-primary flex-1">
              {addingEvento ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Alerts Banner ──────────────────────────────────────────────────────── */

function AlertsBanner() {
  const [vacUpcoming, setVacUpcoming] = useState<VacinaUpcoming[]>([]);
  const [repUpcoming, setRepUpcoming] = useState<ReproducaoUpcoming[]>([]);

  useEffect(() => {
    vacinasService.upcoming(30).then(setVacUpcoming).catch(() => {});
    reproducaoService.upcoming(14).then(setRepUpcoming).catch(() => {});
  }, []);

  if (vacUpcoming.length === 0 && repUpcoming.length === 0) return null;

  return (
    <div className="space-y-2">
      {vacUpcoming.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-yellow-800 mb-1">
            💉 {vacUpcoming.length} vacina{vacUpcoming.length > 1 ? 's' : ''} com próxima dose nos próximos 30 dias
          </p>
          <p className="text-yellow-700 text-xs">
            {vacUpcoming.slice(0, 3).map((v) =>
              `${animalLabel(v.animal)} — ${v.nomeVacina} (${fmtDate(v.proximaDose!)})`
            ).join(' · ')}
            {vacUpcoming.length > 3 && ` e mais ${vacUpcoming.length - 3}...`}
          </p>
        </div>
      )}
      {repUpcoming.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-pink-800 mb-1">
            🐄 {repUpcoming.length} parto{repUpcoming.length > 1 ? 's' : ''} previst{repUpcoming.length > 1 ? 'os' : 'o'} nos próximos 14 dias
          </p>
          <p className="text-pink-700 text-xs">
            {repUpcoming.slice(0, 3).map((r) =>
              `${animalLabel(r.animal)} (${fmtDate(r.dataPrevistaParto!)})`
            ).join(' · ')}
            {repUpcoming.length > 3 && ` e mais ${repUpcoming.length - 3}...`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Animal Card ────────────────────────────────────────────────────────── */

function AnimalCard({
  animal,
  onOpen,
}: {
  animal: Animal;
  onOpen: (a: Animal) => void;
}) {
  const displayName = animalLabel(animal);
  const idade = calcIdade(animal.dataNascimento);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onOpen(animal)}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="text-3xl select-none">{ESPECIE_EMOJI[animal.especie]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{displayName}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[animal.status]}`}>
              {STATUSES[animal.status]}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {ESPECIES[animal.especie]}{animal.raca ? ` · ${animal.raca}` : ''} · {SEXOS[animal.sexo]}
            {idade ? ` · ${idade}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtWeight(animal.pesoKg)}</p>
        </div>
        <span className="text-gray-300 text-lg select-none">›</span>
      </div>
    </div>
  );
}

/* ─── Stats Cards ────────────────────────────────────────────────────────── */

function StatsSection() {
  const stats   = useAnimaisStore((s) => s.stats);
  const loading = useAnimaisStore((s) => s.loading.stats);

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24 animate-pulse bg-gray-50" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const porEspecieEntries = Object.entries(stats.porEspecie)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="card">
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        <p className="text-xs text-gray-400 mt-0.5">animais cadastrados</p>
      </div>
      <div className="card">
        <p className="text-xs text-gray-500">Ativos</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{stats.ativos}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stats.total > 0 ? `${Math.round((stats.ativos / stats.total) * 100)}% do rebanho` : '—'}
        </p>
      </div>
      <div className="card">
        <p className="text-xs text-gray-500">Peso Médio</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">
          {stats.pesoMedio != null
            ? stats.pesoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
            : '—'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">kg (ativos)</p>
      </div>
      <div className="card">
        <p className="text-xs text-gray-500 mb-2">Por Espécie</p>
        {porEspecieEntries.length === 0 ? (
          <p className="text-xs text-gray-400">—</p>
        ) : (
          <div className="space-y-1">
            {porEspecieEntries.map(([esp, count]) => (
              <div key={esp} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {ESPECIE_EMOJI[esp as AnimalEspecie]} {ESPECIES[esp as AnimalEspecie]}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export function Animais() {
  const animais       = useAnimaisStore((s) => s.animais);
  const filters       = useAnimaisStore((s) => s.filters);
  const listLoading   = useAnimaisStore((s) => s.loading.list);
  const error         = useAnimaisStore((s) => s.error);
  const success       = useAnimaisStore((s) => s.successMessage);
  const fetchAll      = useAnimaisStore((s) => s.fetchAll);
  const fetchList     = useAnimaisStore((s) => s.fetchList);
  const setFilter     = useAnimaisStore((s) => s.setFilter);
  const resetFilters  = useAnimaisStore((s) => s.resetFilters);
  const clearMessages = useAnimaisStore((s) => s.clearMessages);

  const [modalAnimal, setModalAnimal]   = useState<Animal | null | 'new'>(null);
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null);
  const [eventoAnimal, setEventoAnimal] = useState<Animal | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const tid = setTimeout(() => fetchList(), filters.search ? 400 : 0);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.especie, filters.status, filters.search, filters.orderBy, filters.order]);

  useEffect(() => {
    if (!error && !success) return;
    const tid = setTimeout(clearMessages, 4000);
    return () => clearTimeout(tid);
  }, [error, success, clearMessages]);

  // Keep detail animal in sync with store (e.g. after edit)
  useEffect(() => {
    if (!detailAnimal) return;
    const updated = animais.find((a) => a.id === detailAnimal.id);
    if (updated) setDetailAnimal(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animais]);

  function openDetail(a: Animal) {
    setDetailAnimal(a);
  }

  const especies = Object.keys(ESPECIES) as AnimalEspecie[];
  const statuses = Object.keys(STATUSES) as AnimalStatus[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rebanho</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestão completa dos seus animais</p>
        </div>
        <button type="button" onClick={() => setModalAnimal('new')} className="btn btn-primary self-start sm:self-auto">
          + Cadastrar Animal
        </button>
      </div>

      {/* Toast messages */}
      {error && <ErrorBanner msg={error} />}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Upcoming alerts */}
      <AlertsBanner />

      {/* Stats */}
      <StatsSection />

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          className="input"
          placeholder="Buscar por nome ou nº de identificação..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          <Pill label="Todas espécies" active={!filters.especie} onClick={() => setFilter('especie', undefined)} />
          {especies.map((e) => (
            <Pill key={e} label={`${ESPECIE_EMOJI[e]} ${ESPECIES[e]}`}
              active={filters.especie === e}
              onClick={() => setFilter('especie', filters.especie === e ? undefined : e)} />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Pill label="Todos status" active={!filters.status} onClick={() => setFilter('status', undefined)} />
          {statuses.map((s) => (
            <Pill key={s} label={STATUSES[s]}
              active={filters.status === s}
              onClick={() => setFilter('status', filters.status === s ? undefined : s)} />
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              className="input py-1 text-xs"
              value={filters.orderBy}
              onChange={(e) => setFilter('orderBy', e.target.value as 'nome' | 'pesoKg' | 'dataNascimento' | 'createdAt')}
            >
              <option value="createdAt">Data cadastro</option>
              <option value="nome">Nome</option>
              <option value="pesoKg">Peso</option>
              <option value="dataNascimento">Nascimento</option>
            </select>
            <button type="button" className="btn btn-outline py-1 px-3 text-xs"
              onClick={() => setFilter('order', filters.order === 'asc' ? 'desc' : 'asc')}>
              {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
            <button type="button" className="btn btn-outline py-1 px-3 text-xs" onClick={resetFilters}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {listLoading && animais.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : animais.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-6xl">🐄</span>
          <div>
            <p className="font-semibold text-gray-700">Nenhum animal encontrado</p>
            <p className="text-sm text-gray-400 mt-1">
              {filters.search || filters.especie || filters.status
                ? 'Tente ajustar os filtros.'
                : 'Cadastre seu primeiro animal para começar.'}
            </p>
          </div>
          {!filters.search && !filters.especie && !filters.status && (
            <button type="button" onClick={() => setModalAnimal('new')} className="btn btn-primary">
              + Cadastrar Animal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {animais.map((a) => (
            <AnimalCard key={a.id} animal={a} onOpen={openDetail} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailAnimal && (
        <AnimalDetailModal
          animal={detailAnimal}
          onClose={() => setDetailAnimal(null)}
          onEdit={() => { setModalAnimal(detailAnimal); }}
          onEvento={() => setEventoAnimal(detailAnimal)}
        />
      )}

      {/* Create/edit modal */}
      {modalAnimal !== null && (
        <AnimalModal
          animal={modalAnimal === 'new' ? null : modalAnimal}
          onClose={() => setModalAnimal(null)}
        />
      )}

      {/* Evento form modal */}
      {eventoAnimal !== null && (
        <EventoForm
          animal={eventoAnimal}
          onClose={() => setEventoAnimal(null)}
        />
      )}
    </div>
  );
}
