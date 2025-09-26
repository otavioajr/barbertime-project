import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon, Check, ChevronRight, PhoneIcon, UserRound } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorText, Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AvailabilitySlot } from '@/features/availability/types';

import { useAvailability, useCreateAppointment, useServices } from '../api/hooks';
import { CalendarGrid } from './calendar-grid';
import { ConsentCheckbox } from './consent-checkbox';
import { PhoneInput } from './phone-input';
import { ServiceList } from './service-list';
import { DEFAULT_TIMEZONE } from '../constants';
import { bookingDetailsSchema, normalizePhoneNumber, type BookingDetailsInput } from '../schema';

const flowSteps = [
  { id: 'service', label: 'Serviço' },
  { id: 'slot', label: 'Horário' },
  { id: 'details', label: 'Dados' },
];

type ConfirmationState = {
  serviceName: string;
  startsAt: string;
  endsAt: string;
  customerPhone: string;
  customerName?: string;
};

export function BookingFlow(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: services = [], isLoading: servicesLoading, isError: servicesError } = useServices();

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const [availabilityDate] = useState(() => formatInTimeZone(new Date(), DEFAULT_TIMEZONE, 'yyyy-MM-dd'));

  const {
    data: availabilitySlots = [],
    isFetching: availabilityLoading,
    isError: availabilityError,
  } = useAvailability({
    serviceId: selectedServiceId,
    startDate: availabilityDate,
    days: 1,
    timezone: DEFAULT_TIMEZONE,
  });

  useEffect(() => {
    if (selectedSlotId && !availabilitySlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(null);
    }
  }, [availabilitySlots, selectedSlotId]);

  const selectedSlot = useMemo(
    () => availabilitySlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [availabilitySlots, selectedSlotId],
  );

  const form = useForm<BookingDetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      consent: false,
    },
  });

  const customerPhoneValue = form.watch('customerPhone');
  const consentValue = form.watch('consent');

  const scheduleLabel = availabilitySlots.length
    ? formatInTimeZone(new Date(availabilitySlots[0].startsAt), DEFAULT_TIMEZONE, "EEEE, d 'de' MMMM", { locale: ptBR })
    : availabilityLoading
      ? 'Carregando horários...'
      : 'Agenda indisponível no período selecionado';

  const createAppointment = useCreateAppointment();

  const isStepEnabled = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;
    if (stepIndex === 1) return Boolean(selectedServiceId);
    if (stepIndex === 2) return Boolean(selectedServiceId && selectedSlotId);
    return false;
  };

  const goToStep = (stepIndex: number) => {
    if (!isStepEnabled(stepIndex)) {
      return;
    }
    setCurrentStep(stepIndex);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSlotId(null);
    setCurrentStep(1);
    setConfirmation(null);
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlotId(slot.id);
    setCurrentStep(2);
    setConfirmation(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selectedService || !selectedSlot) {
      setServerError('Selecione um serviço e horário antes de confirmar.');
      return;
    }

    setServerError(null);

    try {
      const normalizedPhone = normalizePhoneNumber(values.customerPhone);
      const appointment = await createAppointment.mutateAsync({
        serviceId: selectedService.id,
        startsAt: selectedSlot.startsAt,
        customerName: values.customerName ?? null,
        customerPhone: normalizedPhone,
        consentGranted: true,
      });

      setConfirmation({
        serviceName: selectedService.name,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        customerName: values.customerName,
        customerPhone: normalizedPhone,
      });

      form.reset({ customerName: '', customerPhone: '', consent: false });
      setSelectedServiceId(null);
      setSelectedSlotId(null);
      setCurrentStep(0);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Não foi possível concluir o agendamento.');
    }
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Agende seu horário</h1>
        <p className="text-base text-muted-foreground">
          Siga os passos abaixo para escolher um serviço, selecionar um horário disponível e confirmar seus dados.
        </p>
      </header>

      <nav aria-label="Progresso do agendamento">
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {flowSteps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;
            const enabled = isStepEnabled(index);

            return (
              <li key={step.id} className="flex items-center gap-3">
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow'
                      : enabled
                        ? 'border-border bg-card hover:border-primary/60'
                        : 'border-dashed border-muted-foreground/40 text-muted-foreground'
                  }`}
                  onClick={() => goToStep(index)}
                  disabled={!enabled}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-semibold">
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  {step.label}
                </button>
                {index < flowSteps.length - 1 ? (
                  <ChevronRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-labelledby="step-service" hidden={currentStep !== 0} className="space-y-4">
        <div className="space-y-1">
          <h2 id="step-service" className="text-xl font-semibold">1. Escolha um serviço</h2>
          <p className="text-sm text-muted-foreground">
            Visualize duração e preço de cada serviço. Você pode alterar a escolha depois.
          </p>
        </div>
        {servicesLoading ? (
          <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
            Carregando serviços...
          </div>
        ) : servicesError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            Não foi possível carregar os serviços. Tente novamente mais tarde.
          </div>
        ) : services.length ? (
          <ServiceList services={services} selectedServiceId={selectedServiceId ?? undefined} onSelect={handleServiceSelect} />
        ) : (
          <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
            Nenhum serviço configurado ainda.
          </div>
        )}
      </section>

      <section aria-labelledby="step-slot" hidden={currentStep !== 1} className="space-y-4">
        <div className="space-y-1">
          <h2 id="step-slot" className="text-xl font-semibold">2. Selecione um horário disponível</h2>
          {selectedService ? (
            <p className="text-sm text-muted-foreground">
              Exibindo agenda para <strong>{selectedService.name}</strong>. Escolha um horário livre.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione um serviço para ver horários disponíveis.</p>
          )}
        </div>
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {scheduleLabel}
            </div>
            {selectedService ? (
              <Button variant="ghost" onClick={() => goToStep(0)}>
                Trocar serviço
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {availabilityError ? (
              <div className="rounded border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                Não foi possível carregar os horários. Tente novamente.
              </div>
            ) : availabilityLoading ? (
              <div className="rounded border border-dashed border-muted p-4 text-sm text-muted-foreground">
                Carregando horários disponíveis...
              </div>
            ) : (
              <CalendarGrid slots={availabilitySlots} selectedSlotId={selectedSlotId ?? undefined} onSelect={handleSlotSelect} />
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="step-details" hidden={currentStep !== 2} className="space-y-6">
        <div className="space-y-1">
          <h2 id="step-details" className="text-xl font-semibold">3. Confirme seus dados</h2>
          <p className="text-sm text-muted-foreground">
            Informe um telefone válido no formato internacional. Usaremos esse número para enviar notificações.
          </p>
        </div>

        {selectedService && selectedSlot ? (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Check className="h-5 w-5" /> Resumo da seleção
              </CardTitle>
              <CardDescription>
                {selectedService.name} • {format(new Date(selectedSlot.startsAt), "PPP 'às' HH:mm", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <FormProvider {...form}>
          <Form className="space-y-6" onSubmit={onSubmit}>
            <FormField name="customerName">
              {({ error }) => (
                <FormItem>
                  <FormLabel htmlFor="customerName" description="Opcional">
                    Nome
                  </FormLabel>
                  <Input id="customerName" placeholder="Nome completo" {...form.register('customerName')} />
                  <ErrorText error={error} />
                </FormItem>
              )}
            </FormField>

            <FormField name="customerPhone">
              {({ error }) => (
                <FormItem>
                  <FormLabel htmlFor="customerPhone" description="Formato internacional (ex.: +55 11 99999-9999)">
                    Telefone
                  </FormLabel>
                  <PhoneInput
                    id="customerPhone"
                    placeholder="+55 11 99999-9999"
                    value={customerPhoneValue}
                    onChange={(phone) => form.setValue('customerPhone', phone, { shouldValidate: true })}
                    aria-invalid={Boolean(error)}
                  />
                  <ErrorText error={error} />
                </FormItem>
              )}
            </FormField>

            <FormField name="consent">
              {({ error }) => (
                <FormItem>
                  <FormLabel className="sr-only">Consentimento</FormLabel>
                  <ConsentCheckbox
                    checked={Boolean(consentValue)}
                    onCheckedChange={(checked) => form.setValue('consent', checked, { shouldValidate: true })}
                  />
                  <ErrorText error={error} />
                </FormItem>
              )}
            </FormField>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => goToStep(1)} className="sm:w-auto">
                Voltar aos horários
              </Button>
              <Button
                type="submit"
                className="sm:w-auto"
                disabled={!selectedService || !selectedSlot || form.formState.isSubmitting || createAppointment.isPending}
              >
                {createAppointment.isPending ? 'Confirmando...' : 'Confirmar agendamento'}
              </Button>
            </div>
            {serverError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            ) : null}
          </Form>
        </FormProvider>
      </section>

      {confirmation ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" /> Agendamento registrado
            </CardTitle>
            <CardDescription className="text-emerald-900/70">
              Enviamos o token público para consulta/cancelamento do agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> {confirmation.customerName ?? 'Cliente sem nome informado'}
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" /> {confirmation.customerPhone}
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(confirmation.startsAt), "PPP 'às' HH:mm", { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
