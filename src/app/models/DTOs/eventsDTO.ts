import { ResponseDTO } from "./responseDTO";

export class EventDTO {
    AlarmIdentifier: any;
    AlarmParameter!: number;
    EventDateTime!: string;
    EventId!: number;
    EventType: any;
    NotificationType!: number;
    Partition!: number;
    Secuence!: number;
    Text!: string;
    Date?: Date;
    StringDate!: string;
}

export class EventsResponseDTO extends ResponseDTO {
    Events!: EventDTO[];
}
