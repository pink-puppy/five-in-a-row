import { Message } from "lib/protocol";

export default abstract class Processor {
    abstract handle(message: Message): void;
    abstract enter(): void;
    abstract leave(): void;
    abstract hungup(): void;
}