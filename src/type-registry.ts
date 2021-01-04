import { TypeDescriptor } from "./types";

export class TypeRegistry {
    private static instance: TypeRegistry;

    private coreMessageTypeDescriptors: Array<TypeDescriptor>;
    private coreParameterTypeDescriptors: Array<TypeDescriptor>;

    private customMessageTypeDescriptors: Array<TypeDescriptor>;
    private customParameterTypeDescriptors: Array<TypeDescriptor>;

    private constructor() {
        this.coreMessageTypeDescriptors = [];
        this.coreParameterTypeDescriptors = [];
        this.customMessageTypeDescriptors = [];
        this.customParameterTypeDescriptors = [];
    }

    public static getInstance(): TypeRegistry {
        if (!TypeRegistry.instance) {
            TypeRegistry.instance = new TypeRegistry();
        }
        return TypeRegistry.instance;
    }

    enroll(td: TypeDescriptor): void {
        if (td.vendorDescriptor == null) {
            if (td.typeNum > 1023)
                throw new Error(`Bad typeNum ${td.typeNum}`);

            /** standard element */
            if (td.isMessage)
                this.coreMessageTypeDescriptors.push(td);
            else
                this.coreParameterTypeDescriptors.push(td);
        } else
            /** custom element */
            if (td.isMessage)
                this.customMessageTypeDescriptors.push(td);
            else
                this.customParameterTypeDescriptors.push(td);
    }

    getMessageByTypeNum(typeNum: number): TypeDescriptor | null {
        return this.coreMessageTypeDescriptors
            .filter(td => td.typeNum == typeNum)[0];
    }

    getParameterByTypeNum(typeNum: number): TypeDescriptor | null {
        return this.coreParameterTypeDescriptors
            .filter(td => td.typeNum == typeNum)[0];
    }

    getMessageByName(name: string): TypeDescriptor | null {
        return this.coreMessageTypeDescriptors
            .filter(td => td.name == name)[0];
    }

    getParameterByName(name: string): TypeDescriptor | null {
        return this.coreParameterTypeDescriptors
            .filter(td => td.name == name )[0];
    }

    /** custom elements */
    getCustomMessageByTypeNum(vendorID: number, typeNum: number): TypeDescriptor | null {
        return this.customMessageTypeDescriptors
            .filter(td=>(td.vendorDescriptor.vendorID == vendorID) && (td.typeNum == typeNum))[0];
    }

    getCustomParameterByTypeNum(vendorID: number, typeNum: number): TypeDescriptor | null {
        return this.customParameterTypeDescriptors
            .filter(td=>(td.vendorDescriptor.vendorID == vendorID) && (td.typeNum == typeNum))[0];
    }

    getCustomMessageByName(vendorID: number, name: string): TypeDescriptor | null {
        return this.customMessageTypeDescriptors
            .filter(td=>(td.vendorDescriptor.vendorID == vendorID) && (td.name == name))[0];
    }

    getCustomParameterByName(vendorID: number, name: string): TypeDescriptor | null {
        return this.customParameterTypeDescriptors
            .filter(td=>(td.vendorDescriptor.vendorID == vendorID) && (td.name == name))[0];
    }
}