import { SubTypeReference, TypeDefinition, TypeDescriptor } from "./types";
import * as TypeDefinitions from "./def-td";

type TypeByName<T> = { [name: string]: T };
type TypeByNum<T> = { [name: number]: T };

export class TypeRegistry {
    private static instance: TypeRegistry;

    private coreTypeByName: TypeByName<TypeDescriptor> = {};
    private customTypeByName: { [v: number]: TypeByName<TypeDescriptor> } = {};

    private coreMsgByTypeNum: TypeByNum<TypeDescriptor> = {};
    private customMsgByTypeNum: { [v: number]: TypeByNum<TypeDescriptor> } = {};

    private coreParamByTypeNum: TypeByNum<TypeDescriptor> = {};
    private customParamByTypeNum: { [v: number]: TypeByNum<TypeDescriptor> } = {};

    private coreTypeDefinitions: TypeByName<TypeDefinition> = {};
    private customTypeDefinitions: { [v: number]: TypeByName<TypeDefinition> } = {};

    private vendorIdList: number[] = [];

    private reset() {
        this.coreTypeDefinitions
            = this.customTypeDefinitions
            = this.coreTypeByName
            = this.coreMsgByTypeNum
            = this.customTypeByName
            = this.customMsgByTypeNum
            = {};
        this.vendorIdList = [];
    }

    private getTypeDefinitionByName(name: string) {
        return this.coreTypeDefinitions[name] || null;
    }

    private convertToTypeDescriptor(def: TypeDefinition) {
        let td: TypeDescriptor = {
            ...def,
            responseType: undefined,
            subTypeRefs: [] as SubTypeReference[]
        };
        if (def.responseType) {
            let responseType = this.getTypeDefinitionByName(def.responseType);
            if (!responseType) throw new Error(`no response definition found for message ${def.name}`);
            td.responseType = responseType as any;
        }
        for (let tRefDef of def.subTypeRefs) {
            let tRef: SubTypeReference = {
                ...tRefDef,
                td: {} as TypeDescriptor,
                choices: undefined
            }
            let subTd = this.getTypeDefinitionByName(tRefDef.td);
            if (!subTd) throw new Error(`no type definition found for sub-ref ${tRefDef.td}`);
            tRef.td = subTd as any;

            if (tRefDef.choices) {
                tRef['choices'] = [];
                for (let choiceName of tRefDef.choices) {
                    let choiceTd = this.getTypeDefinitionByName(choiceName);
                    if (!choiceTd) throw new Error(`no type definition found for choice ${choiceName}`);
                    tRef.choices.push(choiceTd as any);
                }
            } else {
                tRef['choices'] = undefined;
            }

            td.subTypeRefs.push(tRef);
        }
        return td;
    }

    private enrollCoreDef(tDef: TypeDefinition) {
        this.coreTypeDefinitions[tDef.name] = tDef;
        return this;
    }

    private enrollCoreDefinitions() {
        for (let key in TypeDefinitions) {
            let tDef = TypeDefinitions[key];
            this.enrollCoreDef(tDef);
        }
        return this;
    }

    private enrollCore(td: TypeDescriptor) {
        if (td.typeNum < 0) return this;
        this.coreTypeByName[td.name] = td;
        if (td.isMessage)
            this.coreMsgByTypeNum[td.typeNum] = td;
        else
            this.coreParamByTypeNum[td.typeNum] = td;
        return this;
    }

    private enrollCustom(td: TypeDescriptor) {
        if (td.typeNum < 0) return this;
        let vendorId = td.vendorDescriptor.vendorID;
        if (!this.customTypeByName[vendorId]) {
            this.customTypeByName[vendorId] = {};
        }
        this.customTypeByName[vendorId][td.name] = td;

        if (td.isMessage) {
            if (!this.customMsgByTypeNum[vendorId])
                this.customMsgByTypeNum[vendorId] = {};
            this.customMsgByTypeNum[vendorId][td.typeNum] = td;
        } else {
            if (!this.customParamByTypeNum[vendorId])
                this.customParamByTypeNum[vendorId] = {};
            this.customParamByTypeNum[vendorId][td.typeNum] = td;
        }
        return this;
    }

    private constructor() { }        // constructor needs to be private to force consumers to use it as a singlton

    public static getInstance() {
        if (!TypeRegistry.instance) {
            TypeRegistry.instance = new TypeRegistry();
        }
        return TypeRegistry.instance;
    }

    build() {
        this.enrollCoreDefinitions();
        for (let key in this.coreTypeDefinitions) {
            let tDef = this.coreTypeDefinitions[key];
            let td = this.convertToTypeDescriptor(tDef);
            this.enrollCore(td);
        }
        for (let vendorId of this.vendorIdList) {
            for (let key in this.customTypeDefinitions) {
                let tDef = this.customTypeDefinitions[vendorId][key];
                let td = this.convertToTypeDescriptor(tDef);
                this.enrollCustom(td);
            }
        }
        return this;
    }

    enrollCustomDef(tDef: TypeDefinition) {
        if (tDef.typeNum > 1023 || tDef.typeNum < 0)
            throw new Error(`Bad typeNum ${tDef.typeNum}`);
        let vendorId = tDef.vendorDescriptor.vendorID;
        if (!this.customTypeDefinitions[vendorId]) {
            this.customTypeDefinitions[vendorId] = {};
        }
        this.customTypeDefinitions[vendorId][tDef.name] = tDef;
        this.vendorIdList.push(vendorId);
        return this;
    }

    getMsgTypeByTypeNum(typeNum: number) {
        return this.coreMsgByTypeNum[typeNum] || null;
    }

    getParamTypeByTypeNum(typeNum: number) {
        return this.coreParamByTypeNum[typeNum] || null;
    }

    getTypeDescByName(name: string) {
        return this.coreTypeByName[name] || null;
    }

    /** custom elements */
    getCustomTypeDescByTypeNum(vendorID: number, typeNum: number) {
        return this.customMsgByTypeNum[vendorID]?.[typeNum] || null;
    }

    getCustomTypeDescByName(vendorID: number, name: string) {
        return this.customTypeByName[vendorID]?.[name] || null;
    }
}

