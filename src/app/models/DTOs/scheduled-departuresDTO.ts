import { ResponseDTO } from "./responseDTO";

export class ScheduleMiniDTO {
    Name!: string;
    ProgramControlNumber!: number;
}

export class ScheduleDTO extends ScheduleMiniDTO {
    Activated!: boolean;
    DeviceId!: number;
    ProgramControlId!: number;
    Color?: string;
}

export class ScheduleResponseDTO extends ResponseDTO {
    ProgramControls!: ScheduleDTO[];
}
