import { ResponseDTO } from "./responseDTO";

export class FailureDTO extends ResponseDTO {
    AC: boolean = false;
    BAT: boolean = false;
    BELL1: boolean = false;
    BELL2: boolean = false;
    BUS: boolean = false;
    CEL: boolean = false;
    CLOCK: boolean = false;
    COMU: boolean = false;
    TLM: boolean = false;
    VAUX: boolean = false;
}
