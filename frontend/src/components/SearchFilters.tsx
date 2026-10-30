'use client';
import { useState } from 'react';
import type { Subject } from '@/types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

export interface Filters {
  subject: string; city: string; locality: string; minFee: string; maxFee: string;
  teachingMode: string; minExperience: string; sort: string;
}
export const DEFAULT_SORT = 'createdAt,desc';

export function SearchFilters({ initial, subjects, onApply, onClear }: {
  initial: Filters; subjects: Subject[]; onApply: (f: Filters) => void; onClear: () => void;
}) {
  const [f, setF] = useState(initial);
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onApply(f); }} className="space-y-4 rounded-2xl bg-white p-5 shadow-card" aria-label="Search filters">
      <div>
        <Input label="Subject" list="subject-options" placeholder="Search or pick a subject" value={f.subject} onChange={set('subject')} />
        <datalist id="subject-options">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>
      </div>
      <Input label="City" placeholder="e.g. Vijayawada" value={f.city} onChange={set('city')} />
      <Input label="Locality" placeholder="e.g. Benz Circle" value={f.locality} onChange={set('locality')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Min fee (₹)" type="number" min={0} value={f.minFee} onChange={set('minFee')} />
        <Input label="Max fee (₹)" type="number" min={0} value={f.maxFee} onChange={set('maxFee')} />
      </div>
      <Select label="Teaching mode" value={f.teachingMode} onChange={set('teachingMode')}>
        <option value="">Any</option><option value="HOME">Home Tuition</option><option value="ONLINE">Online</option>
      </Select>
      <Select label="Experience" value={f.minExperience} onChange={set('minExperience')}>
        <option value="">Any</option><option value="1">1+ years</option><option value="3">3+ years</option><option value="5">5+ years</option><option value="10">10+ years</option>
      </Select>
      <Select label="Sort by" value={f.sort} onChange={set('sort')}>
        <option value={DEFAULT_SORT}>Newest</option>
        <option value="hourlyFee,asc">Fee: low to high</option>
        <option value="hourlyFee,desc">Fee: high to low</option>
        <option value="experienceYears,desc">Experience: most first</option>
      </Select>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Apply</Button>
        <Button type="button" variant="secondary" onClick={onClear}>Clear Filters</Button>
      </div>
    </form>
  );
}
