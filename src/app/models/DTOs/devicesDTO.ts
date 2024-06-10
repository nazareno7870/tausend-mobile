export class DeviceDTO {
  Description!: string;
  DeviceId!: number;
  IsOnline!: boolean;
  Mac!: string;
  Pin!: string;
}

export class SMSDeviceDTO {
  Description!: string;
  DeviceId!: number;
  IsOnline!: boolean;
  Mac!: string;
  Pin!: string;
  PhoneNumber!: string;
  PinSMS!: string;
}
