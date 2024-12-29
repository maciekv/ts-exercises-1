export {}
declare global {
    namespace TypeUtils {
        type ValueOf<T> = T[keyof T]
    }   
}


// namespace TypeUtils {
//     export type ValueOf<T> = T[keyof T];
// }
