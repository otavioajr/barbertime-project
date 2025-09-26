import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function ConsentCheckbox({ checked, onCheckedChange, className }: ConsentCheckboxProps): JSX.Element {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 text-sm', className)}>
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(Boolean(value))} className="mt-1" />
      <span className="text-muted-foreground">
        Concordo em receber notificações sobre meu agendamento e compreendo os termos de uso e privacidade.
      </span>
    </label>
  );
}
