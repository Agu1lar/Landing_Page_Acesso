'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import * as z from 'zod';
import { QuoteFormSchema, rentalPeriodOptions } from '@/validations/quote';

type QuoteFormProps = {
  initialEquipment?: {
    slug: string;
    name: string;
  };
  origin?: string;
};

const periodLabels: Record<(typeof rentalPeriodOptions)[number], string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
  ainda_nao_sei: 'Ainda não sei',
};

export function QuoteForm({ initialEquipment, origin = 'site-orcamento' }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(QuoteFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      equipmentSlug: initialEquipment?.slug ?? '',
      equipmentName: initialEquipment?.name ?? '',
      rentalPeriod: '',
      city: '',
      message: '',
      origin,
      website: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof QuoteFormSchema>) => {
    setServerError(null);

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok) {
      setServerError(body.error ?? 'Não foi possível enviar. Tente novamente ou use o WhatsApp.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 p-6 text-center"
        role="status"
      >
        <p className="font-heading text-lg font-semibold text-neutral-900">Pedido enviado!</p>
        <p className="mt-2 text-sm text-neutral-600">
          Recebemos sua solicitação. Nossa equipe comercial retorna em horário útil ({brand.hours}
          ).
        </p>
        <Button
          className="mt-6"
          href={buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-orcamento-pos-form' }))}
          variant="whatsapp"
        >
          Falar no WhatsApp agora
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Input
        autoComplete="name"
        error={errors.name?.message}
        label="Nome completo *"
        {...register('name')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          autoComplete="email"
          error={errors.email?.message}
          label="E-mail *"
          type="email"
          {...register('email')}
        />
        <Input
          autoComplete="tel"
          error={errors.phone?.message}
          label="Telefone / WhatsApp *"
          placeholder="(31) 99999-9999"
          type="tel"
          {...register('phone')}
        />
      </div>
      <Input
        autoComplete="organization"
        error={errors.company?.message}
        label="Empresa (opcional)"
        {...register('company')}
      />
      <Input
        error={errors.city?.message}
        label="Cidade da obra *"
        placeholder="Ex.: Belo Horizonte, Contagem…"
        {...register('city')}
      />

      {initialEquipment ? (
        <div className="rounded-lg bg-primary-light px-4 py-3 text-sm text-neutral-800">
          Equipamento de interesse: <strong>{initialEquipment.name}</strong>
          <input type="hidden" {...register('equipmentSlug')} />
          <input type="hidden" {...register('equipmentName')} />
        </div>
      ) : (
        <Input
          error={errors.equipmentName?.message}
          label="Equipamento de interesse (opcional)"
          placeholder="Ex.: plataforma elevatória, betoneira…"
          {...register('equipmentName')}
        />
      )}

      <Select error={errors.rentalPeriod?.message} label="Período de locação" {...register('rentalPeriod')}>
        <option value="">Selecione…</option>
        {rentalPeriodOptions.map((value) => (
          <option key={value} value={value}>
            {periodLabels[value as keyof typeof periodLabels]}
          </option>
        ))}
      </Select>

      <Textarea
        error={errors.message?.message}
        label="Mensagem (opcional)"
        placeholder="Detalhes da obra, altura necessária, prazo…"
        {...register('message')}
      />

      <input
        aria-hidden
        autoComplete="off"
        className="hidden"
        tabIndex={-1}
        type="text"
        {...register('website')}
      />
      <input type="hidden" {...register('origin')} />

      {serverError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      ) : null}

      <p className="text-xs text-neutral-500">
        Ao enviar, você concorda em ser contatado pela {brand.name} sobre esta solicitação. Seus
        dados são usados apenas para o orçamento (LGPD).
      </p>

      <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit" variant="primary">
        {isSubmitting ? 'Enviando…' : 'Enviar solicitação de orçamento'}
      </Button>
    </form>
  );
}
