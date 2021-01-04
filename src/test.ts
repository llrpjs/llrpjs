import { ClassUnion, MixinAny } from "./bryntum/chronograph/BetterMixin"

type StringOrNum = string | number;
type GetMyMixinType<T extends StringOrNum> = 
    T extends string ? "Normal": "Dec"
type GetMyMixin1Type<T extends StringOrNum> =
    T extends string ? void: string;


/** MyBase */

class MyBase<T extends StringOrNum> {
    a: T;

    printA() {
        console.log(this.a);
    }
}

interface MyBase<T extends StringOrNum> {
    a: T;
}

/** MyMixin */

class MyMixin<T extends StringOrNum> extends MixinAny(
    [MyBase],
    (base: ClassUnion<typeof MyBase>) =>
    class MyMixin extends base {
        MyMixinType: any;

        b: this['MyMixinType'];

        setB(b: this['MyMixinType']) {
            this.b = b;
        }

        printB() {
            console.log(this.b);
        }
    }
) {}

interface MyMixin<T extends StringOrNum> {
    MyMixinType: GetMyMixinType<T>;
}

/** MyMixin1 */
class MyMixin1<T extends StringOrNum> extends MixinAny(
    [MyMixin],
    (base: ClassUnion<typeof MyMixin>) =>
    class MyMixin1 extends base {
        MyMixin1Type: any;

        c: this['MyMixin1Type'];

        printC() {
            console.log(this.c);
        }

        printAll() {
            this.printA();
            this.printB();
            this.printC();
        }

        setAll(a: this['a'], b: this['b'], c: this['c']) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
    }
) {}

interface MyMixin1<T extends StringOrNum> {
    a: T;
    MyMixinType: GetMyMixinType<T>;
    MyMixin1Type: GetMyMixin1Type<T>;
}

/** test */

let i = new MyMixin1<number>(Object);
i.a = 0;
i.b = "Dec";
i.c = "ENUM";
i.setAll(20, "Dec", "Some_Enum");
i.printAll();