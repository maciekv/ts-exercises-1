import { DateString, Employee, exampleEmployee, exampleProject, Office } from "./types";

type Money = {
    amount: number;
    currency: string; 
}
type Project = {
    id: number;
    name: string;
    price?: Money;
    tags: {
        name: string;
        id: number;
    }[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

 

// exampleProject.id // runtime
// const X1 = Project['id']; // compile-time (indexing)

// type ValueOf<T> = T[keyof T];
                    //Project['id']

// type ValueOfProject = ValueOf<Project>;
type ValueOfProject2 = TypeUtils.ValueOf<Project>;

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//  function prop<T>(obj: T, key: keyof T) { // WRONG
function prop<T, K extends keyof T>(obj: T, key: K) {
                            // K is subtype of keyof T
    return obj[key];
}

const productInfo = prop(exampleEmployee, 'personalInfo')
type a = NonNullable<Project>
type Unfold_<T> = string & T;
type Unfold<T> = {} & T; // {} reprezentuje prawie any - bez null i undefined
type StringLiteralUnion = keyof Employee;
type UnfoldedKeys = Unfold<StringLiteralUnion>;
type UnfoldedKeys2 = Unfold<keyof Employee>;

type X3<T> = T extends `${infer U}` ? U : never;
// Typ X3<T> sprawdza, czy T jest stringiem (lub pasuje do szablonu stringa). 
// Jeśli tak, wyodrębnia zawartość stringa jako typ wynikowy; w przeciwnym razie zwraca never.
// ${infer U} a string
//  a)  T extends string:
// Sprawdza tylko, czy T jest dowolnym stringiem (np. "hello", "world", string).
// b) T extends ${infer U}``:
// Dodatkowo próbuje dopasować T do szablonu stringowego i wyodrębnić pasującą zawartość jako U.

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// !!!!! ${infer U} pozwala wyodrębnić część literalnego stringa, która pasuje do wzorca.
type ExtractPart<T> = T extends `${infer U}-${string}` ? U : never;

type Result1 = ExtractPart<"user-123">; // "user"
type Result2 = ExtractPart<"admin-456">; // "admin"
type Result3 = ExtractPart<"no-dash-here">; // "no"
type Result4 = ExtractPart<number>; // never
type Result5 = ExtractPart<'asdad'>; // never

type Result6 = Extract<keyof Project, 'id'  >

///////////////////////////////////////////////////////////////
type Reveal<T> = {} & { [P in keyof T]: T[P] };

type Example1 = { a: number } & { b: string } & { c: boolean }
type Example2 = Record<keyof Office, string>
type Example3 = Record<string, number>
interface Example4 { name: string, age: number }

type Revealed1 = Reveal<Example1>
type Revealed2 = Reveal<Example2>
type Revealed3 = Reveal<Example3>
type Revealed4 = Reveal<Example4>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// {} Obejmuje on wszystkie obiekty, tablice, funkcje, klasy, a także prymitywy jak string, number, boolean, itp., ale wyklucza null i undefined.

type NonNullable<T> = T & {};// Exclude null and undefined from T
let a: {};
let b: object;

a = {};           // OK
b = {};           // OK

a = 42;           // OK (prymitywy są dozwolone w `{}`)
// b = 42;           // Błąd (prymitywy nie są zgodne z `object`)

// a = null;         // Błąd
// b = null;         // Błąd

////////////////////////////////////////////////////////////////////////////////////////////////////////

// 🚀 EXERCISE: write a function's signature which accepts all strings, 
// but TSServer prompts (via intellisense) only "red" and "yellow" values
function setColor(colorStr: string & {} | 'red' | 'yellow') {}
setColor('red')
setColor('green')
setColor('blue') // X

//////////////////////////////////////////////////////////////////////////////////////////////////////
// 🚀 EXERCISE: create types which extract string and number values

type SomeGarbage = "yes" | "no" | 0 | 1 | true | false | undefined
type StringValues = string & SomeGarbage // expected: "yes" | "no"
type StringValues2 = Extract<SomeGarbage, string>; // expected: "yes" | "no"
// type StringValues_ =  // expected: "yes" | "no"
type NumberValues =  number & SomeGarbage//     expected: 0 | 1
type NumberOsStringValues =  Extract<SomeGarbage, number | string>//     expected: 0 | 1
type NumberOsStringValues2 =  SomeGarbage  &  (number | string);


// 🚀 EXERCISE: create a type which filters out the types which don't contain the "region" attribute

type Occupation =
  | { name: string, experience: number } // X
  | { specialty: string, region: string } // ✅
  | { id: number, region: number } // ✅
  | { name: string, specialty: string, department: string } // X

type RegionOccupations = Extract<Occupation, { region: unknown }>
type RegionOccupations_WRONG = Occupation & { region: unknown }
const regionPass1: RegionOccupations = { specialty: 'Dentist', region: 'Europe' }
const regionPass2: RegionOccupations = { id: 1234, region: 56789 }
// @ts-expect-error - ❌ `region` is missing
const regionFail1: RegionOccupations = { name: 'Dentist', experience: 123456 } // 
// @ts-expect-error - ❌ such member doesn't exist on the union
const regionFail2: RegionOccupations = { name: 'Dentist', experience: 123456, region: {} }


//////////////////////////////////////

// 🚀 EXERCISE: create a type which extracts Doctors from the union

type SomeOccupations = // DISCRIMINATED union
  | {
    type: "DEVELOPER", // discriminant property
    languages: string[]
  } | {
    type: "DOCTOR"
    specialty: string
    worksAtNightShifts: boolean
  }

type OnlyDoctors = Extract<SomeOccupations, { type: "DOCTOR" }>
type OnlyDoctors_ = SomeOccupations & { type: "DOCTOR" }

const someFolks: SomeOccupations[] = [
  { type: "DEVELOPER", languages: ['JavaScript'] },
  { type: "DOCTOR", specialty: 'surgeon', worksAtNightShifts: true },
] // ✅ both expected to pass, initially they do

const onlyDoctors: OnlyDoctors[] = [
  // @ts-expect-error - ❌ DEVELOPER is NOT assignable to OnlyDoctors
  { type: "DEVELOPER", languages: ['JavaScript'] },
  { type: "DOCTOR", specialty: 'surgeon', worksAtNightShifts: true }, // ✅ DOCTOR assignable to OnlyDoctors
]

// 🚀 EXERCISE: same as above, but make it generic

type Lookup<TObjectUnion, TType> = Extract<TObjectUnion, { type: TType }>

type Developers = Lookup<SomeOccupations, "DEVELOPER">
type Doctors = Lookup<SomeOccupations, "DOCTOR">