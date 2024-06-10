import { ResponseDTO } from "./responseDTO";

export class ZoneMiniDTO {
    Name!: string;
    ZoneNumber!: number;
}
export class ZoneDTO extends ZoneMiniDTO {
    DeviceId!: number;
    Excluded!: boolean;
    Open!: boolean;
    ZoneId!: number;
    Color?: string;
}

export class ZonesResponseDTO extends ResponseDTO {
    Zones!: ZoneDTO[];
}

export class ExclusionZoneMiniDTO {
    Name!: string;
    ExclusionNumber!: number;
}

export class ExclusionDTO extends ExclusionZoneMiniDTO {
    DeviceId!: number;
    Excluded!: boolean;
    ExclusionId!: number;
    Open!: boolean;
    Color?: string;
}

export class ZonesExclusionsResponseDTO extends ResponseDTO {
    Exclusions!: ExclusionDTO[];
}
