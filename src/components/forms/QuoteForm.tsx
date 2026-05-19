'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { brand } from '@/lib/brand';
import * as z from 'zod';
import { QuoteFormSchema, rentalPeriodOptions } from '@/validations/quote';

type QuoteFormProps = {
  initialEquipment?: {
    slug: string;
    name: string;
  };
  origin?: string;
  onSuccess?: () => void;
};

const periodLabels: Record<(typeof rentalPeriodOptions)[number], string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
  ainda_nao_sei: 'Ainda não sei',
};

export function QuoteForm(props: QuoteFormProps) {
  const origin = props.origin ?? 'site-orcamento';
  const cart = useQuoteCart();
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
      equipmentSlug: '',
      equipmentName: '',
      rentalPeriod: '',
      city: '',
      message: '',
      origin,
      website: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof QuoteFormSchema>) => {
    setServerError(null);

    const cartItems =
      cart.items.length > 0
        ? cart.items
        : props.initialEquipment
          ? [
              {
                slug: props.initialEquipment.slug,
                name: props.initialEquipment.name,
                kind: 'equipment' as const,
              },
            ]
          : undefined;

    if (!cartItems?.length && !data.equipmentName?.trim()) {
      setServerError('Adicione itens ao orçamento no catálogo ou informe um equipamento.');
      return;
    }

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        cartItems,
        equipmentSlug: cartItems?.[0]?.slug ?? data.equipmentSlug,
        equipmentName: cartItems?.[0]?.name ?? data.equipmentName,
      }),
    });

    const body = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok) {
      setServerError(body.error ?? 'Não foi possível enviar. Tente novamente ou use o WhatsApp.');
      return;
    }

    cart.clearCart();
    setSubmitted(true);
    props.onSuccess?.();
  };

  if (submitted) {
    return (
      <div
        className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 p-6"
        role="status"
      >
        <p className="font-heading text-lg font-semibold text-neutral-900">Pedido enviado!</p>
        <p className="mt-2 text-sm text-neutral-600">
          Recebemos sua solicitação. Nossa equipe comercial retorna em horário útil ({brand.hours}
          ) com valores, disponibilidade e prazo.
        </p>
        <p className="mt-4 text-sm text-neutral-600">
          Urgente? Ligue{' '}
          <a className="font-medium text-primary hover:underline" href={`tel:+${brand.phone}`}>
            {brand.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  const showManualEquipment = cart.count === 0 && !props.initialEquipment;

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

      {props.initialEquipment && cart.count === 0 ? (
        <div className="rounded-lg bg-primary-light px-4 py-3 text-sm text-neutral-800">
          Equipamento desta página: <strong>{props.initialEquipment.name}</strong> (será incluído se
          você não montar uma lista no carrinho).
        </div>
      ) : null}

      {showManualEquipment ? (
        <Input
          error={errors.equipmentName?.message}
          label="Equipamento de interesse (se não usou o carrinho)"
          placeholder="Ex.: plataforma elevatória, betoneira…"
          {...register('equipmentName')}
        />
      ) : null}

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
        Ao enviar, você concorda em ser contatado pela {brand.name} sobre esta solicitação. Valores e
        condições comerciais serão informados pela equipe (LGPD).
      </p>

      <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit" variant="primary">
        {isSubmitting ? 'Enviando…' : 'Enviar solicitação de orçamento'}
      </Button>
    </form>
  );
}
