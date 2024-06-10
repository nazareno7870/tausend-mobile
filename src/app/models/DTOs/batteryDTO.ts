import { ResponseDTO } from "./responseDTO";

export class BatteryResponseDTO extends ResponseDTO {
    ChargeTension!: number;
    Current!: number;
    InTension!: number;
    TestTension!: number;
}
