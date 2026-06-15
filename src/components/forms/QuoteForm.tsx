'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { QuoteFormOptionalSection } from '@/components/forms/QuoteFormOptionalSection';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { readStoredAttribution } from '@/lib/attribution';
import { brand } from '@/lib/brand';
import { captureQuoteSubmit } from '@/lib/posthog-events';
import { buildQuoteWhatsAppUrl } from '@/lib/quote-whatsapp';
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
  const [whatsappRetryUrl, setWhatsappRetryUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const resolveCartItems = () => {
    if (cart.items.length > 0) {
      return cart.items;
    }
    if (props.initialEquipment) {
      return [
        {
          slug: props.initialEquipment.slug,
          name: props.initialEquipment.name,
          kind: 'equipment' as const,
          quantity: 1,
        },
      ];
    }
    return undefined;
  };

  const submitLead = async (data: z.infer<typeof QuoteFormSchema>) => {
    setServerError(null);
    setIsSubmitting(true);

    const cartItems = resolveCartItems();

    if (!cartItems?.length && !data.equipmentName?.trim()) {
      setServerError('Adicione itens ao orçamento no catálogo ou informe um equipamento.');
      setIsSubmitting(false);
      return;
    }

    const attribution = readStoredAttribution();

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        cartItems,
        equipmentSlug: cartItems?.[0]?.slug ?? data.equipmentSlug,
        equipmentName: cartItems?.[0]?.name ?? data.equipmentName,
        attribution: attribution ?? undefined,
      }),
    });

    const body = (await response.json()) as {
      error?: string;
      ok?: boolean;
      id?: number;
      whatsappUrl?: string;
    };

    if (!response.ok) {
      setServerError(body.error ?? 'Não foi possível registrar. Tente novamente.');
      setIsSubmitting(false);
      return;
    }

    captureQuoteSubmit({
      origin,
      leadId: body.id,
      cartLineCount: cartItems?.length ?? 0,
      equipmentSlug: cartItems?.[0]?.slug ?? data.equipmentSlug,
      equipmentName: cartItems?.[0]?.name ?? data.equipmentName,
    });

    const whatsappUrl =
      body.whatsappUrl ??
      buildQuoteWhatsAppUrl({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() ?? undefined,
        city: data.city.trim(),
        rentalPeriod: data.rentalPeriod?.trim() ?? undefined,
        message: data.message?.trim() ?? undefined,
        cartItems,
        equipmentName: cartItems?.[0]?.name ?? data.equipmentName?.trim(),
        origin,
      });

    setWhatsappRetryUrl(whatsappUrl);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    cart.clearCart();
    setSubmitted(true);
    setIsSubmitting(false);
    props.onSuccess?.();
  };

  if (submitted) {
    return (
      <div
        className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 p-6"
        role="status"
      >
        <p className="font-heading text-lg font-semibold text-neutral-900">Quase pronto!</p>
        <p className="mt-2 text-sm text-neutral-600">
          O WhatsApp comercial deve ter aberto com sua mensagem em seu nome. Toque em{' '}
          <strong>Enviar</strong> no WhatsApp para concluir — a equipe recebe pelo atendimento
          automático do canal.
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Também registramos sua solicitação internamente para controle da {brand.name}. Retorno em
          horário útil ({brand.hours}).
        </p>
        {whatsappRetryUrl ? (
          <p className="mt-4 text-sm text-neutral-600">
            O WhatsApp não abriu?{' '}
            <a
              className="font-medium text-primary hover:underline"
              href={whatsappRetryUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir WhatsApp com sua mensagem
            </a>{' '}
            · Urgente:{' '}
            <a className="font-medium text-primary hover:underline" href={`tel:+${brand.phone}`}>
              {brand.phoneDisplay}
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  const showManualEquipment = cart.lineCount === 0 && !props.initialEquipment;

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(submitLead)}>
      <Input
        autoComplete="name"
        error={errors.name?.message}
        label="Nome completo *"
        {...register('name')}
      />
      <Input
        autoComplete="tel"
        error={errors.phone?.message}
        inputMode="tel"
        label="Telefone / WhatsApp *"
        placeholder="(31) 99999-9999"
        type="tel"
        {...register('phone')}
      />
      <Input
        error={errors.city?.message}
        label="Cidade da obra *"
        placeholder="Ex.: Belo Horizonte, Contagem…"
        {...register('city')}
      />
      <Input
        autoComplete="email"
        error={errors.email?.message}
        label="E-mail *"
        type="email"
        {...register('email')}
      />

      {props.initialEquipment && cart.lineCount === 0 ? (
        <div className="rounded-lg bg-primary-light px-4 py-3 text-sm text-neutral-800">
          Equipamento desta página: <strong>{props.initialEquipment.name}</strong> (será incluído se
          você não montar uma lista no carrinho).
        </div>
      ) : null}

      <QuoteFormOptionalSection summary="Empresa, período e observações (opcional)">
        <Input
          autoComplete="organization"
          error={errors.company?.message}
          label="Empresa (opcional)"
          {...register('company')}
        />

        {showManualEquipment ? (
          <Input
            error={errors.equipmentName?.message}
            label="Equipamento de interesse (se não usou o carrinho)"
            placeholder="Ex.: plataforma elevatória, betoneira…"
            {...register('equipmentName')}
          />
        ) : null}

        <Select
          error={errors.rentalPeriod?.message}
          label="Período de locação"
          {...register('rentalPeriod')}
        >
          <option value="">Selecione…</option>
          {rentalPeriodOptions.map((value) => (
            <option key={value} value={value}>
              {periodLabels[value]}
            </option>
          ))}
        </Select>

        <Textarea
          error={errors.message?.message}
          label="Mensagem (opcional)"
          placeholder="Detalhes da obra, altura necessária, prazo…"
          {...register('message')}
        />
      </QuoteFormOptionalSection>

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
        Ao continuar, sua solicitação é registrada para a equipe (e-mail interno) e você envia o
        orçamento pelo WhatsApp em seu nome. Dados tratados conforme LGPD.
      </p>

      <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit" variant="whatsapp">
        {isSubmitting ? 'Registrando…' : 'Enviar orçamento pelo WhatsApp'}
      </Button>
    </form>
  );
}
