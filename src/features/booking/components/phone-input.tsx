import * as React from 'react';
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

import { Input, type InputProps } from '@/components/ui/input';

interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: CountryCode;
}

function formatDisplayValue(value: string, defaultCountry: CountryCode): string {
  if (!value) {
    return '';
  }

  const parsed = parsePhoneNumberFromString(value, defaultCountry);
  return parsed ? parsed.formatInternational() : value;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, defaultCountry = 'BR', ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(() => formatDisplayValue(value, defaultCountry));

    React.useEffect(() => {
      setDisplayValue(formatDisplayValue(value, defaultCountry));
    }, [value, defaultCountry]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const digitsOnly = rawValue.replace(/\D/g, '');

      if (!digitsOnly) {
        setDisplayValue('');
        onChange('');
        return;
      }

      const typer = new AsYouType(defaultCountry);
      const formatted = typer.input(rawValue);
      const number = typer.getNumber();

      setDisplayValue(formatted);
      onChange(number ? number.number : `+${digitsOnly}`);
    };

    return <Input ref={ref} inputMode="tel" value={displayValue} onChange={handleChange} {...props} />;
  },
);
PhoneInput.displayName = 'PhoneInput';
