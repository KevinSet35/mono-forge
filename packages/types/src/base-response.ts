// export enum ResponseStatus {
//     SUCCESS = "success",
//     ERROR = "error",
// }

// export type Error = {
//     code: number;
//     message: string;
//     details?: string;
// };

// export interface ApiResponse<T = null> {
//     status: ResponseStatus;
//     data?: T; // Present only in success responses
//     error?: {
//         // Present only in error responses
//         code: number;
//         message: string;
//         details?: string;
//     };
//     meta: {
//         timestamp: string;
//         path: string;
//         method: string | undefined;
//     };
// }