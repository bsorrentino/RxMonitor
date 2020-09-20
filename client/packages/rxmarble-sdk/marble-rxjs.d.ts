import { MonoTypeOperatorFunction, PartialObserver, Observer } from 'rxjs';
/**
 *
 * @param parentId
 * @param id
 */
export declare function watch<T>(parentId: string, id?: string): MonoTypeOperatorFunction<T>;
/**
 *
 * @param observer
 * @param id
 * @param parentId
 */
export declare function observeAndNotify<T>(observer: Observer<T>, id: string, parentId?: string): PartialObserver<T>;
