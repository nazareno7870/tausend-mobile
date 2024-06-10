import { DeviceDTO, SMSDeviceDTO } from "./devicesDTO";
import { ResponseDTO } from "./responseDTO";

export class AccountDTO {
  AccessToken!: string;
  Devices!: DeviceDTO[];
  Email!: string;
  FirstName!: string;
  LastName!: string;
  Password!: string;
  DeviceSelected!: number;
  isSMS!: boolean;
  SMSDevices!: SMSDeviceDTO[];
  version!: string;
}

export class LoginResponseDTO extends ResponseDTO {
  Account!: AccountDTO;
}

export class CreateUserDTO {
  UserName!: string;
  UserNumber!: number;
}

export class UserDTO {
  DeviceId!: number;
  UserId!: number;
  UserName!: string;
  UserNumber!: number;
}

export class UserResponseDTO extends ResponseDTO {
  Users!: UserDTO[];
}
