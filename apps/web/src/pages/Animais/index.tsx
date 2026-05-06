import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useAnimaisStore } from '../../store/animais.store';
import type {
  Animal,
  AnimalEspecie,
  AnimalEventoTipo,
  AnimalSexo,
  AnimalStatus,
  CreateAnimalData,
  CreateEventoData,
} from '../../types';

/* ─── Constants ─────────────────────────────────────────────────────────── */

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

/* ─── Peso centavos input ────────────────────────────────────────────────── */
// stores value as integer decigrams (×10) to keep 1 decimal place via integer math

function fmtKg(dg: number) {
  return (dg / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function WeightInput({
  value,
  onChange,
  placeholder = '0,0',
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  const display = value === 0 ? '' : fmtKg(value);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.key >= '0' && e.key <= '9') {
      onChange(Math.min(value * 10 + parseInt(e.key), 9999990));
    } else if (e.key === 'Backspace') {
      onChange(Math.floor(value / 10));
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      placeholder={placeholder}
      onKeyDown={handleKey}
      onChange={() => {}}
      className="input caret-transparent"
    />
  );
}

/* ─── SVG Weight Chart ───────────────────────────────────────────────────── */

function WeightChart({ animal }: { animal: Animal }) {
  const pesagens = (animal.eventos ?? [])
    .filter((e) => e.tipo === 'PESAGEM' && e.valor != null)
    .slice(0, 10)
    .reverse();

  if (pesagens.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        Registre ao menos 2 pesagens para ver a evolução.
      </p>
    );
  }

  const values = pesagens.map((e) => e.valor as number);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const W = 300;
  const H = 80;
  const PAD = 10;

  const pts = pesagens.map((e, i) => {
    const x = PAD + (i / (pesagens.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - ((e.valor as number) - minV) / range) * (H - PAD * 2);
    return { x, y, v: e.valor as number, d: e.data };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ height: 100 }}>
      <polyline
        points={polyline}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
          <text
            x={p.x}
            y={H + 16}
            textAnchor="middle"
            fontSize={8}
            fill="#9ca3af"
          >
            {fmtDate(p.d).slice(0, 5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Pill filter ────────────────────────────────────────────────────────── */

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

/* ─── Animal Form Modal ──────────────────────────────────────────────────── */

interface AnimalFormState {
  propriedadeId: string;
  nome: string;
  numeroIdentificacao: string;
  especie: AnimalEspecie;
  raca: string;
  sexo: AnimalSexo;
  dataNascimento: string;
  pesoKgDg: number; // decigrams for WeightInput
  status: AnimalStatus;
  observacoes: string;
}

const EMPTY_ANIMAL_FORM: AnimalFormState = {
  propriedadeId: '',
  nome: '',
  numeroIdentificacao: '',
  especie: 'BOVINO',
  raca: '',
  sexo: 'MACHO',
  dataNascimento: '',
  pesoKgDg: 0,
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
    pesoKgDg: a.pesoKg != null ? Math.round(a.pesoKg * 10) : 0,
    status: a.status,
    observacoes: a.observacoes ?? '',
  };
}

function AnimalModal({
  animal,
  onClose,
}: {
  animal: Animal | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AnimalFormState>(
    animal ? fromAnimal(animal) : EMPTY_ANIMAL_FORM,
  );

  const submitting = useAnimaisStore((s) => s.loading.submitting);
  const createAnimal = useAnimaisStore((s) => s.createAnimal);
  const updateAnimal = useAnimaisStore((s) => s.updateAnimal);

  function field<K extends keyof AnimalFormState>(key: K, value: AnimalFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: CreateAnimalData = {
      propriedadeId: form.propriedadeId,
      especie: form.especie,
      sexo: form.sexo,
      status: form.status,
      ...(form.nome               ? { nome: form.nome }                               : {}),
      ...(form.numeroIdentificacao ? { numeroIdentificacao: form.numeroIdentificacao } : {}),
      ...(form.raca               ? { raca: form.raca }                               : {}),
      ...(form.dataNascimento     ? { dataNascimento: form.dataNascimento }            : {}),
      ...(form.pesoKgDg > 0      ? { pesoKg: form.pesoKgDg / 10 }                    : {}),
      ...(form.observacoes        ? { observacoes: form.observacoes }                 : {}),
    };

    if (animal) {
      await updateAnimal(animal.id, data);
    } else {
      await createAnimal(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {animal ? 'Editar Animal' : 'Cadastrar Animal'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {/* Propriedade ID */}
          <div>
            <label className="label">ID da Propriedade *</label>
            <input
              className="input"
              required
              placeholder="UUID da propriedade"
              value={form.propriedadeId}
              onChange={(e) => field('propriedadeId', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Espécie */}
            <div>
              <label className="label">Espécie *</label>
              <select
                className="input"
                value={form.especie}
                onChange={(e) => field('especie', e.target.value as AnimalEspecie)}
              >
                {(Object.keys(ESPECIES) as AnimalEspecie[]).map((k) => (
                  <option key={k} value={k}>{ESPECIES[k]}</option>
                ))}
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label className="label">Sexo *</label>
              <select
                className="input"
                value={form.sexo}
                onChange={(e) => field('sexo', e.target.value as AnimalSexo)}
              >
                {(Object.keys(SEXOS) as AnimalSexo[]).map((k) => (
                  <option key={k} value={k}>{SEXOS[k]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="label">Nome</label>
              <input
                className="input"
                placeholder="Ex: Mimosa"
                value={form.nome}
                onChange={(e) => field('nome', e.target.value)}
              />
            </div>

            {/* Nº Identificação */}
            <div>
              <label className="label">Nº Identificação</label>
              <input
                className="input"
                placeholder="Ex: 0042"
                value={form.numeroIdentificacao}
                onChange={(e) => field('numeroIdentificacao', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Raça */}
            <div>
              <label className="label">Raça</label>
              <input
                className="input"
                placeholder="Ex: Nelore"
                value={form.raca}
                onChange={(e) => field('raca', e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => field('status', e.target.value as AnimalStatus)}
              >
                {(Object.keys(STATUSES) as AnimalStatus[]).map((k) => (
                  <option key={k} value={k}>{STATUSES[k]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data nascimento */}
            <div>
              <label className="label">Data de Nascimento</label>
              <input
                type="date"
                className="input"
                value={form.dataNascimento}
                onChange={(e) => field('dataNascimento', e.target.value)}
              />
            </div>

            {/* Peso */}
            <div>
              <label className="label">Peso (kg)</label>
              <WeightInput
                value={form.pesoKgDg}
                onChange={(v) => field('pesoKgDg', v)}
                placeholder="0,0 kg"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="label">Observações</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Observações gerais..."
              value={form.observacoes}
              onChange={(e) => field('observacoes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'Salvando...' : animal ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Evento Form ────────────────────────────────────────────────────────── */

function EventoForm({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const [tipo, setTipo] = useState<AnimalEventoTipo>('OBSERVACAO');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valorDg, setValorDg] = useState(0);

  const addingEvento = useAnimaisStore((s) => s.loading.addingEvento);
  const addEvento = useAnimaisStore((s) => s.addEvento);

  const needsValor = tipo === 'PESAGEM' || tipo === 'VENDA';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: CreateEventoData = {
      tipo,
      descricao,
      data,
      ...(needsValor && valorDg > 0 ? { valor: valorDg / 10 } : {}),
    };
    await addEvento(animal.id, payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Registrar Evento — {animal.nome || `#${animal.numeroIdentificacao || animal.id.slice(0, 8)}`}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Tipo *</label>
            <select
              className="input"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as AnimalEventoTipo)}
            >
              {(Object.keys(EVENTO_TIPOS) as AnimalEventoTipo[]).map((k) => (
                <option key={k} value={k}>{EVENTO_TIPOS[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data *</label>
            <input
              type="date"
              className="input"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Descrição *</label>
            <textarea
              className="input resize-none"
              rows={3}
              required
              placeholder={
                tipo === 'PESAGEM'   ? 'Ex: Pesagem mensal de rotina' :
                tipo === 'VACINACAO' ? 'Ex: Vacina contra febre aftosa' :
                tipo === 'VENDA'     ? 'Ex: Venda para frigorífico XYZ' :
                'Descreva o evento...'
              }
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {needsValor && (
            <div>
              <label className="label">
                {tipo === 'PESAGEM' ? 'Peso (kg)' : 'Valor (R$)'}
              </label>
              <WeightInput value={valorDg} onChange={setValorDg} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!addingEvento}
              className="btn btn-primary flex-1"
            >
              {addingEvento ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Animal Card ────────────────────────────────────────────────────────── */

function AnimalCard({
  animal,
  onEdit,
  onEvento,
  onSelect,
  selected,
}: {
  animal: Animal;
  onEdit: (a: Animal) => void;
  onEvento: (a: Animal) => void;
  onSelect: (a: Animal) => void;
  selected: boolean;
}) {
  const deleting = useAnimaisStore((s) => s.loading.deleting);
  const removeAnimal = useAnimaisStore((s) => s.removeAnimal);
  const loadEventos = useAnimaisStore((s) => s.loadEventos);
  const loadingEventos = useAnimaisStore((s) => s.loading.eventos);

  function toggleSelect() {
    onSelect(animal);
    if (!selected && !animal.eventos) {
      loadEventos(animal.id);
    }
  }

  const displayName = animal.nome || `#${animal.numeroIdentificacao || animal.id.slice(0, 8)}`;
  const idade = calcIdade(animal.dataNascimento);

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
        selected ? 'border-blue-500 shadow-blue-100' : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={toggleSelect}
      >
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
          <p className="text-xs text-gray-400 mt-0.5">
            {fmtWeight(animal.pesoKg)}
            {animal.pesoKg && <span className="ml-1 opacity-70">último peso</span>}
          </p>
        </div>
        <span className="text-gray-400 text-sm select-none">{selected ? '▲' : '▼'}</span>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEvento(animal)}
          className="btn btn-outline text-xs py-1 px-3 flex-1"
        >
          + Evento
        </button>
        <button
          type="button"
          onClick={() => onEdit(animal)}
          className="btn btn-outline text-xs py-1 px-3"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={deleting === animal.id}
          onClick={() => {
            if (confirm(`Remover ${displayName}? Esta ação não pode ser desfeita.`)) {
              removeAnimal(animal.id);
            }
          }}
          className="btn btn-outline text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50"
        >
          {deleting === animal.id ? '...' : 'Excluir'}
        </button>
      </div>

      {/* Expanded: eventos + chart */}
      {selected && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Weight chart */}
          {(animal.eventos ?? []).some((e) => e.tipo === 'PESAGEM') && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Evolução de Peso</p>
              <WeightChart animal={animal} />
            </div>
          )}

          {/* Eventos list */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Histórico de Eventos</p>
            {loadingEventos === animal.id ? (
              <p className="text-xs text-gray-400 text-center py-4">Carregando...</p>
            ) : (animal.eventos ?? []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Nenhum evento registrado.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(animal.eventos ?? []).map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${EVENTO_COLORS[ev.tipo]}`}
                    >
                      {EVENTO_TIPOS[ev.tipo]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 leading-snug truncate">{ev.descricao}</p>
                      <p className="text-gray-400">
                        {fmtDate(ev.data)}
                        {ev.valor != null && (
                          <span className="ml-2 font-medium text-gray-600">
                            {ev.tipo === 'PESAGEM'
                              ? fmtWeight(ev.valor)
                              : fmt(ev.valor)}
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
      )}
    </div>
  );
}

/* ─── Stats Cards ────────────────────────────────────────────────────────── */

function StatsSection() {
  const stats = useAnimaisStore((s) => s.stats);
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
          {stats.total > 0
            ? `${Math.round((stats.ativos / stats.total) * 100)}% do rebanho`
            : '—'}
        </p>
      </div>
      <div className="card">
        <p className="text-xs text-gray-500">Peso Médio</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">
          {stats.pesoMedio != null
            ? `${stats.pesoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
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
  const selectedId    = useAnimaisStore((s) => s.selectedAnimalId);
  const fetchAll      = useAnimaisStore((s) => s.fetchAll);
  const fetchList     = useAnimaisStore((s) => s.fetchList);
  const setFilter     = useAnimaisStore((s) => s.setFilter);
  const resetFilters  = useAnimaisStore((s) => s.resetFilters);
  const selectAnimal  = useAnimaisStore((s) => s.selectAnimal);
  const clearMessages = useAnimaisStore((s) => s.clearMessages);

  const [modalAnimal, setModalAnimal] = useState<Animal | null | 'new'>(null);
  const [eventoAnimal, setEventoAnimal] = useState<Animal | null>(null);

  const initializedRef = useRef(false);

  // Initial load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchAll();
  }, [fetchAll]);

  // Re-fetch list when filters change
  useEffect(() => {
    const tid = setTimeout(() => fetchList(), filters.search ? 400 : 0);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.especie, filters.status, filters.search, filters.orderBy, filters.order]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!error && !success) return;
    const tid = setTimeout(clearMessages, 4000);
    return () => clearTimeout(tid);
  }, [error, success, clearMessages]);

  function handleSelect(a: Animal) {
    selectAnimal(selectedId === a.id ? null : a.id);
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
        <button
          type="button"
          onClick={() => setModalAnimal('new')}
          className="btn btn-primary self-start sm:self-auto"
        >
          + Cadastrar Animal
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Stats */}
      <StatsSection />

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <input
          type="text"
          className="input"
          placeholder="Buscar por nome ou nº de identificação..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />

        {/* Espécie pills */}
        <div className="flex gap-2 flex-wrap">
          <Pill
            label="Todas espécies"
            active={!filters.especie}
            onClick={() => setFilter('especie', undefined)}
          />
          {especies.map((e) => (
            <Pill
              key={e}
              label={`${ESPECIE_EMOJI[e]} ${ESPECIES[e]}`}
              active={filters.especie === e}
              onClick={() => setFilter('especie', filters.especie === e ? undefined : e)}
            />
          ))}
        </div>

        {/* Status pills + sort */}
        <div className="flex gap-2 flex-wrap items-center">
          <Pill
            label="Todos status"
            active={!filters.status}
            onClick={() => setFilter('status', undefined)}
          />
          {statuses.map((s) => (
            <Pill
              key={s}
              label={STATUSES[s]}
              active={filters.status === s}
              onClick={() => setFilter('status', filters.status === s ? undefined : s)}
            />
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              className="input py-1 text-xs"
              value={filters.orderBy}
              onChange={(e) =>
                setFilter('orderBy', e.target.value as 'nome' | 'pesoKg' | 'dataNascimento' | 'createdAt')
              }
            >
              <option value="createdAt">Data cadastro</option>
              <option value="nome">Nome</option>
              <option value="pesoKg">Peso</option>
              <option value="dataNascimento">Nascimento</option>
            </select>
            <button
              type="button"
              className="btn btn-outline py-1 px-3 text-xs"
              onClick={() => setFilter('order', filters.order === 'asc' ? 'desc' : 'asc')}
            >
              {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
            <button
              type="button"
              className="btn btn-outline py-1 px-3 text-xs"
              onClick={resetFilters}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {listLoading && animais.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-50" />
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
            <button
              type="button"
              onClick={() => setModalAnimal('new')}
              className="btn btn-primary"
            >
              + Cadastrar Animal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {animais.map((a) => (
            <AnimalCard
              key={a.id}
              animal={a}
              selected={selectedId === a.id}
              onEdit={(animal) => setModalAnimal(animal)}
              onEvento={(animal) => setEventoAnimal(animal)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalAnimal !== null && (
        <AnimalModal
          animal={modalAnimal === 'new' ? null : modalAnimal}
          onClose={() => setModalAnimal(null)}
        />
      )}

      {eventoAnimal !== null && (
        <EventoForm
          animal={eventoAnimal}
          onClose={() => setEventoAnimal(null)}
        />
      )}
    </div>
  );
}
