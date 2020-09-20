import { MonoTypeOperatorFunction, PartialObserver, Observer } from 'rxjs';
/**
 *
 * @param parentId
 * @param id
 */
export declare function watch<T>(parentId: string, id?: string): MonoTypeOperatorFunction<T>;

